# MVP execution plan

Each milestone must remain independently verifiable. Do not start a later milestone until the current one meets its acceptance criteria.

1. **Repository foundation — COMPLETE** — documentation, Expo Router workspace, strict types, minimal tokens/button, two placeholder routes, lint, tests, and successful startup.
2. **Navigation and design primitives — COMPLETE** — accessible path and lesson shells using application-owned primitives; no learning logic.

**Brand alignment and native QA pass — COMPLETE.** This controlled pass sits between Milestones 2 and 3. It aligns the static shell to the TEKRARLA working identity, introduces licensed brand typography with fallback, and verifies the Expo Go workflow on an iOS simulator. It adds no product or learning logic.

3. **Content contract — NEXT** — stable curriculum/exercise types, validation, and one tiny original demo lesson.
4. **Deterministic lesson session** — pure reducer, exercise registry, immediate feedback, and three exercise types in memory.
5. **Polished vertical slice** — path to lesson to completion to XP/progress and back, including reduced-motion and error states.
6. **Durable offline progress** — SQLite migrations and repositories for attempts, sessions, XP, and progress.
7. **Basic mastery and review** — documented deterministic mastery, mistake records, due review, and next-activity rules.
8. **Analytics and feature flags** — typed funnel events and lightweight configuration flags.
9. **Backend synchronization** — Supabase, RLS, outbox sync, conflict rules, and optional authentication.
10. **Pilot hardening** — end-to-end flows, accessibility and performance checks, content QA, privacy review, and production diagnostics.

Milestones 1 and 2 are complete. All home and lesson data in Milestone 2 is presentation-only preview data; it must not be reused as a curriculum or exercise contract. Milestone 3 is not yet approved. Product scope and north star are maintained in [../PRODUCT.md](../PRODUCT.md).
