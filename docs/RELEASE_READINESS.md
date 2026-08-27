# Release readiness

This document tracks what stands between the current build and a public
release on the App Store and Google Play. It is the honest checklist, not an
aspirational one.

**Current state: not releasable.** The interface is complete and every screen
of the approved design is implemented, but the app has no content, no learning
logic, and no persistence. A learner who installed it today would see the same
fixture lesson forever and lose nothing when they closed it, because nothing is
ever stored.

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
| Quality gates | Lint, strict typecheck, 30 tests, dependency check, all green |
| Device QA | iPhone 17 Pro (402 pt) and iPhone SE (375 pt), iOS 26.5 |

## Blockers

These must be resolved before the app can ship. Each names who has to decide.

### 1. There is no curriculum content — **product + academic**

Every question, lesson, unit, and subject in the app is fixture text copied
from the design. `docs/PRODUCT.md` requires that production material be
original and academically reviewed. This is the largest single blocker and it
is not an engineering task.

Needs: an authoritative TYT Sosyal curriculum source, an author, a reviewer,
and a licensing position on the material.

### 2. There is no learning engine — **engineering, gated on product**

No evaluation, no XP award, no mastery estimate, no review scheduling, no
session reducer. The exercise screens hold local state to demonstrate their
own visual states; nothing is scored or recorded.

Blocked on decisions that `docs/LEARNING_SYSTEM.md` and
`docs/GAMIFICATION.md` still list as open: the mastery formula, review
intervals, XP award rules, and the recommendation priority between new
lessons, due review, and mistakes.

### 3. Nothing persists — **engineering**

Close the app and every counter resets. Milestone 6 (SQLite migrations and
repositories) has not started. Until it does, İz, XP, and progress cannot be
real regardless of what the screens display.

### 4. İz is presentational — **product**

The İz counter, week strip, and "izin kesilmesin" copy imply a habit streak
the app does not compute. `docs/GAMIFICATION.md` still needs the timezone
rule, the grace rule, and whether İz can be repaired.

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

### 7. TEKRARLA Plus is layout only — **product**

The Plus screen shows prices and plans but has no billing integration and
collects nothing. Shipping it as-is would advertise a purchase that cannot be
made. Either wire real in-app purchases or hide the screen before release.

### 8. The league is fixture data — **product**

The Lig screen ranks eight invented people. There is no leaderboard service and
no decision about whether the league is competitive. Same choice as Plus: build
it or hide it.

### 9. No observability — **engineering**

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

1. Milestone 3 — content contract, then one real reviewed lesson.
2. Milestone 4 — deterministic session reducer behind the existing screens.
3. Milestone 6 — persistence, so progress survives a restart.
4. Decide İz, XP, and mastery rules; make the counters real.
5. Decide the account model; add crash reporting.
6. Hide or finish Plus and Lig.
7. Store compliance and submission.

Steps 1–4 are what turn this from a convincing prototype into a product. The
interface work is done and is not the constraint.
