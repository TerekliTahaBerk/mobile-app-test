import { LATEST_SCHEMA_VERSION, migrateToLatest } from '@/modules/progress/infrastructure/migrations';

import { createTestDatabase } from '../support/node-sqlite-database';

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

  it('adds the weekly report day to an existing profile without losing it', async () => {
    const db = createTestDatabase();
    await migrateToLatest(db);

    await db.runAsync(
      `INSERT INTO learner_profile (
         id, display_name, avatar_id, exam, grade, target_year, daily_goal,
         starting_point, completed_at
       ) VALUES (1, 'Ege', 'initial', 'yks', 'grade12', 2027, 3, 'scratch', '2026-08-28T10:00:00.000Z')`,
    );

    const row = await db.getFirstAsync<{ display_name: string; weekly_report_day: number }>(
      'SELECT display_name, weekly_report_day FROM learner_profile WHERE id = 1',
    );

    // Sunday is the default, so a profile written before this column existed
    // keeps the behaviour it already had.
    expect(row).toMatchObject({ display_name: 'Ege', weekly_report_day: 0 });
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
