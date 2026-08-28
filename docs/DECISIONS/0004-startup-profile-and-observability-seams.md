# 0004 — Startup profile and observability seams

Status: accepted

## Context

SQLite was already the learner-state authority, but routing did not wait for a
profile read and onboarding navigated before its write completed. Analytics and
crash reporting also lacked an inward-facing contract.

## Decision

- Read the single local learner profile after database migration and before the
  route tree may show learner-state screens.
- Route a missing or legacy unsupported LGS profile to onboarding; release the
  gate only after the supported YKS profile write succeeds.
- Keep profile state in a feature-scoped application provider, not a global
  state library or route-level SQLite calls.
- Define typed analytics, exception, and diagnostics contracts under
  `shared/observability`. Emit events at application/UI boundaries and keep the
  default adapter no-op until a privacy-reviewed provider is configured.
- Treat telemetry failures as non-critical, but route them to a development
  warning rather than allowing a provider to break studying.

## Consequences

Fresh installs cannot flash Home or escape onboarding on a failed write.
Relaunch behavior is deterministic and remains accountless. Domain modules stay
independent from routing, React, SQLite, and analytics SDKs. Production
observability must not be claimed as active until a real adapter and its privacy
requirements are deployed.
