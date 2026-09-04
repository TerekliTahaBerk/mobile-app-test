# 0014 — Production content gate

## Decision

The authored bundle remains the complete editorial workspace. The
`productionPilot` bundle is a derived, closed subset rooted in lessons whose
provenance is `approved` and attributed with `reviewedBy` and `reviewedAt`.
Every exercise referenced by such a lesson is retained and must independently
pass the same approval rule. Required taxonomy and path records are derived
from that set; empty subjects and units are omitted.

The application content source selects this derived bundle in production mode.
Consequently, navigation lists, deep links, restored sessions, and direct ID
lookups all operate on the same gated index rather than applying UI-only
filters. CI runs the production gate explicitly and fails on any invalid
production record.

## Consequences

- Draft material remains available in design preview and the content studio.
- Approving a lesson before all its exercises are approved breaks the gate.
- A unit or subject becomes production-visible only after it contains an
  approved lesson.
- Removing content from production can make an old local session stale; normal
  content-version recovery handles it without exposing the removed record.
