# MVP execution plan

Each milestone must remain independently verifiable. Do not start a later milestone until the current one meets its acceptance criteria.

1. **Repository foundation — COMPLETE** — documentation, Expo Router workspace, strict types, minimal tokens/button, two placeholder routes, lint, tests, and successful startup.
2. **Navigation and design primitives — COMPLETE** — accessible path and lesson shells using application-owned primitives; no learning logic.

**Brand alignment and native QA pass — COMPLETE.** This controlled pass sits between Milestones 2 and 3. It aligned the static shell to the earlier TEKRARLA identity, introduced licensed brand typography with fallback, and verified the Expo Go workflow on an iOS simulator. The current working product name is Online Dershanem; `tekrarla` remains only in technical identifiers pending clearance. It adds no product or learning logic.

**Approved design implementation — COMPLETE.** A second controlled pass, also between Milestones 2 and 3. It implemented the frames from the historically named Claude Design project *TEKRARLA Ekranlar v2* natively, later aligned to the current Online Dershanem design system and single Dino mascot artwork. It includes onboarding, the level path, exercises, exit confirmation, completion, İz, profile, and preview-only league/Premium surfaces, plus a Reduce-Motion-aware motion layer on React Native's own `Animated`.

All of its data is presentation-only preview state under each module's `model/` directory. It adds no curriculum, evaluation, XP, mastery, İz, league, or persistence logic, and — importantly — the Plus screen has no billing integration and collects nothing. Monetization, league mechanics, and social features remain undecided.

3. **Content contract — COMPLETE** — stable curriculum/exercise contracts, stable IDs, a versioned bundle, runtime validation with actionable errors, and a 10-lesson / 3-unit Tarih draft path.
4. **Deterministic lesson session — COMPLETE** — pure reducer, evaluator registry, domain events, attempt model, v1 XP policy, and four exercise types connected in memory.
5. **Polished vertical slice — COMPLETE** — real path to lesson/review to atomic completion, İz, XP/progress and back, including recoverable storage errors.
6. **Durable offline progress — COMPLETE** — SQLite migrations and repositories for attempts, resumable sessions, ledger XP, path, daily activity, mastery, review, and mistakes.
7. **Basic mastery and review — COMPLETE** — Beta-evidence mastery v1, deterministic scheduling, mistake remediation, review assembly, and next-activity recommendation.
8. **Analytics + Feature Flags / Production Observability — PARTIAL** — typed funnel events, error-reporting and diagnostics seams, and build-mode configuration are implemented. A real production provider, credentials, consent/retention decisions, and privacy review remain.
9. **Backend synchronization** — Supabase, RLS, outbox sync, conflict rules, and optional authentication.
10. **Pilot hardening** — end-to-end flows, accessibility and performance checks, content QA, privacy review, and production diagnostics.

**Release Phase 1 — COMPLETE.** Milestones 3 and 4. The app carries real curriculum contracts, a validated 10-lesson Tarih draft bundle, and a deterministic pure-TypeScript lesson engine wired end to end through the approved screens.

**Release Phase 2 — COMPLETE.** Milestones 5, 6, and 7. The production pilot is accountless and local-first. SQLite preserves active sessions, attempts, ledger XP, real path state, İz, mastery, review schedules, and mistakes. Home uses the deterministic recommendation order `mistake → review → resume → new lesson`. Plus, quests, hearts, and gems remain available only in design preview. Lig remains discoverable but shows no standings until the backend described in [LEAGUE.md](LEAGUE.md) is complete.

Milestones 1–7 are complete and Milestone 8 has an internal foundation. The app is not release-ready:
human-reviewed curriculum breadth, deployed production observability, native/accessibility hardening,
and store/legal work remain. Product scope and north star are maintained in
[../PRODUCT.md](../PRODUCT.md).
