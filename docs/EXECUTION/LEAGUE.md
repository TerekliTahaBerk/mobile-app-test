# League delivery plan

The weekly league is part of the product loop, but a real standing cannot be
derived from one device's local SQLite data. Until the phases below are
complete, Home and the bottom navigation keep Lig discoverable while the route
shows an honest pending state. Preview names and ranks never enter a production
build.

## Product contract

- A league is a weekly XP comparison, not a second learning goal. Bugünkü Plan
  continues to decide what the learner should study.
- XP, promotion and rank cannot be purchased.
- Only XP from committed, idempotent learning events qualifies.
- A learner sees their own position, the promotion boundary and the closing
  time. No score-improvement or exam-rank claim is made.
- The first production cohort stays limited to TYT Sosyal Bilimler learners.

## Delivery phases

### 0. Stable destination — complete

Keep Lig in Home and bottom navigation in every build. Production shows no
fictional competitors or rank while the service is absent.

### 1. Identity and privacy decision

Choose the minimum account model required to recognize one learner across
devices. Document display-name visibility, retention, deletion, reporting and
KVKK review. Do not upload the local profile before this decision is accepted.

Acceptance: a security/privacy decision records identity, consent, deletion and
public-name rules.

### 2. Deterministic league rules

Define the week boundary and timezone, cohort size, tier entry, promotion and
demotion counts, late joiners, ties and inactive learners. Specify exactly which
XP ledger sources qualify and how corrections are handled.

Acceptance: pure domain tests cover week rollover, ties, cohort assignment,
promotion boundaries and duplicate XP events.

### 3. Backend and synchronization

Add authenticated, append-only XP event ingestion with an idempotency key per
local ledger source. Materialize weekly standings server-side. Apply row-level
authorization so a learner can submit only their events and read only the
limited public leaderboard projection.

Acceptance: retries cannot award XP twice; forged learner IDs are rejected;
offline events reconcile without changing already committed local progress.

### 4. Production read model and UI

Replace `leaguePreviewData` with a loading/ready/failed League application read
model. Keep the learner row visible, label the promotion zone in words and show
the server-derived closing instant in the learner's timezone. Home may show a
rank only from this same read model.

Acceptance: no preview fixture is imported by a production route, empty and
offline states are recoverable, and Home and Lig show the same rank and close
time.

### 5. Abuse, operations and rollout

Rate-limit event ingestion, monitor duplicate/rejected events and add a manual
cohort-disable switch. Roll out to an internal cohort before the TYT Sosyal
Bilimler pilot; do not expose opponent data in analytics payloads.

Acceptance: operational dashboards and alerts exist, rollback preserves local
learning, and native/accessibility QA passes on both platforms.

## Out of scope for the first release

Friends, chat, follows, global exam ranking, purchased boosts, cross-exam
cohorts, and AI-generated league commentary are not part of the first league.
