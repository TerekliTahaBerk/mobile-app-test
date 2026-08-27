# Learning system

The learning engine is pure TypeScript, deterministic, and independent of React, React Native, and Expo Router. It lives in `apps/mobile/src/modules/learning/domain/`.

## Lesson session

```text
lesson definition + session state + command -> new session state + domain events
```

`LessonSession` holds the lesson id, the exercise order, the current index, the phase (`answering` / `feedback` / `finished`), recorded attempts, status (`notStarted` / `active` / `completed` / `abandoned`), and session XP. Commands are `startLesson`, `submitAnswer`, `continueAfterFeedback`, `completeLesson`, and `abandonLesson`. The UI never mutates a session; it dispatches commands and renders what comes back.

**Determinism.** Every command carries the instant it happened at. Domain code never calls `Date.now()`, so the same inputs always produce the same state and the same events. The React bridge supplies the clock; tests supply a fixed one.

## Evaluation

Evaluation is registered per exercise kind in `evaluator-registry.ts`, never branched on inside the engine. An evaluator receives an exercise and an answer of the matching kind and returns `{ correct, correctAnswerSummary, scored }`. Renderer and evaluator are independent: adding an exercise type means adding a content contract, an evaluator, and a renderer.

## Attempts

An `Attempt` records the exercise, lesson, skills, submitted answer, correctness, attempt number, whether it was scored, and the injected timestamp. Only the final attempt on each exercise counts toward the lesson summary, so a retry does not inflate the mistake count. No free-form learner text is captured.

## Domain events

`LessonStarted`, `AnswerSubmitted`, `AnswerCorrect`, `AnswerIncorrect`, `AttemptRecorded`, `ExerciseCompleted`, `SkillEvidenceObserved`, `MistakeRecorded`, `XpEarned`, `LessonCompleted`, `LessonAbandoned`.

Events carry stable IDs and nothing else. They are the seam that persistence, analytics, mastery, and review scheduling will consume. **Nothing subscribes to them yet** — no persistence, no analytics vendor.

## Planned v1 review schedule

When spaced review is implemented, the intervals after a successful review are:

```text
1 day → 3 days → 7 days → 14 days → 30 days
```

A miss returns the item to the start of the ladder. Mastery stays deterministic and policy-based, computed from recorded attempts rather than stored as an opaque score.

**Neither mastery nor review is implemented.** They are Release Phase 2. The event stream and the attempt model exist so that phase can be built without reshaping the engine.

## Open

The v1 mastery formula, confidence input, and the recommendation priority between new lessons, due review, and mistakes remain undecided.

Curriculum references are defined in [CURRICULUM_MODEL.md](CURRICULUM_MODEL.md); exercise content boundaries are in [CONTENT_MODEL.md](CONTENT_MODEL.md).
