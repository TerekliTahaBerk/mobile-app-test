import * as SQLite from 'expo-sqlite';

import { migrateToLatest } from '@/modules/progress/infrastructure/migrations';

/**
 * The learner's local database.
 *
 * One file, opened once per app process. Nothing here is deleted or recreated
 * to recover from an error: progress is the user's own record, and losing it
 * silently would be worse than surfacing a failure.
 */

export const DATABASE_NAME = 'tekrarla.db';

/**
 * WAL is enabled deliberately. Reads (home screen, İz strip, XP total) run
 * concurrently with the one exclusive write transaction that commits a
 * completion, so a long completion never blocks the UI's queries. The extra
 * `-wal` and `-shm` sidecar files are expected and are checkpointed by SQLite.
 */
async function configure(db: SQLite.SQLiteDatabase): Promise<void> {
  await db.execAsync('PRAGMA journal_mode = WAL;');
  await db.execAsync('PRAGMA foreign_keys = ON;');
}

export async function openDatabase(
  name: string = DATABASE_NAME,
): Promise<SQLite.SQLiteDatabase> {
  const db = await SQLite.openDatabaseAsync(name);
  await configure(db);
  await migrateToLatest(db);

  return db;
}
