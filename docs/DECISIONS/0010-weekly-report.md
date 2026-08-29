# 0010 — Weekly report

**Status:** Accepted  
**Date:** 2026-08-29

## Decision

The learner gets one weekly report: questions answered, accuracy and its change
against the week before, rounds completed, days studied, subtopics that became
strong during the week, subtopics the week is closing on still needing practice,
and one sentence about next week.

**The week runs to the report day rather than from it.** The window is the seven
days ending on the next occurrence of the chosen day, so a report opened
mid-week covers the week the learner is living and says it is still running; on
the report day itself it closes and is final. Reporting the previous closed week
instead would leave the screen stale and empty six days out of seven.

The comparison is always the seven days immediately before the window, so a week
in progress is measured against a full week rather than flattered by one.

The report day is the learner's, stored on the profile and defaulting to Pazar.
It is chosen on the report screen itself rather than buried in settings, because
the effect of the choice is what the screen is showing.

"Güçlenen konular" is computed by comparing the band a subtopic had going into
the week with the band it has now: a strength the learner already held is not
re-announced as this week's progress.

The notification copy lives in the report's view model even though notifications
are not delivered yet. When delivery lands, the push and the screen will read
from one place and cannot disagree.

## Consequences

- Schema version 3 adds `learner_profile.weekly_report_day`, defaulting to 0
  (Pazar), so an existing profile keeps the behaviour it already had.
- `DailyActivityRepository` gains `list`, because rounds and study days for a
  window cannot be derived from the qualifying-dates list alone.
- **Notifications are not implemented.** Delivering the report on the chosen day
  needs a scheduling dependency, permission handling, and a privacy decision,
  none of which the pilot has. The copy exists; the delivery does not, and no
  screen claims otherwise.
- Test fixtures now go through `authoredExercise`, which fails loudly on an
  exercise id that is not in the bundle. Reporting deliberately ignores attempts
  whose content has disappeared, so a mistyped fixture id used to make a test
  pass while measuring nothing.
