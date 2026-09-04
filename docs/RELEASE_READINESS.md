# Release readiness

This is the honest checklist for App Store and Google Play release.

**Current state: not releasable.** The local-first product loop is real and
durable, but the 10-lesson Tarih path is engineering-written draft material,
production observability has no deployed provider, and store/legal work is incomplete.

## Ready

| Area | State |
| --- | --- |
| Native product shell | Approved screens, semantic design system, navigation, crash containment |
| Content contract | Versioned bundle, stable IDs, shape and semantic validation, 11 draft Tarih lessons across 3 units |
| First launch | SQLite-ready profile gate, durable onboarding completion, recoverable write failure |
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
| Profile metrics | Correct answers and perfect rounds derived from durable attempts; earnable badges |
| Account model | Explicit device-local/accountless pilot; no fake account infrastructure |
| Fake-feature gating | League, Plus, quests, hearts, and gems off in production pilot |
| Observability foundation | Typed privacy-conscious events, error/diagnostic seams, no-op adapter |
| Automated quality | Lint, strict typecheck, domain/UI/SQLite contract tests |
| CI | GitHub Actions runs install, lint, strict typecheck, and tests on pushes/PRs |

## Blockers

### 1. Complete, human-reviewed TYT Sosyal content — product + academic

The shipped Kurultay lesson is `draft`, written by engineering, and exists only
to prove the pipeline. Production requires original material approved by a
human subject-matter reviewer across Tarih, Coğrafya, Felsefe, and Din Kültürü.
This is the largest release blocker.

### 2. Production observability — engineering + product

The Sentry crash/error adapter, privacy scrub, production-only environment gate,
and source-map configuration exist. Release operations must still configure the
production DSN, organization/project values, sensitive source-map token,
retention/deletion/access policy and alerts, then verify a symbolicated iOS and
Android release-build exception. Do not claim production monitoring until that
recorded end-to-end check and privacy review are complete.

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
- Confirm trademark clearance for the Online Dershanem working name; `tekrarla`
  remains a technical identifier, not the cleared commercial name.
- Confirm commercial ownership/licensing and production-resolution Dino art.

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

- Track the current npm audit result: 11 moderate, 0 high, 0 critical findings,
  all in the Expo config/build-tool chain through `xcode`/`uuid`. Expo Doctor
  passes 21/21 checks; npm's offered remediation is an incompatible Expo 57 →
  46 downgrade, so resolution must come through an Expo-compatible upstream
  update rather than a forced audit fix.
- Replace the placeholder with production-resolution Dino art for large 3× placements.
- Confirm launch art, final app icon, and naming.
- Define offline/support copy and local-data reset/support procedures.
- Run final iOS and Android store-build smoke tests.

## Next hardening work

Configure and privacy-review the production observability project, verify a
symbolicated release event, then perform recorded iOS/Android restart,
accessibility, and store-build acceptance passes.
None of that replaces the independent academic-content and store/legal blockers.
