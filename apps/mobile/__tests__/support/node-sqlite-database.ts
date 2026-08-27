import { DatabaseSync } from 'node:sqlite';

import type * as SQLite from 'expo-sqlite';

/**
 * A real SQLite engine for tests.
 *
 * `expo-sqlite` is a native module and cannot load under Jest, so this adapter
 * presents the same async surface over Node's built-in SQLite. The schema,
 * migrations, constraints, upserts, and transaction semantics under test are
 * therefore exercised against a genuine database — not a mock that would only
 * prove the test's own assumptions. What it does *not* prove is the native
 * binding on device; that is covered by manual iOS QA.
 */

type RunResult = { changes: number; lastInsertRowId: number };

type BindValue = number | string | null;

function toBindValues(params: readonly unknown[]): BindValue[] {
  return params.map((param) => {
    if (param === null || param === undefined) {
      return null;
    }

    if (typeof param === 'number' || typeof param === 'string') {
      return param;
    }

    if (typeof param === 'boolean') {
      return param ? 1 : 0;
    }

    throw new TypeError(`Unsupported bind value: ${String(param)}`);
  });
}

class NodeSqliteDatabase {
  private readonly db: DatabaseSync;

  constructor(location = ':memory:') {
    this.db = new DatabaseSync(location);
  }

  execAsync = async (sql: string): Promise<void> => {
    this.db.exec(sql);
  };

  runAsync = async (sql: string, params: readonly unknown[] = []): Promise<RunResult> => {
    const result = this.db.prepare(sql).run(...toBindValues(params));

    return {
      changes: Number(result.changes),
      lastInsertRowId: Number(result.lastInsertRowid),
    };
  };

  getFirstAsync = async <T>(sql: string, params: readonly unknown[] = []): Promise<T | null> => {
    const row = this.db.prepare(sql).get(...toBindValues(params));

    return (row as T | undefined) ?? null;
  };

  getAllAsync = async <T>(sql: string, params: readonly unknown[] = []): Promise<T[]> => {
    return this.db.prepare(sql).all(...toBindValues(params)) as T[];
  };

  withTransactionAsync = async (task: () => Promise<void>): Promise<void> => {
    this.db.exec('BEGIN');
    try {
      await task();
      this.db.exec('COMMIT');
    } catch (error) {
      this.db.exec('ROLLBACK');
      throw error;
    }
  };

  withExclusiveTransactionAsync = async (
    task: (txn: NodeSqliteDatabase) => Promise<void>,
  ): Promise<void> => {
    this.db.exec('BEGIN IMMEDIATE');
    try {
      await task(this);
      this.db.exec('COMMIT');
    } catch (error) {
      this.db.exec('ROLLBACK');
      throw error;
    }
  };

  closeAsync = async (): Promise<void> => {
    this.db.close();
  };
}

/** A migrated-on-demand in-memory database, typed as the real thing. */
export function createTestDatabase(): SQLite.SQLiteDatabase {
  return new NodeSqliteDatabase() as unknown as SQLite.SQLiteDatabase;
}
