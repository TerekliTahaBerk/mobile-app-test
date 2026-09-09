# 0014 — Multi-exam learner domain model

Status: accepted

## Context

The Milestone 1 learner profile stores `exam`, `grade` and `track` in a flat
SQLite-oriented shape designed around the TYT Sosyal pilot. Its grade enum
cannot represent LGS grade 8, it has no explicit YKS program, and extending it
for every KPSS education level and module would create growing cross-product
enums. Curriculum manifest v1 separately uses `ExamId`; changing that hierarchy
belongs to Y-139.

## Decision

- Model learner exam context as the family-discriminated `ExamProfile` union.
- Represent YKS as explicit TYT, AYT and YDT program branches. Grade applies to
  all three; AYT requires a study track and YDT requires a language code. TYT
  may retain the learner's longer-term track without making it curriculum
  identity.
- Represent LGS as its single `lgs` program with the only currently meaningful
  learner grade, `grade8`.
- Represent KPSS program IDs and variant dimension/value pairs as stable data,
  not closed enums. A later catalogue and capability registry will decide which
  combinations exist and are available.
- Keep this model pure and serializable. It does not import React, Expo,
  SQLite, curriculum content, or infrastructure adapters.
- Keep persisted `LearnerProfile` v1 and its onboarding flow unchanged for
  Milestone 1. Legacy type names remain deprecated compatibility aliases.
  `examProfileFromLegacy` projects YKS rows to YKS/TYT and explicitly returns
  `migrationRequired` for old LGS rows, whose grade cannot be interpreted as
  grade 8 safely.

## Consequences

All three exam families now share one domain contract without enabling new
production screens or content. YKS program-specific fields cannot leak into LGS
or KPSS branches, and KPSS expansion does not require a new TypeScript union for
every variant.

Y-138 must introduce learner-profile schema v2, persist `ExamProfile`, validate
open identifiers at the repository boundary, and decide how unsupported legacy
LGS rows re-enter onboarding. Y-139 must migrate curriculum identity from the
current `ExamId` hierarchy to its manifest v2 model. Until those tasks land,
production continues to read and write profile v1 and serves only TYT Sosyal.
