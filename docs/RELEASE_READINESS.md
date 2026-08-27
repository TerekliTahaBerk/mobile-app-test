# Release readiness

This document tracks what stands between the current build and a public
release on the App Store and Google Play. It is the honest checklist, not an
aspirational one.

**Current state: not releasable.** The interface is complete, and one real
lesson now runs end to end on a validated content bundle and a deterministic
learning engine. But the curriculum is a single topic, none of it has been
academically reviewed, and **nothing persists** — close the app and the session,
its XP, and its answers are gone.

## What is ready

| Area | State |
| --- | --- |
| Screens | All 13 frames of *TEKRARLA Ekranlar v2*, plus not-found and crash screens |
| Design system | Semantic tokens, primitives, brand typography, ÇİZGİ registry |
| Motion | Four keyframes on built-in `Animated`, Reduce Motion honoured |
| Navigation | Expo Router, five-tab shell, deep-link scheme, unknown-route handling |
| Crash containment | `AppErrorBoundary` at the root with a branded recovery screen |
| Launch assets | Icon, adaptive icon, monochrome icon, splash, favicon — all from brand art |
| App config | Bundle identifiers, versioning, orientation, light-only UI style; `expo-doctor` 21/21 |
| Build config | `eas.json` with development, preview, and production profiles |
| Content contract | Versioned bundle, stable IDs, runtime validation with actionable errors |
| Learning engine | Pure deterministic session reducer, evaluator registry, domain events, attempt model, v1 XP policy |
| Real vertical slice | One Tarih lesson (`Kurultay`, five exercises) wired through the approved screens |
| Feature gating | League and Plus off in a production pilot |
| Quality gates | Lint, strict typecheck, 65 tests, dependency check, all green |
| Device QA | iPhone 17 Pro (402 pt) and iPhone SE (375 pt), iOS 26.5 |

## Blockers

These must be resolved before the app can ship. Each names who has to decide.

### 1. The curriculum is one topic, and it is unreviewed — **product + academic**

The content *contract* is done and the pipeline works, but the shipped bundle
holds a single Tarih lesson written by engineering to prove it. Every record is
`reviewStatus: 'draft'`, and `docs/PRODUCT.md` requires production material to
be original and academically reviewed. This remains the largest single blocker
and it is not an engineering task.

Needs: an authoritative TYT Sosyal curriculum source, an author, a subject-matter
reviewer who can move records to `approved`, and a licensing position on the
material. The validator already refuses malformed content; it does not and
cannot judge whether content is *correct*.

### 2. No mastery or review — **engineering, partly gated on product**

Evaluation, attempts, domain events, and XP now exist and are deterministic.
What is missing is everything that needs history: mastery estimation, review
scheduling, and next-activity recommendation.

The v1 review ladder (1/3/7/14/30 days) is decided and documented. The mastery
formula, confidence input, and the priority between new lessons, due review,
and mistakes are still open.

### 3. Nothing persists — **engineering**

Close the app and the lesson session, its XP, and its attempts are gone.
Milestone 6 (SQLite migrations and repositories) has not started. Until it
does, İz, XP totals, and level progression cannot be real regardless of what
the screens display — and the first-path-level XP bonus cannot be awarded at
all, because nothing knows whether a level has been completed before.

### 4. İz is presentational — **engineering**

The İz counter, week strip, and "izin kesilmesin" copy imply a habit streak the
app does not compute. The v1 rules are now decided and recorded in
`docs/GAMIFICATION.md` — device timezone, one lesson or due-review session per
qualifying day, no repair, no retroactive rewrites. Implementation waits on
persistence.

### 5. No account or sync — **product + engineering**

Milestone 9. Decide whether v1 ships device-local (no account, no recovery if
the phone is lost) or requires sign-in. This changes the store listing, the
privacy policy, and the onboarding flow.

### 6. Store compliance — **product + legal**

Not started, and none of it is code:

- Apple Developer and Google Play accounts, and the real bundle identifier.
  `com.tekrarla.app` is a placeholder — confirm the domain you control.
- Privacy policy URL. Required by both stores even when collecting nothing.
- Data-safety and App Privacy declarations.
- Age rating. The pilot targets students; if under-13 users are in scope,
  COPPA and KVKK obligations follow and change what may be collected.
- Store listing: description, keywords, screenshots, preview video.
- Trademark clearance for TEKRARLA and ÇİZGİ, still open in
  `docs/BRAND_IDENTITY.md`.
- Licensing and ownership of the ÇİZGİ artwork for commercial use.

### 7. Plus and the league are gated off, not finished — **product**

Both screens remain in the codebase and reachable while designing, but
`FEATURES.plus` and `FEATURES.league` are **false in a production pilot**: their
tabs disappear and their routes redirect home. That stops a pilot advertising a
purchase that cannot be made, or a ranking that is fiction — it does not make
either feature exist.

Deciding to ship them means real in-app purchases and a real leaderboard
service, both out of scope until a later phase.

### 8. No observability — **engineering**

Milestone 8. There is no crash reporter, no analytics, and no feature flags.
`AppErrorBoundary` already exposes an `onError` hook for a reporter to attach
to. Shipping without crash reporting means shipping blind.

## Smaller items before submission

- Mascot resolution: source art is ~140 pt wide and is displayed up to 206 pt,
  so it is soft on a 3× display. Needs re-rendering from the original 3D
  source, not a different export.
- Dark theme: the app declares `userInterfaceStyle: "light"` because only a
  light theme exists. The design lists "koyu tema" as a future direction.
- The design's own next list, still unbuilt: LGS mode on the path, the
  out-of-hearts and İz-protection screens, and drag-and-drop matching.
- Accessibility: states are text-labelled and targets clear 44 pt, but the app
  has not been run end-to-end under VoiceOver or at the largest Dynamic Type
  setting.
- Offline behaviour: undefined, because there is no network layer yet.

## Suggested order

1. ~~Milestone 3 — content contract~~ **done**.
2. ~~Milestone 4 — deterministic session reducer~~ **done**.
3. **Release Phase 2** — Milestone 6 persistence, then real XP totals, İz, and
   mastery/review on top of the existing event stream.
4. Author and academically review real curriculum breadth.
5. Decide the account model; add crash reporting.
6. Decide whether Plus and Lig ship at all.
7. Store compliance and submission.

Steps 3 and 4 are what turn this from a working prototype into a product. The
interface and the engine are done and are no longer the constraint; content
breadth and durable progress are.
