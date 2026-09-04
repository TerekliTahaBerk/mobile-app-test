# Privacy, KVKK, and minor-user release package

This document is the operational source for store declarations and release
review. The public Turkish notice is rendered from
`apps/mobile/src/modules/legal/content/privacy-policy.ts` at `/gizlilik`; the
route is available inside Settings and in the static web export.

## Controller and notice record

| Field | Release value |
| --- | --- |
| Product | Tekrarla |
| Data controller/operator | Taha Berk Terekli |
| Privacy contact | `terekli@tahaberk.com` |
| Notice version | 2026-09-04 |
| Public route | `https://tekrarla.app/gizlilik` |
| Account model | Accountless; no login, cloud sync, or recovery |
| Target audience | TYT Social learners aged 13+; the audience can include minors |

The production identity is `com.tekrarla.app` and the commercial name is
Tekrarla. The postal/contact address required by counsel remains a release-owner
confirmation. Do not submit a store build until release operations have opened
the deployed notice in a signed-out browser and counsel has approved it.

## Data inventory

| Data | Examples | Location / retention | Purpose | KVKK basis proposed for counsel | Transfer |
| --- | --- | --- | --- | --- | --- |
| Local profile preferences | display name, avatar, exam, grade, target year, track, referral source, daily goal, starting point, weekly report day | Device SQLite until in-app reset or uninstall | Configure the requested learning experience | Contract formation/performance (Art. 5/2-c) | None |
| Learning activity | lesson/session IDs, answers, correct/scored state, attempts, timestamps and session context | Device SQLite until reset or uninstall | Resume lessons and calculate feedback | Contract formation/performance (Art. 5/2-c) | None |
| Derived progress | path status, XP ledger, mastery evidence, reviews, mistakes, daily activity/İz, hearts | Device SQLite until reset or uninstall | Progress, review scheduling and reports | Contract formation/performance (Art. 5/2-c) | None |
| Question reports | exercise ID, local session ID, selected reason, timestamp | Device SQLite until reset or uninstall | Remember a learner's report locally | Contract formation/performance (Art. 5/2-c) | None in the pilot |
| Reminder configuration | enabled state, chosen time; OS notification permission and locally scheduled content | Device/OS until disabled, reset, or uninstall | Deliver reminders requested by the learner | Explicit user action and service performance; confirm whether consent is separately required | None; no push token |
| Compiled curriculum | lessons, exercises, stable curriculum IDs | App bundle | Deliver learning content | Not learner personal data | None |
| Crash/error report, only if the gated provider is activated | exception/stack, release, environment, schema/content versions, operation tag, scrubbed product breadcrumbs with curriculum IDs and aggregate outcomes | Sentry; retention and deletion configuration not yet approved | Reliability and incident diagnosis | Legitimate interest assessment proposed; counsel must approve | Potential processor and cross-border transfer; blocked pending review |

The display name is a local preference, not a verified legal identity. It is
still treated as personal data in the notice and must never enter telemetry.
Raw answers and learning history remain protected learner data even when an
account identity is absent.

## Current store declarations

These answers describe the production pilot **while Sentry remains disabled**.
Re-evaluate every answer if the build environment enables a provider, accounts,
sync, payments, ads, or remote question reporting.

### Apple App Privacy

- Data collected by the developer: **No**. Device-local data that never leaves
  the device is not collected for the App Privacy label.
- Tracking: **No**.
- Data linked to identity: **No account or identity exists**.
- Privacy Policy URL: `https://tekrarla.app/gizlilik`.

If Sentry is enabled, declare Diagnostics (Crash Data and Other Diagnostic Data)
as collected, not used for tracking, and not linked to a user, subject to a
successful SDK payload and App Store definition review.

### Google Play Data safety

- Data collected/shared off device: **No**, for the provider-disabled pilot.
- Data processed ephemerally off device: **No**.
- Security practices: no account creation; local data deletion is available at
  Profile → Settings → İlerlemeyi sıfırla. Uninstall also deletes app-local data.
- Target audience: include the actual selected age groups; do not select under
  13 for this 13+ pilot.

If Sentry is enabled, reassess Diagnostics/App info and performance and the
processor-sharing interpretation against the then-current Play questionnaire.

## Minor-user strategy

1. The pilot is 13+ and may be used by 13–17-year-olds. It does not ask for a
   birth date because age is not required for the local learning loop.
2. No account, public profile, social interaction, ad, sale, precise location,
   contact upload, push token, or behavioral advertising is permitted.
3. Learning records remain local. Product analytics is disabled. A crash
   provider is not enabled until its data-flow, cross-border transfer,
   retention, processor contract, security, and minor-user lawful-basis review
   are approved and the notice/store declarations are updated.
4. Any feature that moves child data off device requires a new decision before
   implementation: age assurance proportionate to risk, guardian/parent flow
   where required, child-readable notice, consent withdrawal, access/deletion,
   retention, and migration for existing local data.
5. The app must not use consent as a condition for the local core service when
   the processing is not necessary for that service. Optional analytics must
   default off and must not rely on a minor's silent continued use.

## Third-party transfer gate

Before enabling Sentry or any analytics/crash SDK, the release owner must record:

- exact SDK modules and automatic collection defaults on iOS and Android;
- a release-build proxy/payload inspection proving the allowlist and scrub;
- processor/subprocessor list, hosting and support-access countries;
- KVKK role, processing agreement, overseas-transfer mechanism and any
  standard contract notification/filing required at that time;
- purpose, lawful-basis/legitimate-interest assessment, minimal event schema;
- retention period, deletion/export workflow, access controls and incident SLA;
- child-user impact and whether verified guardian consent is actually required;
- updated in-app notice, Apple label, Play Data safety form, and consent UI;
- documented product, security, legal, iOS and Android release approvals.

Remote feature flags may not silently activate a new collection purpose. A new
provider or payload requires code/config review and a new notice version.
After every approval is recorded, engineering must deliberately set the
versioned `EXPO_PUBLIC_SENTRY_PRIVACY_REVIEW` acknowledgement required by the
adapter. A DSN and production environment alone cannot activate delivery.

## Release-review record

| Review | Evidence required | Status |
| --- | --- | --- |
| Engineering | Tests and release quality gate; production payload matches inventory | Ready for review |
| Product | 13+ audience and no-account/no-analytics scope accepted | Ready for review |
| Security | Provider disabled or payload inspection plus transfer controls | Pending release evidence |
| Legal/KVKK | Controller details, lawful bases, minor approach, rights channel, overseas transfer | Pending counsel approval |
| Store operations | HTTPS policy URL and Apple/Google declarations captured | Pending production origin |

This package is not itself a claim of legal compliance. The issue/PR may close
when engineering artifacts are accepted, but a public store release remains
blocked until every row above is approved with linked evidence.

## Primary references checked

- [KVKK — Aydınlatma Yükümlülüğü](https://www.kvkk.gov.tr/Icerik/2033/Aydinlatma-Yukumlulugu-)
- [KVKK — İlgili Kişinin Hakları](https://www.kvkk.gov.tr/Icerik/2036/Ilgili-Kisinin-Haklari)
- [Apple — App Privacy Details](https://developer.apple.com/app-store/app-privacy-details/)
- [Google Play — Data safety form](https://support.google.com/googleplay/android-developer/answer/10787469)

References were last checked on 2026-09-04. Store questionnaires and transfer
rules can change; release operations must re-check them at submission time.
