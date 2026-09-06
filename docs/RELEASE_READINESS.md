# Release readiness

This is the honest checklist for App Store and Google Play release.

**Current state: not releasable.** The local-first product loop is real and
durable, but the 10-lesson Tarih path is engineering-written draft material,
production observability has no approved deployed provider, and final legal/store approvals are incomplete.

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
| Automated quality | Lint with architecture boundaries, strict typecheck, full-source coverage thresholds, domain/UI/SQLite contract tests |
| CI | Reproducible release gate covers content approval/stats, tests/coverage, Expo Doctor, production dependency audit, and production export smoke |

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

The repeatable Maestro smoke flows and the evidence template live in
[`NATIVE_RELEASE_ACCEPTANCE.md`](NATIVE_RELEASE_ACCEPTANCE.md). Keep this blocker
open until both store-format candidates pass on physical devices and every
manual scenario has linked evidence.

### 4. Store, privacy, and legal — product + legal

- App name settled as **Tekrarla**; bundle/package ID `com.tekrarla.app` confirmed as
  production identifier in config. Trademark clearance is an external human step.
- Publish the implemented `/gizlilik` privacy route on a controlled HTTPS origin
  and complete the drafted App Privacy/Data safety declarations in
  [`PRIVACY_RELEASE_PACKAGE.md`](PRIVACY_RELEASE_PACKAGE.md).
- Obtain legal and release approval for the documented 13+ minor-user strategy.
- Store copy, rating inputs, screenshot brief, and public support route are
  prepared in [`STORE_SUBMISSION_CHECKLIST.md`](STORE_SUBMISSION_CHECKLIST.md).
- Confirm commercial ownership/licensing for the inventoried custom icon,
  splash, and Dino artwork in [`ASSET_RIGHTS.md`](ASSET_RIGHTS.md).
- See `docs/STORE_SUBMISSION_CHECKLIST.md` for the full asset/legal/metadata checklist.

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

- Track the current npm audit result: 15 moderate, 0 high, 0 critical findings,
  in Expo Router's query parser and the Expo config/build-tool chain. npm's
  offered remediations cross the pinned Expo compatibility boundary, so
  resolution must come through compatible upstream updates rather than a
  forced audit fix. CI fails on any high or critical production advisory.
- Replace the placeholder with production-resolution Dino art for large 3× placements.
- Confirm launch art, final app icon, and naming.
- Define offline/support copy and local-data reset/support procedures.
- Run final iOS and Android store-build smoke tests.

## Next hardening work

Configure and privacy-review the production observability project, verify a
symbolicated release event, then perform recorded iOS/Android restart,
accessibility, and store-build acceptance passes.
None of that replaces the independent academic-content and store/legal blockers.
