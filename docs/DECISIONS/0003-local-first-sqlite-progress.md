# 0003 — Device-local SQLite learner progress

**Status:** Accepted  
**Date:** 2026-08-27

## Decision

The v1 pilot is accountless and device-local. `expo-sqlite` stores learner
activity in `tekrarla.db` behind narrow application repository interfaces.
There is no authentication, cloud sync, recovery, Supabase, ORM, or generic
key-value state layer.

Schema changes are explicit ordered migrations recorded by
`PRAGMA user_version`. Database open enables foreign keys and WAL. The app does
not render learner-state screens until open, migration, and active-session
recovery finish. Migration or open failures surface a branded retry and never
delete the database.

Lesson completion is one `withExclusiveTransactionAsync` transaction across
the session, attempts, XP ledger, path progress, daily activity, mastery,
review schedule, and mistakes. XP source keys have unique constraints so a
retry cannot duplicate a session award or a path's first-completion bonus.

Active sessions use a versioned JSON snapshot together with `lessonId` and the
content bundle version. Incompatible snapshots are marked stale and restarted
from current content; already committed XP and history remain untouched.

## Consequences

- The full pilot works offline without collecting identity.
- Reinstalling or losing the device loses progress; this must be stated to pilot users.
- SQLite rows are structured so a future sync adapter can map them, but no sync
  semantics are implied yet.
- Native iOS restart/resume QA remains necessary because Node SQLite contract
  tests do not prove the Expo native binding.
