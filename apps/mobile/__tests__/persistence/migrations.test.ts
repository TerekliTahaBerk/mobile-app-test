import { LATEST_SCHEMA_VERSION, migrateToLatest } from '@/modules/progress/infrastructure/migrations';
import { createSqliteRepositories } from '@/modules/progress/infrastructure/sqlite-repositories';

import { createTestDatabase } from '../support/node-sqlite-database';

async function installProfileV2Snapshot(db: ReturnType<typeof createTestDatabase>) {
  await db.execAsync(`
    CREATE TABLE sessions (
      session_id TEXT PRIMARY KEY NOT NULL,
      kind TEXT NOT NULL,
      lesson_id TEXT NOT NULL,
      path_node_id TEXT,
      content_version TEXT NOT NULL,
      status TEXT NOT NULL,
      current_exercise_index INTEGER NOT NULL DEFAULT 0,
      snapshot TEXT NOT NULL,
      snapshot_version INTEGER NOT NULL,
      started_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      completed_at TEXT
    );
    CREATE TABLE learner_profile (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      display_name TEXT NOT NULL,
      avatar_id TEXT NOT NULL,
      exam TEXT NOT NULL,
      track TEXT,
      grade TEXT NOT NULL,
      target_year INTEGER NOT NULL,
      referral_source TEXT,
      daily_goal INTEGER NOT NULL,
      starting_point TEXT NOT NULL,
      reminders_enabled INTEGER NOT NULL DEFAULT 0,
      reminder_time TEXT,
      completed_at TEXT NOT NULL
    );
    PRAGMA user_version = 2;
  `);
}

async function installProfileV5Snapshot(db: ReturnType<typeof createTestDatabase>) {
  await db.execAsync(`
    CREATE TABLE learner_profile (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      display_name TEXT,
      avatar_id TEXT,
      exam TEXT,
      track TEXT,
      grade TEXT,
      target_year,
      referral_source TEXT,
      daily_goal INTEGER,
      starting_point TEXT,
      reminders_enabled INTEGER,
      reminder_time TEXT,
      completed_at TEXT,
      weekly_report_day INTEGER
    );
    PRAGMA user_version = 5;
  `);
}

describe('migrations', () => {
  it('brings a fresh database to the latest schema version', async () => {
    const db = createTestDatabase();

    await expect(migrateToLatest(db)).resolves.toBe(LATEST_SCHEMA_VERSION);

    const version = await db.getFirstAsync<{ user_version: number }>('PRAGMA user_version;');
    expect(version?.user_version).toBe(LATEST_SCHEMA_VERSION);
  });

  it('creates every learner-state table', async () => {
    const db = createTestDatabase();
    await migrateToLatest(db);

    const tables = await db.getAllAsync<{ name: string }>(
      `SELECT name FROM sqlite_master WHERE type = 'table' ORDER BY name`,
    );

    expect(tables.map((table) => table.name)).toEqual(
      expect.arrayContaining([
        'attempts',
        'daily_activity',
        'mistakes',
        'question_reports',
        'path_progress',
        'review_items',
        'sessions',
        'skill_mastery',
        'xp_transactions',
      ]),
    );
  });

  it('upgrades a schema-v2 TYT Sosyal snapshot without changing its experience', async () => {
    const db = createTestDatabase();
    await installProfileV2Snapshot(db);

    await db.runAsync(
      `INSERT INTO learner_profile (
         id, display_name, avatar_id, exam, grade, target_year, daily_goal,
         starting_point, completed_at
       ) VALUES (1, 'Ege', 'initial', 'yks', 'grade12', 2027, 3, 'scratch', '2026-08-28T10:00:00.000Z')`,
    );
    await migrateToLatest(db);

    await expect(createSqliteRepositories(db).profile.read()).resolves.toMatchObject({
      displayName: 'Ege',
      examProfile: {
        family: 'yks',
        grade: 'grade12',
        program: 'tyt',
        targetYear: 2027,
      },
      weeklyReportDay: 0,
    });
  });

  it('upgrades a schema-v5 YKS profile deterministically and retains its source row', async () => {
    const db = createTestDatabase();
    await installProfileV5Snapshot(db);
    await db.runAsync(
      `INSERT INTO learner_profile VALUES (
        1, 'Ege', 'dino', 'yks', 'verbal', 'graduate', 2028, 'friend',
        6, 'placement', 1, '22:00', '2026-08-28T10:00:00.000Z', 5
      )`,
    );

    await migrateToLatest(db);

    await expect(createSqliteRepositories(db).profile.read()).resolves.toEqual({
      avatarId: 'dino',
      completedAtIso: '2026-08-28T10:00:00.000Z',
      dailyGoal: 6,
      displayName: 'Ege',
      examProfile: {
        family: 'yks',
        grade: 'graduate',
        program: 'tyt',
        targetYear: 2028,
        track: 'verbal',
      },
      referralSource: 'friend',
      reminderTime: '22:00',
      remindersEnabled: true,
      startingPoint: 'placement',
      weeklyReportDay: 5,
    });
    await expect(
      db.getFirstAsync('SELECT exam, track, grade, target_year FROM learner_profile_v1_backup'),
    ).resolves.toEqual({ exam: 'yks', grade: 'graduate', target_year: 2028, track: 'verbal' });
  });

  it('keeps unknown and partial legacy values without guessing, and safely requests onboarding', async () => {
    const db = createTestDatabase();
    await installProfileV5Snapshot(db);
    await db.runAsync(
      `INSERT INTO learner_profile VALUES (
        1, '', 'lost-avatar', 'future-exam', 'mystery-track', NULL, 'not-a-year', NULL,
        99, NULL, 7, 'midnight', NULL, NULL
      )`,
    );

    await expect(migrateToLatest(db)).resolves.toBe(LATEST_SCHEMA_VERSION);
    await expect(createSqliteRepositories(db).profile.read()).resolves.toBeNull();
    await expect(
      db.getFirstAsync('SELECT exam, track, grade, target_year FROM learner_profile_v1_backup'),
    ).resolves.toEqual({
      exam: 'future-exam',
      grade: null,
      target_year: 'not-a-year',
      track: 'mystery-track',
    });
    await expect(
      db.getFirstAsync<{ migration_status: string }>(
        'SELECT migration_status FROM learner_profile WHERE id = 1',
      ),
    ).resolves.toEqual({ migration_status: 'needsOnboarding' });
  });

  it('does not reinterpret a legacy LGS row with a YKS-only grade', async () => {
    const db = createTestDatabase();
    await installProfileV5Snapshot(db);
    await db.runAsync(
      `INSERT INTO learner_profile VALUES (
        1, 'Ege', 'initial', 'lgs', NULL, 'grade9', 2027, NULL,
        3, 'scratch', 0, NULL, '2026-08-28T10:00:00.000Z', 0
      )`,
    );

    await migrateToLatest(db);

    await expect(createSqliteRepositories(db).profile.read()).resolves.toBeNull();
    await expect(
      db.getFirstAsync(
        `SELECT migration_status, exam_family, exam_program, exam_grade
         FROM learner_profile WHERE id = 1`,
      ),
    ).resolves.toEqual({
      exam_family: 'lgs',
      exam_grade: null,
      exam_program: 'lgs',
      migration_status: 'needsOnboarding',
    });
    await expect(
      db.getFirstAsync('SELECT exam, grade FROM learner_profile_v1_backup WHERE id = 1'),
    ).resolves.toEqual({ exam: 'lgs', grade: 'grade9' });
  });

  it('treats a corrupt partial v2 row as absent instead of throwing', async () => {
    const db = createTestDatabase();
    await migrateToLatest(db);
    await db.runAsync(
      `INSERT INTO learner_profile (
        id, schema_version, migration_status, display_name, exam_family, exam_program
      ) VALUES (1, 2, 'ready', NULL, 'yks', 'tyt')`,
    );

    await expect(createSqliteRepositories(db).profile.read()).resolves.toBeNull();
  });

  it('adds durable purpose/context defaults without losing legacy sessions', async () => {
    const db = createTestDatabase();
    await migrateToLatest(db);

    const columns = await db.getAllAsync<{ name: string }>('PRAGMA table_info(sessions);');
    expect(columns.map((column) => column.name)).toEqual(
      expect.arrayContaining(['purpose', 'context']),
    );
  });

  it('is idempotent: running again applies nothing and preserves data', async () => {
    const db = createTestDatabase();
    await migrateToLatest(db);

    await db.runAsync(
      `INSERT INTO path_progress (path_node_id, status, completion_count) VALUES (?, 'completed', 1)`,
      ['path.test.001'],
    );

    await expect(migrateToLatest(db)).resolves.toBe(LATEST_SCHEMA_VERSION);

    const row = await db.getFirstAsync<{ completion_count: number }>(
      'SELECT completion_count FROM path_progress WHERE path_node_id = ?',
      ['path.test.001'],
    );
    expect(row?.completion_count).toBe(1);
  });
});
