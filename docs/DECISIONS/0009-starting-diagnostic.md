# 0009 — Starting diagnostic

**Status:** Accepted  
**Date:** 2026-08-28

## Decision

A learner who chooses "Seviyemi ölç" during onboarding answers one diagnostic
sampled across every main topic and subtopic that has scored material, and lands
on a starting map plus their first daily plan instead of an empty performance
screen. "Sıfırdan başla" remains, and goes straight to Home.

The diagnostic's length follows from coverage, not from a round number. Each
subtopic contributes up to three questions — the evidence bar the topic report
uses before it will label anything — and never more, so no subtopic can dominate
the map; a subtopic with thinner material contributes what it has. One sitting
is capped at twenty questions. With the current draft bundle this yields
thirteen questions across five subtopics.

Questions are asked easiest-first within a subtopic and never twice in a row
from the same one.

**The diagnostic does not move the learner along the path.** It carries no path
node, so it cannot mark or unlock curriculum the learner has not worked through
in Öğren. The onboarding copy was changed from "doğru üniteden başla" to
"konu haritanı çıkarayım" to stop promising a shortcut the app will not take.

The starting map is not a new kind of result. It is the ordinary topic report
read straight after the diagnostic — the first evidence — and the first plan is
the ordinary daily plan. Nothing on the screen can therefore claim more than the
answers support.

## Consequences

- A diagnostic that cannot be assembled never traps a new learner on
  onboarding; the flow falls through to Home and the path is still there.
- The diagnostic consumes a large share of a thin bundle (thirteen of
  twenty-two scored questions today), which leaves the daily plan's new-material
  bucket short for a while afterwards. That is a content-breadth limit, and both
  screens state their real numbers rather than hiding it.
- `buildDailyPlanCard` moved to `modules/learning/model/daily-plan-card.ts` so
  Home and the placement result state the plan with the same words.
- Running the diagnostic surfaced a blocking defect that no single authored
  lesson could reach: exercise renderers keep the learner's draft answer in
  their own state, and the lesson screen reused one instance across questions of
  the same kind. The second ordering question inherited the first's placements,
  rendered blank slots, and could never be submitted. The screen now keys the
  renderer by exercise id.
