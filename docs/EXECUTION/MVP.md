# MVP execution plan

Each milestone must remain independently verifiable. Do not start a later milestone until the current one meets its acceptance criteria.

1. **Repository foundation — COMPLETE** — documentation, Expo Router workspace, strict types, minimal tokens/button, two placeholder routes, lint, tests, and successful startup.
2. **Navigation and design primitives — COMPLETE** — accessible path and lesson shells using application-owned primitives; no learning logic.

**Brand alignment and native QA pass — COMPLETE.** This controlled pass sits between Milestones 2 and 3. It aligns the static shell to the TEKRARLA working identity, introduces licensed brand typography with fallback, and verifies the Expo Go workflow on an iOS simulator. It adds no product or learning logic.

**Approved design implementation — COMPLETE.** A second controlled pass, also between Milestones 2 and 3. It implements all thirteen frames of the approved Claude Design project *TEKRARLA Ekranlar v2* natively: onboarding, the level-path home screen, lesson preparation, four exercise renderers, exit confirmation, completion, the İz celebration, the quest board, profile, league, and TEKRARLA Plus. It imports the ÇİZGİ poses, rebuilds the token system around the pastel palette, adds a Reduce-Motion-aware motion layer on React Native's own `Animated`, and verifies every screen on iPhone 17 Pro and iPhone SE simulators.

All of its data is presentation-only preview state under each module's `model/` directory. It adds no curriculum, evaluation, XP, mastery, İz, league, or persistence logic, and — importantly — the Plus screen has no billing integration and collects nothing. Monetization, league mechanics, and social features remain undecided.

3. **Content contract — COMPLETE** — stable curriculum/exercise contracts, stable IDs, a versioned bundle, runtime validation with actionable errors, and one tiny original demo lesson marked `draft`.
4. **Deterministic lesson session — COMPLETE** — pure reducer, evaluator registry, domain events, attempt model, v1 XP policy, and four exercise types connected in memory.
5. **Polished vertical slice — COMPLETE** — real path to lesson/review to atomic completion, İz, XP/progress and back, including recoverable storage errors.
6. **Durable offline progress — COMPLETE** — SQLite migrations and repositories for attempts, resumable sessions, ledger XP, path, daily activity, mastery, review, and mistakes.
7. **Basic mastery and review — COMPLETE** — Beta-evidence mastery v1, deterministic scheduling, mistake remediation, review assembly, and next-activity recommendation.
8. **Analytics + Feature Flags / Production Observability — NEXT** — typed funnel events, crash reporting, production diagnostics, and lightweight configuration with privacy review.
9. **Backend synchronization** — Supabase, RLS, outbox sync, conflict rules, and optional authentication.
10. **Pilot hardening** — end-to-end flows, accessibility and performance checks, content QA, privacy review, and production diagnostics.

**Release Phase 1 — COMPLETE.** Milestones 3 and 4. The app carries real curriculum contracts, a validated content bundle, and a deterministic pure-TypeScript lesson engine, with one Tarih lesson (`Kurultay`, five exercises) wired end to end through the approved screens.

**Release Phase 2 — COMPLETE.** Milestones 5, 6, and 7. The production pilot is accountless and local-first. SQLite preserves active sessions, attempts, ledger XP, real path state, İz, mastery, review schedules, and mistakes. Home uses the deterministic recommendation order `mistake → review → resume → new lesson`. League, Plus, quests, hearts, and gems remain available only in design preview and are hidden in production.

Milestones 1–7 are complete. Milestone 8 is next. The app is not release-ready:
human-reviewed curriculum breadth, observability, native/accessibility hardening,
and store/legal work remain. Product scope and north star are maintained in
[../PRODUCT.md](../PRODUCT.md).
