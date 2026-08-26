# MVP execution plan

Each milestone must remain independently verifiable. Do not start a later milestone until the current one meets its acceptance criteria.

1. **Repository foundation** — documentation, Expo Router workspace, strict types, minimal tokens/button, two placeholder routes, lint, tests, and successful startup.
2. **Navigation and design primitives** — accessible path and lesson shells using application-owned primitives; no learning logic.
3. **Content contract** — stable curriculum/exercise types, validation, and one tiny original demo lesson.
4. **Deterministic lesson session** — pure reducer, exercise registry, immediate feedback, and three exercise types in memory.
5. **Polished vertical slice** — path to lesson to completion to XP/progress and back, including reduced-motion and error states.
6. **Durable offline progress** — SQLite migrations and repositories for attempts, sessions, XP, and progress.
7. **Basic mastery and review** — documented deterministic mastery, mistake records, due review, and next-activity rules.
8. **Analytics and feature flags** — typed funnel events and lightweight configuration flags.
9. **Backend synchronization** — Supabase, RLS, outbox sync, conflict rules, and optional authentication.
10. **Pilot hardening** — end-to-end flows, accessibility and performance checks, content QA, privacy review, and production diagnostics.

Milestone 1 is the only currently approved implementation scope. Product scope and north star are maintained in [../PRODUCT.md](../PRODUCT.md).
