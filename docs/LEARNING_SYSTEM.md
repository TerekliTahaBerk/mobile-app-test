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

The same registry describes the question, the right answer, and a submitted
answer in learner-facing words, so the feedback sheet and the mistake notebook
cannot disagree about what the right answer was.

A renderer holds the learner's half-finished answer in its own state, so the
lesson screen keys it by exercise id. Two questions of the same kind in one
round therefore start clean; without the key the second inherits the first's
placements and can become unanswerable.

## Attempts

An `Attempt` records the exercise, lesson, skills, submitted answer, correctness, attempt number, whether it was scored, and the injected timestamp. Only the final attempt on each exercise counts toward the lesson summary, so a retry does not inflate the mistake count. No free-form learner text is captured.

Every observed attempt is inserted into SQLite together with its active session
snapshot immediately after the answer/advance transition, in one transaction.
Lesson completion remains the boundary for XP, mastery, review scheduling, and
open mistake remediation; abandoning or crashing mid-lesson does not erase the
raw answer history.

The profile derives main-topic and subtopic performance directly from scored
attempts and the current content taxonomy. It shows raw correct/wrong counts and
accuracy rather than presenting these summaries as mastery. Three attempts at
75% or better are labelled strong; two or more below 50% are labelled as needing
practice; smaller or mixed samples remain developing. The dashboard refreshes
whenever the profile regains focus.

## Topic coach

Topic performance is an instruction, not a scoreboard. Every non-strong subtopic
carries a one-tap drill assembled from *other* questions measuring the same
skills, preferring questions never seen over questions already missed over
questions already answered correctly, so a drill teaches the outcome rather than
memorising one item. Finishing a drill returns to the report with the
before/after change for that subtopic and its next review date.

The report is read over a window of calendar days in the learner's zone — last
7, last 30, or all time — and every figure it shows is qualified by the evidence
behind it:

- the question count always accompanies the percentage; a sample below three
  answers is labelled as too small to read;
- a direction (rising / falling / steady) is claimed only from six or more
  answers in the window, comparing its older half with its newer half, and only
  when the halves differ by more than ten points;
- coverage states how many of a main topic's authored subtopics have been
  measured at all, so an unmeasured curriculum never reads as a strength;
- first-sighting accuracy is separated from accuracy on questions already
  answered before;
- a strength untouched for fourteen days is flagged for a refresher rather than
  left to decay silently.

Corrections are derived from the whole history, not the window: a question that
was missed before and answered correctly today is a correction, and the
subtopics it measures appear under "Bugün düzelttiğin konular". A question
answered correctly on its first ever sighting corrects nothing.

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

## Weekly report

The report covers the seven days ending on the learner's chosen report day
(Pazar by default, stored on the profile). Opened mid-week it covers the week
in progress and says so; on the report day it closes and is final. Accuracy is
compared against the seven days immediately before the window.

"Güçlenen konular" compares the band a subtopic had going into the week with the
band it has now, so a strength the learner already held is not re-announced.
Rounds and study days come from the daily activity record, not from attempts.

The notification copy is part of the report's view model. Notification delivery
does not exist yet: it needs a scheduling dependency, permissions, and a privacy
decision the pilot has not made.

## Starting diagnostic

Choosing "Seviyemi ölç" during onboarding opens one diagnostic sampled across
every main topic and subtopic that has scored material. Each subtopic
contributes up to three questions — the topic report's evidence bar — and never
more; a subtopic with less material contributes what it has, and one sitting is
capped at twenty questions. Questions run easiest-first within a subtopic and
never twice in a row from the same one.

It carries no path node, so being measured never marks or unlocks curriculum.
The result screen shows the ordinary topic report as a starting map, weakest
subtopic first, and the ordinary daily plan as the first day. "Sıfırdan başla"
skips all of it.

## Question reports

From the feedback sheet a learner can flag the question they just answered, with
one of four fixed reasons — never free text, since the app captures no learner
prose. Reporting does not score, does not advance the round, and a failed write
never interrupts it. One report per question per round; re-reporting corrects
the reason.

A reported question is skipped by targeted practice, the daily plan and the
starting diagnostic for that learner. Its authored lesson keeps it, so the
curriculum keeps its shape and the skill is still drilled through its other
questions. Reports are device-local: delivering them to content review needs
backend synchronisation, which does not exist yet.

## Mistake notebook

Every mistake record is readable by the learner: the question, their own answer,
the right answer, the explanation, its main topic and subtopic, how many times
that question has been missed, when the skill was last worked, and a drill of
other questions on the same subtopic.

Nothing on the screen writes. A learner cannot delete a mistake or mark one as
learned; a mistake closes only through a clean first-attempt answer on the same
skill during a repeat, which is what the completion write already does. Closed
records stay visible as "Artık öğrendiklerin".

Prompts, right answers, and submitted answers are described per exercise kind in
`evaluator-registry.ts`, beside the evaluator that scores them, so the notebook
and the feedback sheet cannot disagree about what the right answer was.

## Daily plan

Ana Sayfa leads with one plan for today, stated as its parts: weak subtopics,
due reviews, refreshers on strengths that have gone unmeasured, and new
material. Quotas shape a full day (5 / 3 / 2 / 2, target 12), but every bucket
is filled from the learner's record and the card reports what the plan actually
holds. Only new material tops a short day back up.

The plan's questions are regrouped by subtopic and interleaved, so no subtopic
is asked twice in a row while another still has questions left. Selection reuses
the same ordering as targeted practice: never seen, then missed, then already
correct.

The plan is a drill. It carries no path node, awards no lesson-completion or
path bonus, and cannot complete or unlock curriculum. A resumable session
outranks it: an unfinished round is offered instead.

## Recommendation

The pure recommendation policy chooses, in order: due unresolved mistake,
due/overdue review, active resumable session, then the next available real path
node. Ties use oldest due/created time and stable ID. The returned reason is
`mistake`, `review`, `resume`, or `newLesson`.

## Open

Mastery v1 intentionally has no decay. Curriculum breadth and human academic
review remain the limiting learning-system work.

Curriculum references are defined in [CURRICULUM_MODEL.md](CURRICULUM_MODEL.md); exercise content boundaries are in [CONTENT_MODEL.md](CONTENT_MODEL.md).
