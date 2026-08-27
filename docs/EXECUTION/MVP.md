# MVP execution plan

Each milestone must remain independently verifiable. Do not start a later milestone until the current one meets its acceptance criteria.

1. **Repository foundation — COMPLETE** — documentation, Expo Router workspace, strict types, minimal tokens/button, two placeholder routes, lint, tests, and successful startup.
2. **Navigation and design primitives — COMPLETE** — accessible path and lesson shells using application-owned primitives; no learning logic.

**Brand alignment and native QA pass — COMPLETE.** This controlled pass sits between Milestones 2 and 3. It aligns the static shell to the TEKRARLA working identity, introduces licensed brand typography with fallback, and verifies the Expo Go workflow on an iOS simulator. It adds no product or learning logic.

**Approved design implementation — COMPLETE.** A second controlled pass, also between Milestones 2 and 3. It implements all thirteen frames of the approved Claude Design project *TEKRARLA Ekranlar v2* natively: onboarding, the level-path home screen, lesson preparation, four exercise renderers, exit confirmation, completion, the İz celebration, the quest board, profile, league, and TEKRARLA Plus. It imports the ÇİZGİ poses, rebuilds the token system around the pastel palette, adds a Reduce-Motion-aware motion layer on React Native's own `Animated`, and verifies every screen on iPhone 17 Pro and iPhone SE simulators.

All of its data is presentation-only preview state under each module's `model/` directory. It adds no curriculum, evaluation, XP, mastery, İz, league, or persistence logic, and — importantly — the Plus screen has no billing integration and collects nothing. Monetization, league mechanics, and social features remain undecided.

3. **Content contract — COMPLETE** — stable curriculum/exercise contracts, stable IDs, a versioned bundle, runtime validation with actionable errors, and one tiny original demo lesson marked `draft`.
4. **Deterministic lesson session — COMPLETE** — pure reducer, evaluator registry, domain events, attempt model, v1 XP policy, and four exercise types connected in memory.
5. **Polished vertical slice — NEXT** — path to lesson to completion to XP/progress and back, including error states. One real lesson already runs end to end; what remains is durable progress behind it. Reduced-motion support already ships.
6. **Durable offline progress** — SQLite migrations and repositories for attempts, sessions, XP, and progress.
7. **Basic mastery and review** — documented deterministic mastery, mistake records, due review, and next-activity rules.
8. **Analytics and feature flags** — typed funnel events and lightweight configuration flags.
9. **Backend synchronization** — Supabase, RLS, outbox sync, conflict rules, and optional authentication.
10. **Pilot hardening** — end-to-end flows, accessibility and performance checks, content QA, privacy review, and production diagnostics.

**Release Phase 1 — COMPLETE.** Milestones 3 and 4. The app now carries real curriculum contracts, a validated content bundle, and a deterministic pure-TypeScript lesson engine, with one Tarih lesson (`Kurultay`, five exercises) wired end to end through the approved screens. That lesson's evaluation, XP, and completion figures are computed, not fixtures.

Everything else on the home path, the İz counter, the HUD totals, hearts, and the quest board remain explicitly tagged preview data. **Nothing persists**: a restart discards the session and its XP. League and TEKRARLA Plus are gated off in a production pilot.

Milestones 1 and 2 are complete. Milestone 5 is next; Milestone 6 (durable progress) is the blocker for anything gamification-facing. Product scope and north star are maintained in [../PRODUCT.md](../PRODUCT.md).
