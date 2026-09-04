# Architecture

## Foundation

The client is a TypeScript-strict React Native app on the current pinned Expo SDK. Expo Router owns navigation. The repository uses npm workspaces, with the app at `apps/mobile`.

The product is a modular monolith. Routes compose screens; product modules own application and domain behaviour; shared platform adapters implement persistence, analytics, flags, and later network access.

```text
route -> module UI -> application use case -> domain
                                  \-> repository interface
platform adapter --------------------> implementation
```

## Boundaries

- `src/app` contains route and layout files only.
- `src/modules/<domain>` contains feature code, introduced only when needed. A
  module may layer internally as `domain/` (pure rules), `application/` (use
  cases and React bridges), `content/` (authored assets), `model/` (view
  models), and `ui/` (screens and components).
- `src/shared/config` holds build-mode configuration and feature flags.
- `src/shared/ui` contains tokens and reusable presentation primitives without product rules.
- `src/shared/platform` will contain replaceable external adapters.
- Domain code cannot import React, React Native, Expo Router, Supabase, or UI components.
- Content and curriculum data cannot be embedded in screens.

ESLint enforces the domain boundary for every `src/modules/*/domain` file. It
rejects React, React Native, Expo, SQLite, application, infrastructure, platform,
and UI imports before tests or a release build can proceed.

State is device-local and accountless in the production pilot. An active lesson uses a deterministic
feature-scoped reducer in `modules/learning/domain`, bridged to React by a
single provider in `modules/learning/application`. Narrow application-owned
repository interfaces sit in `modules/progress/application`; direct
`expo-sqlite` adapters live in `modules/progress/infrastructure`. No domain
module imports SQLite, React, React Native, or Expo. No global state library is
justified.

Curriculum content is a compiled-in versioned bundle validated at load
(`modules/curriculum`). The loader is the seam that changes when content later
arrives over the network.

SQLite (`tekrarla.db`) is the authoritative local learner store. Explicit,
ordered migrations use `PRAGMA user_version`; foreign keys and WAL are enabled
at open. The app renders learner-state screens only after migration and active
session recovery complete. A profile startup gate reads SQLite before routing:
missing or unsupported legacy profiles enter onboarding, while a persisted YKS
profile enters the normal app without a Home-screen flash. A later sync adapter may implement the same inward
repository contracts, but authentication, Supabase, and cloud sync are not part
of this pilot.

Every observed answer is inserted with its active session snapshot in one
exclusive transaction, allowing the topic-performance read model to update
before lesson completion. Lesson completion remains the critical transaction
boundary for XP ledger entries, path progression, daily activity, mastery evidence,
review scheduling, and mistakes. Unique
source keys make XP awards idempotent. Active snapshots are versioned and carry
the content version; an incompatible snapshot is marked stale and the current
lesson starts cleanly, while already committed history is preserved.

Typed analytics, error-reporting, diagnostics, and build configuration seams
live under `shared/observability` and `shared/config`. Application/UI boundaries
emit stable curriculum identifiers only; domain modules do not import them.
The production composition root installs a Sentry crash/error adapter behind
environment and DSN gates. Development and preview retain the no-op adapter;
provider failures remain outside the learning and persistence control flow.

See [DECISIONS/0001-mobile-foundation.md](DECISIONS/0001-mobile-foundation.md) for the accepted foundation decision and [SECURITY.md](SECURITY.md) for trust boundaries.
See [DECISIONS/0003-local-first-sqlite-progress.md](DECISIONS/0003-local-first-sqlite-progress.md) for the persistence decision.
