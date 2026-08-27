# Release readiness

This is the honest checklist for App Store and Google Play release.

**Current state: not releasable.** The local-first product loop is real and
durable, but the curriculum is one engineering-written draft topic, production
observability is absent, and store/legal work is incomplete.

## Ready

| Area | State |
| --- | --- |
| Native product shell | Approved screens, semantic design system, navigation, crash containment |
| Content contract | Versioned bundle, stable IDs, semantic validation, one draft Tarih lesson |
| Learning engine | Pure deterministic reducer, evaluators, attempts, events, XP policy |
| Polished vertical slice | Home → lesson/review → completion → İz → Home |
| Persistence | `expo-sqlite`, explicit migrations, foreign keys, WAL, startup gate |
| Durable sessions | Versioned snapshot, content compatibility check, mid-lesson resume |
| Atomic completion | Exclusive transaction across every learner-state write |
| XP | Auditable ledger; 10 correct, 20 lesson, 25 first path completion; idempotent source keys |
| Path | Real node persists `available/started/completed`; preview nodes stay locked |
| İz | Durable local dates, current-zone recording, yesterday grace, real weekly strip |
| Mastery v1 | Beta evidence prior 1/3, policy version 1, scored evidence only |
| Review | Deterministic 1/3/7/14/30-day ladder and existing exercise UI |
| Mistakes | One unresolved remediation record per skill; successful review can resolve it |
| Recommendation | mistake → review → resume → new lesson, deterministic ties |
| Account model | Explicit device-local/accountless pilot; no fake account infrastructure |
| Fake-feature gating | League, Plus, quests, hearts, and gems off in production pilot |
| Automated quality | Lint, strict typecheck, domain/UI/SQLite contract tests |

## Blockers

### 1. Complete, human-reviewed TYT Sosyal content — product + academic

The shipped Kurultay lesson is `draft`, written by engineering, and exists only
to prove the pipeline. Production requires original material approved by a
human subject-matter reviewer across Tarih, Coğrafya, Felsefe, and Din Kültürü.
This is the largest release blocker.

### 2. Production observability — engineering + product

There is no crash reporter, analytics, production funnel instrumentation, or
remote configuration. `AppErrorBoundary` contains crashes but cannot report
them. Milestone 8 owns this work and must preserve the small privacy surface.

### 3. Native acceptance and accessibility hardening — engineering

Automated tests exercise a real Node SQLite engine, not a mocked query layer,
but the Expo native binding still requires recorded iOS restart/resume QA and
Android coverage. VoiceOver, largest Dynamic Type, and release-build
performance passes remain.

### 4. Store, privacy, and legal — product + legal

- Confirm a controlled bundle identifier/domain; `com.tekrarla.app` is a placeholder.
- Publish the privacy policy and complete App Privacy/data-safety declarations.
- Decide age rating and the treatment of minors under KVKK and applicable law.
- Produce store descriptions, screenshots, keywords, and support URLs.
- Confirm trademark clearance for TEKRARLA and ÇİZGİ.
- Confirm commercial ownership/licensing and production-resolution ÇİZGİ art.

### 5. Device-only progress disclosure — product

The pilot has no account recovery or cross-device sync. Pilot onboarding and
store/privacy copy must clearly state that deleting the app or losing the device
loses progress. Cloud sync is not a prerequisite unless product changes the v1
account decision.

### 6. Plus and League — product decision

Both are disabled in production. Shipping either requires real billing or a
real leaderboard backend plus their own compliance and abuse work. They are not
release blockers while they remain hidden.

## Smaller submission items

- Re-render ÇİZGİ from the original 3D source for large 3× placements.
- Confirm launch art, final app icon, and naming.
- Define offline/support copy and local-data reset/support procedures.
- Run final iOS and Android store-build smoke tests.

## Next engineering milestone

**Milestone 8 — Analytics + Feature Flags / Production Observability.**

This does not make the app release-ready by itself; academic content and store
hardening remain independent blockers.
