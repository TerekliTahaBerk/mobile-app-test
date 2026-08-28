# Curriculum model

The conceptual hierarchy is:

```text
Exam -> Subject -> Unit -> Topic -> Skill -> Concept -> Lesson -> Exercise
```

Screens do not encode it. Stable IDs and explicit relationships let content be reordered and versioned without rebuilding UI assumptions. Every scored exercise references at least one skill so the system can explain what was tested and where a student struggles.

## Path nodes

The learning path is modelled separately from the hierarchy. A `PathNode` is **not** the same thing as a topic: a topic can span several nodes, and a checkpoint can span several topics.

```text
Unit: İlk ve Orta Çağlarda Türk Dünyası
  1 — Devletleri Tanı
  2 — Kavramları Eşleştir
  3 — Kronolojik Sırala
  4 — Kut ve Töre
  5 — Hızlı Tekrar            <- practice
  6 — Ünite Challenge         <- checkpoint
```

Node kinds are `lesson`, `practice`, `review`, and `checkpoint`. A node carries its unit, an ascending `order` unique within that unit, optional prerequisites, and — for anything a learner can open — a `lessonId`. The MVP needs a correctly modelled deterministic path, not a general-purpose graph engine.

## Durable progression and preview

Production derives every node state from authored prerequisites plus durable
`path_progress` rows. The final checkpoint of one unit is the prerequisite for
the first node of the next, so cross-unit unlocks survive restarts. Re-entering a
completed node is allowed, but the first-completion XP source key is lifetime
idempotent. Design preview uses fixtures only in `designPreview`; it does not
alter or seed production progression.

## Open

The authoritative curriculum source, versioning cadence, and educator approval
workflow remain unresolved. The current multi-unit Tarih catalogue is still an
engineering draft and must not be described as academically reviewed.
