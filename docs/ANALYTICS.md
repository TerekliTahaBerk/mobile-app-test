# Analytics

Learning flows must be measurable through a replaceable, typed analytics interface. Event calls should observe application or domain outcomes instead of being scattered through presentation components.

The internal seam is implemented in
`apps/mobile/src/shared/observability/observability.ts`. It defines typed events
for onboarding, lesson/review start and completion, resume, answer outcomes, and
path unlocks. Payloads carry stable curriculum IDs and aggregate outcomes; they
do not carry raw answers, free-form student text, names, email addresses, device
identifiers, or account identity. `AppErrorBoundary`, non-critical splash work,
and preview-only hearts persistence report through the same error seam.

Sentry is the production crash/error provider. The adapter is installed only
when the JavaScript bundle is not a development build,
`EXPO_PUBLIC_OBSERVABILITY_ENVIRONMENT=production`, and `EXPO_PUBLIC_SENTRY_DSN`
is present. Development, Expo Go, tests, and EAS preview therefore keep the
no-op adapter and cannot pollute production data. Provider initialization and
delivery failure are non-critical and never block a lesson or persistence retry.

Sentry's automatic JavaScript and native crash handlers cover unhandled
exceptions. Explicit reporting covers app error-boundary failures, startup
content validation, SQLite open/migration, active-session restore/write, and
other non-critical platform operations. Typed product events become breadcrumbs
on error reports; they are not sent as standalone analytics events.

The SDK has `sendDefaultPii: false`, no user is assigned, performance tracing is
disabled, and a final `beforeSend` scrub removes user/request objects plus keys
such as `displayName`, raw/free-text answers, email, phone, IP address, and
device/installation identifiers. No session replay is enabled.

Example error event payload (illustrative; stack frames omitted):

```json
{
  "environment": "production",
  "release": "com.tekrarla.app@1.0.0+42",
  "tags": {
    "appMode": "productionPilot",
    "contentVersion": "2027.1",
    "schemaVersion": 5,
    "operation": "session.persist"
  },
  "exception": { "type": "Error", "value": "database is locked" },
  "breadcrumbs": [{
    "category": "product",
    "message": "exercise_answered",
    "data": {
      "attemptNumber": 1,
      "correct": false,
      "exerciseId": "exercise.history.time.001.mcq01",
      "lessonId": "lesson.history.time.001",
      "sessionKind": "lesson"
    }
  }]
}
```

The DSN is a public client routing value and belongs in the production EAS
environment. `SENTRY_AUTH_TOKEN` is a sensitive build-time credential used only
for source-map upload; never expose it with an `EXPO_PUBLIC_` prefix. Configure
Sentry organization/project build variables in EAS, create a release build, and
verify one deliberate test exception in the Sentry project before store release.
Retention, deletion, alerting, and provider-side privacy settings still require
product/legal review.
