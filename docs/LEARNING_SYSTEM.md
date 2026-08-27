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

Events carry stable IDs and nothing else. The application persistence seam
translates the completed deterministic session into attempts, XP, path,
mastery, review, mistake, and daily-activity records. There is still no
analytics vendor.

## Durable sessions

Active lesson and review sessions are stored as versioned JSON snapshots plus
queryable metadata. Every answer/advance is serialized behind the previous
write. On launch, a compatible active snapshot restores its exercise index,
attempts, XP, and phase. A content-version or snapshot-version mismatch is
marked stale and never guessed at or allowed to crash the app.

## Mastery v1

Each skill stores Beta evidence with prior `alpha = 1`, `beta = 3` and policy
version 1. Estimated mastery is `alpha / (alpha + beta)`, clamped to `[0, 1]`.
A first-attempt correct scored answer adds 1 to alpha; a weaker correct answer
adds 0.5; an incorrect scored answer adds 1 to beta. Flashcards add no mastery
evidence. XP and mastery remain independent.

## Review schedule

The deterministic ladder is:

```text
1 day → 3 days → 7 days → 14 days → 30 days
```

A strong success schedules the interval at the current stage and advances one
stage, capped at 30 days. A weak/retry success stays at its stage and returns in
one day. A miss drops one stage, never below zero, and returns in one day.
Review times are instants; İz uses local calendar dates.

Due review sessions reuse the existing lesson renderers and select up to three
scored exercises for the chosen skill in stable ID order. They award only 10 XP
per correct scored exercise: no lesson-completion or path bonus.

## Recommendation

The pure recommendation policy chooses, in order: due unresolved mistake,
due/overdue review, active resumable session, then the next available real path
node. Ties use oldest due/created time and stable ID. The returned reason is
`mistake`, `review`, `resume`, or `newLesson`.

**Neither mastery nor review is implemented.** They are Release Phase 2. The event stream and the attempt model exist so that phase can be built without reshaping the engine.

## Open

Mastery v1 intentionally has no decay. Curriculum breadth and human academic
review remain the limiting learning-system work.

Curriculum references are defined in [CURRICULUM_MODEL.md](CURRICULUM_MODEL.md); exercise content boundaries are in [CONTENT_MODEL.md](CONTENT_MODEL.md).
