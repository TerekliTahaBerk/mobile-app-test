/**
 * Minimal declarations for Node's built-in SQLite, used only by the persistence
 * tests. `@types/node` is deliberately not added to `compilerOptions.types`:
 * app code targets React Native, and Node globals must not leak into it.
 */
declare module 'node:sqlite' {
  export type StatementRunResult = {
    changes: number | bigint;
    lastInsertRowid: number | bigint;
  };

  export class StatementSync {
    all(...params: (number | string | null)[]): unknown[];
    get(...params: (number | string | null)[]): unknown;
    run(...params: (number | string | null)[]): StatementRunResult;
  }

  export class DatabaseSync {
    constructor(location: string);
    close(): void;
    exec(sql: string): void;
    prepare(sql: string): StatementSync;
  }
}
