# Security and privacy

The product will serve teenagers and may serve minors. Collect the minimum necessary data, keep secrets out of client bundles, avoid sensitive logs, and treat identity and learning records as protected student data.

The future Supabase backend must use least privilege and reviewed Row Level Security policies. Client-computed XP or answers are acceptable for an offline learning prototype but are not authoritative for competitive rewards, subscriptions, or other abuse-sensitive decisions.

The pilot is accountless and stores learning activity locally in SQLite: lesson
sessions, answers, progress, XP, mastery, reviews, mistakes, and qualifying
local dates. It collects no name, email, phone, contacts, location, advertising
identifier, or account identity. Production builds may send privacy-scrubbed
crash/error telemetry to Sentry; they do not send raw answers, free text, names,
contact details, request URLs, or device/installation identifiers. The public
DSN routes client events, while the source-map upload token remains a sensitive
EAS build secret and must never be bundled. Legal and product review is required
for KVKK and other applicable obligations; this repository makes no compliance
claim.

The Settings screen states that there is no cloud backup and that deleting the
app or losing the device makes this data unrecoverable. The learner can reset
all local profile, progress, session, answer, XP, mastery, review, mistake,
activity, hearts, question-report, and reminder-preference state. Reset requires
opening a destructive confirmation sheet and typing `SIFIRLA`; the SQLite
deletions commit in one transaction, scheduled device notifications are
cancelled first, and the app returns to onboarding.

Open decisions include data retention, parental/guardian flows where applicable, account deletion, analytics consent, incident response, and anonymous-progress migration.

## Dependency vulnerability policy

CI audits the production dependency graph from the committed lockfile. Any
`high` or `critical` npm advisory fails the release gate. Moderate findings may
remain only when they are documented, are confined to an Expo-compatible
transitive dependency, and have no non-breaking compatible remediation; they
must be reconsidered whenever Expo or the affected package is upgraded. Never
use `npm audit fix --force` to cross the pinned Expo SDK compatibility boundary.
Low findings are tracked through normal dependency maintenance. Expo Doctor and
the production export smoke run in the same release gate so dependency changes
cannot pass solely because the advisory threshold is clear.
