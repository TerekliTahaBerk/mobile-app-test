# Analytics

Learning flows must be measurable through a replaceable, typed analytics interface. Event calls should observe application or domain outcomes instead of being scattered through presentation components.

The internal seam is implemented in
`apps/mobile/src/shared/observability/observability.ts`. It defines typed events
for onboarding, lesson/review start and completion, resume, answer outcomes, and
path unlocks. Payloads carry stable curriculum IDs and aggregate outcomes; they
do not carry raw answers, free-form student text, names, email addresses, device
identifiers, or account identity. `AppErrorBoundary`, non-critical splash work,
and preview-only hearts persistence report through the same error seam.

The default adapter is no-op, so production analytics and crash reporting are
**not active**. Provider selection, credentials, consent requirements, retention,
deletion policy, and privacy review remain external release work. Installing a
provider means supplying one `ObservabilityAdapter`; domain code does not change.
