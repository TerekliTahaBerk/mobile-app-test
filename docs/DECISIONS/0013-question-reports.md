# 0013 — Learner question reports

**Status:** Accepted  
**Date:** 2026-08-29

## Decision

A learner can flag the question they just answered from the feedback sheet,
choosing from four fixed reasons: the question is wrong, the right answer is
wrong, the explanation is unclear, or there is a typo.

**Fixed reasons, never free text.** The app captures no learner prose, and a
reason nobody can read is a reason nobody acts on. Four choices also make the
reports countable, which is what a content review needs.

**Reporting is not answering.** The control sits under the primary action, does
not score, does not advance the round, and a failed write is swallowed rather
than interrupting the round the learner is in the middle of.

One report per question per round. Re-reporting corrects the reason instead of
adding a second row.

**A reported question stops being drilled at that learner.** Targeted practice,
the daily plan and the starting diagnostic all skip it. The authored path keeps
it, so the curriculum does not silently lose a step and a learner cannot dodge
material by reporting it — the skill is still drilled through its other
questions.

## Consequences

- Schema version 4 adds `question_reports`, keyed so the same question in the
  same round is one row.
- **Reports stay on the device.** Delivering them to the content review needs
  Milestone 9; nothing in the app claims otherwise, and the studio cannot read
  them. What exists today is the durable record and the local behaviour, which
  is the honest half.
- The exclusion is a set threaded through the dashboard into every assembled
  drill, so one rule covers practice, plan and diagnostic.
