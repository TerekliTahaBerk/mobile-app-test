# 0017 — Learner-profile schema v2

Status: accepted

## Context

SQLite profile v1 flattened `exam`, `track`, `grade` and `target_year` around
the original TYT pilot. The M2.01 learner model instead uses a
family-discriminated `ExamProfile`. Historical LGS rows contain a YKS-only grade
and therefore cannot be translated to LGS grade 8 without inventing learner
data. Persisted rows can also be incomplete or contain values from an older
build.

## Decision

- Schema version 6 replaces the active profile table with profile schema v2.
  It stores exam family, program and family-specific grade, track, language or
  KPSS variants separately.
- A v1 row is migration-ready only when it is a fully valid YKS profile. It is
  deterministically mapped to `yks/tyt`, preserving grade, optional track and
  target year.
- Legacy LGS, unknown enum values, invalid target years and partial common
  preferences are marked `needsOnboarding`. The repository treats those rows
  as no active profile, so startup cannot crash or enter the wrong curriculum.
- The renamed `learner_profile_v1_backup` table retains the source row
  verbatim. Re-onboarding may write a valid v2 profile but does not erase this
  migration evidence. An explicit learner-data reset deletes both tables.
- Repository reads validate every closed value, family-specific requirement,
  open KPSS identifier, variant and language code before constructing domain
  data. Writes apply the same validation.
- `PRAGMA user_version` and the profile-table replacement are committed in the
  same transaction. A retry after rollback starts from v1 again; a completed
  migration is skipped, making normal repeated startup idempotent.

## Downgrade policy

Downgrade is not supported. A binary that only understands profile v1 must not
open a database at schema version 6: the active table no longer exposes the v1
columns. The retained backup exists for lossless migration evidence and support,
not as a writable downgrade path. Restore requires an application-owned future
migration, not lowering `PRAGMA user_version` manually.

## Consequences

Existing TYT Sosyal learners continue with the same program, year, grade and
track. Ambiguous profiles make the safe choice—onboarding—while keeping their
original values available. The database carries one additional single-row
backup table until the learner explicitly resets local data.
