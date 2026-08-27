# Curriculum model

The conceptual hierarchy is:

```text
Exam -> Subject -> Unit -> Topic -> Skill -> Concept -> Lesson -> Exercise
```

Screens do not encode it. Stable IDs and explicit relationships let content be reordered and versioned without rebuilding UI assumptions. Every scored exercise references at least one skill so the system can explain what was tested and where a student struggles.

## Path nodes

The learning path is modelled separately from the hierarchy. A `PathNode` is **not** the same thing as a topic: a topic can span several nodes, and a checkpoint can span several topics.

```text
Unit:  İlk Türk Devletleri
  Level 1 — Türklerde Devlet
  Level 2 — Kut ve Veraset
  Level 3 — Kurultay          <- lesson node, backed by real content
  Level 4 — Töre
  Level 5 — Mini Tekrar
```

Node kinds are `lesson`, `practice`, `review`, and `checkpoint`. A node carries its unit, an ascending `order` unique within that unit, optional prerequisites, and — for anything a learner can open — a `lessonId`. The MVP needs a correctly modelled deterministic path, not a general-purpose graph engine.

## Real versus preview

The home path currently mixes one real node with preview placeholders, and the two are tagged in the view model (`source: 'real' | 'preview'`). Only a real node backed by a lesson is openable; preview levels keep the approved composition but declare themselves as preview to assistive technology. Nothing pretends to be content it is not.

## Open

The authoritative curriculum source, versioning cadence, and educator approval workflow remain unresolved. Until they are, the shipped slice stays one topic wide.
