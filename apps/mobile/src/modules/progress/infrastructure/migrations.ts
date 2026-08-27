import type { SQLiteDatabase } from 'expo-sqlite';

/**
 * Explicit, ordered, idempotent migrations.
 *
 * `PRAGMA user_version` records how far the database has come; each migration
 * runs once, in order, inside a transaction. Schema is never created ad hoc
 * from a repository, and the database is never dropped to "migrate" — that
 * would delete the learner's progress, which is the one thing this module
 * exists to protect.
 */

type Migration = {
  name: string;
  up: (db: SQLiteDatabase) => Promise<void>;
  version: number;
};

const MIGRATIONS: readonly Migration[] = [
  {
    name: 'initial-learner-state',
    version: 1,
    up: async (db) => {
      await db.execAsync(`
        CREATE TABLE path_progress (
          path_node_id      TEXT PRIMARY KEY NOT NULL,
          status            TEXT NOT NULL,
          first_started_at  TEXT,
          first_completed_at TEXT,
          last_completed_at TEXT,
          completion_count  INTEGER NOT NULL DEFAULT 0
        );

        CREATE TABLE sessions (
          session_id             TEXT PRIMARY KEY NOT NULL,
          kind                   TEXT NOT NULL,
          lesson_id              TEXT NOT NULL,
          path_node_id           TEXT,
          content_version        TEXT NOT NULL,
          status                 TEXT NOT NULL,
          current_exercise_index INTEGER NOT NULL DEFAULT 0,
          snapshot               TEXT NOT NULL,
          snapshot_version       INTEGER NOT NULL,
          started_at             TEXT NOT NULL,
          updated_at             TEXT NOT NULL,
          completed_at           TEXT
        );
        CREATE INDEX sessions_status_idx ON sessions (status, updated_at DESC);

        CREATE TABLE attempts (
          id             TEXT PRIMARY KEY NOT NULL,
          session_id     TEXT NOT NULL REFERENCES sessions (session_id) ON DELETE CASCADE,
          lesson_id      TEXT NOT NULL,
          exercise_id    TEXT NOT NULL,
          answer         TEXT NOT NULL,
          correct        INTEGER NOT NULL,
          scored         INTEGER NOT NULL,
          attempt_number INTEGER NOT NULL,
          occurred_at    TEXT NOT NULL
        );
        CREATE INDEX attempts_session_idx ON attempts (session_id);

        CREATE TABLE xp_transactions (
          id                TEXT PRIMARY KEY NOT NULL,
          amount            INTEGER NOT NULL,
          reason            TEXT NOT NULL,
          lesson_id         TEXT,
          exercise_id       TEXT,
          path_node_id      TEXT,
          session_id        TEXT,
          occurred_at       TEXT NOT NULL,
          unique_source_key TEXT
        );
        -- The guarantee behind idempotent awards: a completion bonus carries a
        -- key derived from its source, so a retry collides instead of paying out
        -- twice.
        CREATE UNIQUE INDEX xp_unique_source_idx
          ON xp_transactions (unique_source_key)
          WHERE unique_source_key IS NOT NULL;

        CREATE TABLE skill_mastery (
          skill_id        TEXT PRIMARY KEY NOT NULL,
          alpha           REAL NOT NULL,
          beta            REAL NOT NULL,
          evidence_count  INTEGER NOT NULL DEFAULT 0,
          last_evidence_at TEXT,
          policy_version  INTEGER NOT NULL
        );

        CREATE TABLE review_items (
          skill_id         TEXT PRIMARY KEY NOT NULL,
          stage            INTEGER NOT NULL DEFAULT 0,
          due_at           TEXT NOT NULL,
          last_reviewed_at TEXT,
          updated_at       TEXT NOT NULL
        );
        CREATE INDEX review_due_idx ON review_items (due_at);

        CREATE TABLE mistakes (
          id                TEXT PRIMARY KEY NOT NULL,
          skill_id          TEXT NOT NULL,
          source_exercise_id TEXT NOT NULL,
          source_lesson_id  TEXT NOT NULL,
          status            TEXT NOT NULL,
          created_at        TEXT NOT NULL,
          resolved_at       TEXT
        );
        -- At most one open mistake per skill, so repeated misses update rather
        -- than pile up identical records.
        CREATE UNIQUE INDEX mistakes_open_skill_idx
          ON mistakes (skill_id)
          WHERE status = 'unresolved';

        CREATE TABLE daily_activity (
          local_date          TEXT PRIMARY KEY NOT NULL,
          time_zone           TEXT NOT NULL,
          qualifying_sessions INTEGER NOT NULL DEFAULT 0,
          xp_earned           INTEGER NOT NULL DEFAULT 0,
          first_activity_at   TEXT NOT NULL,
          last_activity_at    TEXT NOT NULL
        );
      `);
    },
  },
];

export const LATEST_SCHEMA_VERSION = MIGRATIONS.length;

export class MigrationError extends Error {
  constructor(migration: Migration, cause: unknown) {
    super(`Veritabanı göçü başarısız: ${migration.version}-${migration.name}. ${String(cause)}`);
    this.name = 'MigrationError';
  }
}

/**
 * Brings a database up to the latest schema. Safe to call on every launch and
 * safe to call twice: migrations already applied are skipped.
 */
export async function migrateToLatest(db: SQLiteDatabase): Promise<number> {
  await db.execAsync('PRAGMA foreign_keys = ON;');

  const row = await db.getFirstAsync<{ user_version: number }>('PRAGMA user_version;');
  let version = row?.user_version ?? 0;

  for (const migration of MIGRATIONS) {
    if (migration.version <= version) {
      continue;
    }

    try {
      await db.withTransactionAsync(async () => {
        await migration.up(db);
        // Keep the schema and its version marker in the same commit. If either
        // fails, the whole migration rolls back and the next launch can retry.
        // PRAGMA cannot be parameterised; this value is a module literal.
        await db.execAsync(`PRAGMA user_version = ${migration.version};`);
      });
      version = migration.version;
    } catch (cause) {
      throw new MigrationError(migration, cause);
    }
  }

  return version;
}
