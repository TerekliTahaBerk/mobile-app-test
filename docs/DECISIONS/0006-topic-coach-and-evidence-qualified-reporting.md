# 0006 — Topic coach and evidence-qualified reporting

**Status:** Accepted  
**Date:** 2026-08-28

## Decision

Topic performance exists to send the learner somewhere, so the screen is a
coach rather than a report. Each non-strong subtopic — and each strength that
has gone stale — offers a one-tap drill of other questions measuring the same
skills, and returning from that drill shows the before/after change and the next
review date.

Reporting is windowed by calendar days in the learner's zone (`last7`,
`last30`, `all`). The window is a view choice applied over the durable attempt
log in `buildTopicPerformance`, not a separate stored aggregate and not a second
database read: switching windows re-derives from `scoredAttempts` already held
by the dashboard.

Every figure is qualified by the evidence behind it. The question count travels
with the percentage; samples under three answers are labelled evidence-poor; a
trend needs six answers in the window and a ten-point gap between its halves
before it claims a direction; coverage reports measured subtopics against
authored subtopics; first-sighting accuracy is reported separately from retry
accuracy; and a strength unmeasured for fourteen days is flagged for a
refresher.

Corrections are derived from the learner's whole history rather than the
selected window. A question missed at any earlier point and answered correctly
today is a correction, attributed to each subtopic that question measures.

## Consequences

- `buildTopicPerformance` returns a `TopicPerformanceReport` — topics,
  corrections made today, and window/all-time attempt counts — instead of a bare
  array. The dashboard keeps the all-time report plus the attempt log and review
  schedule that windowed views are rebuilt from.
- `%100 · 1 soru` can no longer be read as a strength: the band, the note, and
  the question count all say otherwise.
- An empty window is distinguished on screen from an empty history.
- Exam weighting per main topic and true distractor-level confusion pairs are
  deliberately absent. Both need data the bundle does not carry — authored
  editorial weights, and topic-tagged distractors — and neither may be inferred.
