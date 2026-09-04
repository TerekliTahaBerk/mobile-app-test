# Native release acceptance

This is the evidence record and blocking gate for an iOS/Android store candidate.
It complements `npm run quality:release`; a static export or simulator pass is
not native release acceptance.

## Candidate

Copy this section into the release PR or ticket and replace every placeholder.

| Field | Evidence |
| --- | --- |
| Git commit | `<sha>` |
| App version / iOS build / Android version code | `<values>` |
| iOS production build | `<EAS build URL>` |
| Android production AAB | `<EAS build URL>` |
| iOS physical device and OS | `<model, OS>` |
| Android physical device and OS | `<model, OS>` |
| Tester and UTC time | `<name, timestamp>` |
| Maestro output | `<CI artifact, terminal capture, or ticket attachment>` |
| Screen recording / screenshots | `<links>` |

## Automated physical-device smoke

Install the store candidate on the connected device, install the
[Maestro CLI](https://maestro.mobile.dev/getting-started/installing-maestro),
and run from the repository root:

```sh
npm run smoke:native
```

Run the suite once on iOS and once on Android. It clears application data, so
use a dedicated acceptance device/accountless install. Record the command,
Maestro version, device, build URL, output and screen recording above.

- [ ] iOS: clean install → onboarding → first lesson → completion passes.
- [ ] Android: clean install → onboarding → first lesson → completion passes.
- [ ] iOS: kill during the first lesson → relaunch → exact question resumes → completion passes.
- [ ] Android: kill during the first lesson → relaunch → exact question resumes → completion passes.

The automated flow intentionally uses stable IDs from the authored first
lesson. A content change to that lesson must update the flow in the same PR.

## Recorded manual scenarios

For each row attach a short video or timestamped screenshots plus the observed
result. Use the same production candidates identified above. A bare check mark
is not evidence.

| Scenario | iOS evidence/result | Android evidence/result | Pass |
| --- | --- | --- | --- |
| Placement: start `Seviyemi ölç`, answer at least one question, kill, relaunch, finish; `Haritamı gör` opens the placement result | `<link + result>` | `<link + result>` | [ ] |
| Topic practice: start from Konu Performansı, answer, kill, relaunch, finish; `Performansı gör` returns to the same topic | `<link + result>` | `<link + result>` | [ ] |
| Offline: disable Wi-Fi and cellular before cold launch; onboarding, lesson, completion, restart and resume work | `<link + result>` | `<link + result>` | [ ] |
| SQLite update: install previous store candidate, create progress and an active lesson, update in place; migration preserves profile, XP, path and resume | `<from build → to build + link>` | `<from build → to build + link>` | [ ] |
| Notifications allowed: opt in, choose a time, verify scheduled reminder and tap destination | `<link + result>` | `<link + result>` | [ ] |
| Notifications denied: deny the OS prompt; onboarding continues and denial guidance appears | `<link + result>` | `<link + result>` | [ ] |
| Notifications revoked: revoke in system settings, cold launch settings, verify warning and that learning is unaffected | `<link + result>` | `<link + result>` | [ ] |
| Android back: lesson exit confirmation, cancel/confirm, nested Profile pages and root fallback all land correctly | N/A | `<link + result>` | [ ] |
| Low storage / write failure: constrain storage or inject the documented device failure; app shows retry UI, does not claim completion, then saves exactly once after recovery | `<link + result>` | `<link + result>` | [ ] |

Also record `npm run quality:release` output and verify the production content,
observability, accessibility, legal and store blockers in
`docs/RELEASE_READINESS.md`.

## Submit gate

Public submission is forbidden when any item above is incomplete, any evidence
link is missing, `npm run quality:release` fails, or any blocker in
`docs/RELEASE_READINESS.md` remains open. EAS builds may be produced for
acceptance; do not run `eas submit` until the release owner records an explicit
`GO` decision in the release ticket with links to this evidence. A failed case
is recorded as a release-blocker bug with platform, build, device, reproduction,
logs and video; the fixed build repeats the full affected-platform suite.
