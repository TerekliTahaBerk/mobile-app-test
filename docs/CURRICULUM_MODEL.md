# Curriculum model

The conceptual hierarchy is:

```text
Exam -> Subject -> Unit -> Topic -> Skill -> Concept -> Lesson -> Exercise
```

The hierarchy may evolve, so screens must not encode it. Stable IDs and explicit relationships should let content be reordered and versioned without rebuilding UI assumptions. Every scored exercise must reference at least one skill so the system can explain what was tested and where a student struggles.

Learning paths will use nodes such as lesson, practice, review, checkpoint, mini exam, boss exam, and mixed review. Nodes may reference prerequisites. The MVP needs a correctly modeled deterministic path, not a general-purpose graph engine.

The authoritative curriculum source, versioning cadence, and educator approval workflow remain unresolved.

