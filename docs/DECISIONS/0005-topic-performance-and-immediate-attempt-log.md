# 0005 — Topic performance and immediate attempt log

**Status:** Accepted  
**Date:** 2026-08-28

## Decision

The content hierarchy is also the reporting taxonomy: a `Unit` is a
learner-facing main topic, a `Topic` is a subtopic, and a `Skill` is the finest
measured outcome. Exercises continue to reference skills only. The validated
content index derives their main topic and distinct subtopics, and rejects an
exercise whose skills cross unit boundaries.

The app persists each observed attempt immediately with the active session
snapshot in one SQLite transaction. Completion remains independently atomic and
idempotent. No migration is required because the existing `attempts` table is
the durable event source.

Profile performance is a read model over scored attempts. It reports counts and
accuracy separately from Bayesian skill mastery. Evidence-aware labels avoid
calling one lucky answer a strength: strong requires at least three attempts and
75% accuracy; needs-practice requires at least two attempts below 50%; all other
samples are developing.

## Consequences

- Mid-lesson wrong answers survive interruption and appear when the profile is
  next focused.
- Multi-skill questions count once for their main topic and once for each
  distinct subtopic they measure.
- Attempts whose exercise no longer exists in the current content bundle remain
  durable but are omitted from taxonomy reporting because attribution would be
  unsafe.
- Raw performance, mastery, XP, path progress, and İz remain separate concepts.
