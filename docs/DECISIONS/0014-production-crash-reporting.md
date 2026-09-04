# 0014 — Production crash reporting

Status: accepted

## Context

The application had a typed, failure-isolated observability seam but no deployed
provider. Release failures in startup, content validation, SQLite migration, and
session persistence could not be diagnosed outside a developer device. The
accountless pilot serves teenagers, so broad analytics collection and payloads
containing learner data are not acceptable defaults.

## Decision

- Use `@sentry/react-native` for production crash/error reporting. Expo documents
  the integration for EAS builds and the SDK provides JavaScript unhandled-error
  and native crash handling.
- Initialize it before application content/storage modules, but only in a
  non-development bundle whose explicit observability environment is
  `production` and which has a DSN.
- Keep typed product events as breadcrumbs rather than standalone analytics.
- Disable default PII and tracing, assign no user, enable no replay, and scrub
  prohibited keys plus Sentry user/request data before delivery.
- Attach only release, environment, app mode, content version, schema version,
  stable curriculum identifiers, aggregate outcomes, and a bounded operation
  name needed to reproduce a failure.
- Treat every provider call and initialization as non-critical.

## Consequences

Release crashes and caught operational failures can be grouped and symbolicated
without introducing learner identity or answer content. Preview/test data cannot
enter the production project through application configuration. EAS still needs
the production DSN, Sentry organization/project values, and a sensitive
`SENTRY_AUTH_TOKEN`; provider retention, deletion, access control, alerts, and
legal review remain release operations.
