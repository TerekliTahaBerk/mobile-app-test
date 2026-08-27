# 0002 — Content contract and deterministic learning engine

**Status:** Accepted · Release Phase 1 (Milestones 3 and 4)

## Context

The app had a complete approved interface driven entirely by presentation-only
fixtures. Turning it into a product required real curriculum contracts and real
learning behaviour without redesigning any screen, and without pulling domain
rules into React components.

## Decisions

### Content is a versioned bundle of flat, ID-linked records

`ContentBundle` carries `schemaVersion`, `curriculumVersion`, `contentVersion`,
`locale`, and flat collections. Records reference each other by stable string
ID; nothing is identified by array position. A `ContentIndex` provides
by-ID lookup so screens never walk the hierarchy.

Exercises are stored flat rather than nested inside lessons. This makes
duplicate-ID and reference validation uniform, and leaves room for an exercise
to be reused by more than one lesson.

### Path nodes are modelled separately from topics

A `PathNode` has its own id, kind, order, prerequisites, and optional lesson.
A topic can span several nodes and a checkpoint can span several topics, so
coupling the visual path to the curriculum hierarchy would have been wrong.

### No schema-validation dependency

Zod was considered and rejected. The bundle is authored in TypeScript and
compiled with the app, so its *shape* is already proven by `tsc`. Every failure
mode that actually matters here is referential or semantic — a lesson pointing
at a missing exercise, a correct option that is not among the options, an
ambiguous matching pair — and none of those are expressible as a schema. Adding
a dependency would have re-verified what the compiler proved while leaving the
real checks to hand-written code anyway.

`validateContentBundle` returns issues with a dotted path and an actionable
message, and `assertValidContentBundle` throws with all of them at load.

**Revisit when content arrives over the network.** A structural pass then
belongs *in front of* this validator, not instead of it.

### Evaluation is a registry, not a switch in the engine

`evaluateAnswer` dispatches through a registry keyed by exercise kind. The
lesson reducer never branches on kind. Adding an exercise type means adding a
contract, an evaluator, and a renderer — three additive changes, no engine edit.

### The engine is a pure reducer with an injected clock

`reduceLessonSession(state, command, deps) -> { state, events }`. No React, no
`Date.now()`; every command carries its own timestamp. This makes the engine
exhaustively testable without React Native — 32 of the suite's tests run against
it directly — and makes replay and persistence straightforward later.

### Flashcards are unscored

Self-reported recall completes and produces skill evidence, but is never marked
right or wrong and never awards correctness XP. The completion screen therefore
reports `correct / scored` rather than `correct / total`.

### The engine reports the first-completion XP bonus instead of awarding it

The engine holds no history, so it cannot know whether a path level has been
completed before. `LessonCompleted` carries `firstCompletionBonusXp` and
`pathNodeId` as a candidate; the future progression layer decides. This keeps
duplicate prevention in the layer that owns durable state.

### Feature flags are a compile-time constant

`APP_MODE` is `designPreview` under `__DEV__` and `productionPilot` otherwise.
League and Plus are off in a pilot: their tabs disappear and their routes
redirect. A flag service is Milestone 8; a constant is enough to stop a pilot
build advertising features that do not work.

## Consequences

- One real lesson runs end to end; everything else on the path stays tagged
  `preview` and is not openable.
- Nothing persists. Session XP is real but lost on restart, and the
  first-completion bonus cannot be awarded until Milestone 6.
- Demo content is `draft` and must never be marked `approved` without a human
  subject-matter review.
