NO-GO

# Milestone 1 release decision

Decision date: 2026-09-09 (Europe/Istanbul)  
Decision scope: public App Store and Google Play submission for Tekrarla 1.0  
Evaluated base commit: `e7a844f56b380d5edaf292c6a7ec9f8a033252a0`  
Decision owner: release owner approval still required

Public submission is forbidden. No release tag, EAS store candidate, or store
submission was created as part of this decision.

`PASS` means the checked repository evidence satisfies the gate. `FAIL` means
the repository contains contrary evidence. `MANUAL-EVIDENCE-REQUIRED` is also a
blocking result: the gate cannot pass until a human or physical-device record
is linked.

## Gate record

| Gate | Result | Evidence | Blocker and next action |
| --- | --- | --- | --- |
| Production content isolation | PASS for isolation; not releasable | `npm run content:production:check` passed. The production bundle is rooted only in version-matched, registry-backed `approved` lessons and refuses draft exercises and direct draft lookups. | The safe result is currently an empty usable production curriculum because there are no approved records. Populate it only through the human review workflow; never weaken this gate. |
| Human-approved TYT Sosyal content across Tarih, Coğrafya, Felsefe and Din | FAIL | `reviewers.json` is `[]`; the authored data contains 1,224 `draft` provenance records and no `reviewed` or `approved` records. The four review packets contain unsigned checklists and cannot constitute approval. | Complete the human subject-matter review work tracked by [Y-118](https://linear.app/tbt-work/issue/Y-118), [Y-131](https://linear.app/tbt-work/issue/Y-131), [Y-132](https://linear.app/tbt-work/issue/Y-132), [Y-133](https://linear.app/tbt-work/issue/Y-133), and [Y-134](https://linear.app/tbt-work/issue/Y-134). Register real qualified reviewers and record the two-step `reviewed` then `approved` attestations. |
| Production config and preview-feature gating | PASS | `production` EAS profile fixes `EXPO_PUBLIC_APP_MODE=productionPilot`; release-mode config rejects `designPreview`; production flags disable League, Plus, LGS and the hearts economy. Feature-gating tests and the production export passed. | Preserve the fail-closed mode resolution and repeat the production-build smoke for the eventual candidate. |
| Session resume and reset/onboarding | MANUAL-EVIDENCE-REQUIRED | Automated session recovery, SQLite repository/migration, onboarding, placement and routing tests passed. | `docs/NATIVE_RELEASE_ACCEPTANCE.md` has no physical-device restart/resume, upgrade, low-storage or reset evidence. Complete [Y-121](https://linear.app/tbt-work/issue/Y-121), [Y-126](https://linear.app/tbt-work/issue/Y-126), and the acceptance record on both platforms. |
| Notifications | MANUAL-EVIDENCE-REQUIRED | Notification and reminder-policy tests passed. | Allowed, denied and revoked permission scenarios are unchecked on iOS and Android. Complete [Y-122](https://linear.app/tbt-work/issue/Y-122) with build/device/video evidence. |
| Privacy/KVKK and device-only disclosure | FAIL | The in-app notice and support routes exist, but the release-review table still has pending Security, Legal/KVKK and Store Operations rows. The current-release signed-out HTTPS capture and store-form reconciliation are absent. | Obtain and link counsel/product/security approval, controller contact details, deployed-route captures and current Apple/Google declarations under [Y-123](https://linear.app/tbt-work/issue/Y-123) and [Y-130](https://linear.app/tbt-work/issue/Y-130). |
| Store identity, metadata and asset rights | FAIL | `Tekrarla` and `com.tekrarla.app` are configured. Store copy exists. The checklist still lacks developer-console identifier control, trademark/name reservation, screenshots, final visual approval and custom-art rights. `docs/ASSET_RIGHTS.md` marks every custom visual as `Unverified`. | Complete and link the external evidence under [Y-124](https://linear.app/tbt-work/issue/Y-124); do not upload a candidate before the identifiers and rights are confirmed. |
| Production observability | FAIL | The Sentry adapter is fail-closed behind DSN, production environment and a versioned privacy acknowledgement. The production export warned that Sentry organization/project config is absent. | Complete provider setup, legal/privacy controls, alerts, source maps, and symbolicated release-build exceptions on iOS and Android under [Y-125](https://linear.app/tbt-work/issue/Y-125). Reconcile store declarations after deciding whether the provider ships enabled. |
| iOS/Android native acceptance and accessibility | MANUAL-EVIDENCE-REQUIRED | The repository provides Maestro flows and an evidence template, but every candidate field, smoke checkbox and manual scenario is blank. | Produce both production EAS builds; run physical-device smoke, VoiceOver, TalkBack, largest Dynamic Type/font scale, reduced-motion and performance checks; attach recordings and results under [Y-126](https://linear.app/tbt-work/issue/Y-126) and [Y-127](https://linear.app/tbt-work/issue/Y-127). |
| Local release quality gate | PASS | After regenerating the stale philosophy review packet, `npm run quality:release` passed end-to-end: lint; strict typecheck; production-content/stats/review/audit checks; 51 Jest suites / 336 tests; coverage 70.46% statements, 60.53% branches, 71.21% functions and 70.58% lines; Expo Doctor 21/21; production audit with 15 moderate and no high/critical advisories; production static export. | Keep the generated packet change with this decision. Moderate transitive advisories remain accepted only under the documented Expo compatibility policy. |
| GitHub CI release gates | MANUAL-EVIDENCE-REQUIRED | The latest run for the evaluated base commit was green: [Actions run 34384420418](https://github.com/TerekliTahaBerk/mobile-app-test/actions/runs/34384420418). That workflow did not include the newer subject review/audit commands. This decision changes CI to call the canonical `npm run quality:release` command. | Push this decision commit and require a green run of the updated workflow before reconsidering release. |
| No open Urgent / Release Blocker issue | FAIL | [Y-135](https://linear.app/tbt-work/issue/Y-135) itself was observed in Linear as `In Progress`, `Urgent`, and labelled `release-blocker` on 2026-09-09. The manual blockers above also remain unresolved in the repository evidence even where their engineering-preparation tasks were closed. | Keep Y-135 open and NO-GO until every blocking row has linked evidence. Before the next vote, query Linear again for all open Urgent or `release-blocker` issues and record the zero-result evidence. |

## Commands executed

All commands were run from the repository root on 2026-09-09.

| Command | Result |
| --- | --- |
| `npm run lint` | PASS |
| `npm run typecheck` | PASS |
| `npm test` | PASS — mobile 51 suites / 336 tests; studio 19 tests |
| `npm run build` | PASS — 20 static routes exported |
| `npm run content:philosophy:review:update` | UPDATED — repaired generated-packet drift without changing review status |
| `npm run content:religion:audit` | PASS |
| `npm run content:religion:review:check` | PASS |
| `npm run quality:release` | PASS after the generated-packet update |
| `gh run list --repo TerekliTahaBerk/mobile-app-test --workflow quality.yml` | PASS — remote history accessible; no run exists for this unpushed decision change |
| `gh issue list --repo TerekliTahaBerk/mobile-app-test --state open` | PASS with zero GitHub issues; Linear remains the authoritative issue evidence for Y-135 and its release-blocker label |

The first sandboxed `quality:release` attempt stopped at Expo Doctor because
network access to `exp.host` was unavailable. Re-running with network access
produced 21/21 passing checks, and the final full command exited successfully.

## Blocking conditions for the next vote

The next decision can be `GO` only when all of the following are linked to the
release ticket for one immutable candidate commit/build pair:

1. Non-empty production curriculum with complete, genuine human approval
   attestations for the intended Tarih, Coğrafya, Felsefe and Din scope.
2. Signed privacy/KVKK, store identity, trademark and custom-asset rights
   evidence, plus current store-console declarations and public URL captures.
3. An explicit observability shipping decision and, if enabled, approved data
   transfer controls plus symbolicated iOS and Android release events.
4. iOS and Android EAS build URLs and complete physical-device native,
   notification, resume, migration, failure-recovery and accessibility evidence.
5. A green GitHub Actions run using the updated canonical release workflow and
   a recorded Linear query showing no open Urgent or Release Blocker issue.

Until then, the store-submission checklist remains open and public submission
must not occur.
