# 0016 — Privacy and minor users

Status: Accepted for implementation; legal and store release approval pending.

## Context

The accountless TYT Social pilot stores a display name, learner preferences and
detailed learning history on the device. Local notifications are optional. The
codebase contains a production-gated Sentry adapter, but a processor, retention
and cross-border-transfer review has not been completed. The intended audience
includes high-school students and therefore minors.

## Decision

- Target the pilot at learners aged 13 and over. Do not collect birth date only
  to enforce this positioning.
- Keep the core service accountless and learning data device-local. Do not add
  behavioral analytics, advertising identifiers, remote profiles or cloud sync.
- Treat the display name and pseudonymous learning records as protected personal
  data even though no verified identity exists.
- Request notification permission only after an explicit learner action and
  schedule reminders locally without a push token.
- Do not enable a third-party analytics/crash provider until the transfer gate
  in `docs/PRIVACY_RELEASE_PACKAGE.md` passes, the notice/store forms are
  updated, and the release is approved for minor users.
- Publish one versioned Turkish notice source through the in-app and web
  `/gizlilik` route.

## Consequences

The provider-disabled pilot can truthfully declare that the developer does not
collect data off device. Enabling the existing Sentry adapter is a release-scope
change, not merely an environment toggle. Accounts, sync, ads, social features,
under-13 distribution, optional analytics or remote question reports require a
new decision and guardian/consent assessment before implementation.
