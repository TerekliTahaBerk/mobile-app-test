# 0018 — Curriculum manifest v2

**Status:** Accepted  
**Date:** 2026-09-09

## Decision

`CurriculumManifestV2` owns the `exam → program → subject → unit` hierarchy.
Manifest schema version (`2`), content-bundle schema version (`4`) and release
versions are independent. Exam and program IDs are stable and namespaced
(`yks.tyt`, `yks.ayt`, `yks.ydt`, `lgs.lgs`, and data-defined KPSS IDs); their
`version` fields identify the curriculum release and are never embedded in IDs.
Existing subject and unit IDs are preserved.

Subjects explicitly declare `available`, `planned` or `unavailable` status and
stable `prerequisiteSubjectIds`. Available subjects require units, planned
subjects cannot publish units, prerequisites must resolve, and cycles are
invalid. The schema is open to LGS and KPSS without adding TypeScript enum
branches.

The schema-3 `curriculum.json` remains the authoring compatibility input. A
single adapter maps its TYT/AYT/YDT rows to programs under YKS, carries the
legacy curriculum version into exam/program/manifest versions, preserves IDs,
and derives availability only for legacy rows. New manifests author these rules
directly. The production gate derives and validates its approved-only closed
subset from manifest v2; unavailable subjects and unresolved prerequisites do
not reach production.
