# 0007 — Explainable, interleaved daily plan

**Status:** Accepted  
**Date:** 2026-08-28

## Decision

Ana Sayfa's primary action is one daily plan, stated as what it is made of:
"Bugün 12 soru", then the parts — weak subtopics, due reviews, refreshers on
stale strengths, and new material. The counts shown are the plan's own, never
the intended quota, so a thin day reads as thin.

The plan's questions are ordered by subtopic rather than by part. A classroom
study of retrieval practice found interleaved retrieval beat blocked study on a
delayed test, and a daily set exists for what survives to the exam, so the
sequence regroups every selected question by subtopic and never repeats a
subtopic back-to-back while another has questions left.

Buckets are filled from the learner's own record and may come up short. Only new
material tops the day back up toward the target, because it is the one source
that is not evidence-bound: there is no honest way to invent a due review or a
weak subtopic.

A half-finished round still outranks the plan. Finishing what you started is the
one thing the learner already committed to, so a resumable session shows the
continue card and no plan card.

The plan is a drill, not a path step. It carries no path node, so completing it
awards no lesson-completion or path bonus and cannot mark or unlock curriculum
the learner has not worked through in Öğren.

## Consequences

- `recommendNext` still decides resume-versus-plan on Home. Its mistake and
  review outcomes are no longer surfaced as their own card: a mistake is only
  recommended when its skill is due, and every due skill is already a question
  in the plan's review part, so nothing the policy would have offered is lost.
- New-material questions inside a plan do not advance the path. The same lesson
  remains openable in Öğren, where completing it does.
- Question selection is shared with targeted practice through
  `exercise-selection.ts`: unseen before missed before already-correct.
- The daily İz goal (rounds per day) and the daily plan (questions today) stay
  separate concepts and are not derived from each other.
- With the current draft bundle a new learner sees a short plan, because path
  progression opens only the first node. This is a content-breadth limit, not a
  planning defect, and the card states the real number.
