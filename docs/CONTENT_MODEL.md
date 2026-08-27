# Content model

Curriculum and exercise content are versioned product assets, not screen constants. Contracts live in `apps/mobile/src/modules/curriculum/domain/content-types.ts`; the shipped bundle lives under `src/modules/curriculum/content/`.

## Bundle

A published bundle identifies `schemaVersion`, `curriculumVersion`, `contentVersion`, `locale`, and optional `publishedAt`, and carries flat collections of exams, subjects, units, topics, skills, concepts, exercises, lessons, and path nodes. Records reference each other by stable string ID; nothing is identified by array position, so content can be reordered and versioned without touching UI.

`schemaVersion` is bumped when the contracts change shape. The app refuses a bundle whose schema version it does not understand.

## Stable IDs

```text
exam       tyt
subject    tyt.social.history
unit       tyt.social.history.first-turkish-states
topic      tyt.social.history.first-turkish-states.kurultay
skill      skill.history.kurultay.function
concept    concept.history.kurultay
lesson     lesson.history.kurultay.001
exercise   exercise.history.kurultay.001.mcq01
path node  path.history.first-turkish-states.03
```

## Exercises

`ExerciseDefinition` is a discriminated union over `kind`: `multipleChoice`, `fillBlank`, `flashcard`, `matching`, `ordering`. Every exercise carries an id, kind, skill mapping, prompt/payload, explanation, difficulty, and provenance. Content records are plain serializable data — no React, no components, no colours.

Rendering and evaluation are registered separately by kind. Adding a type means adding a contract, an evaluator, and a renderer; the lesson engine does not change.

`ordering` is contracted but has no approved screen, so content validation rejects it inside a lesson until one exists. Audio remains future scope.

Flashcards are self-reported recall: they complete and produce skill evidence, but are never marked right or wrong and never award correctness XP. Every *scored* exercise must map to at least one skill.

## Provenance and review

Every lesson and exercise carries `provenance` with an author and a `reviewStatus` of `draft`, `reviewed`, or `approved`.

**Production content requires `approved`, and `approved` means a human subject-matter reviewer signed it off.** Engineering demo content stays `draft` no matter how finished it looks. Marking AI-written or engineering-written material as reviewed or approved is prohibited.

Copied ÖSYM questions are prohibited. Production material must be original and academically reviewed before publication.

## Validation

`validateContentBundle` runs over the bundle at load and throws a `ContentValidationError` listing every issue with a dotted path and an actionable message. It catches duplicate IDs, broken references in either direction, unsupported exercise kinds inside a lesson, scored exercises with no skill, unanswerable exercises (a correct option that is not among the options, a solution token missing from the bank, ambiguous matching pairs, an ordering that does not cover its items), self-referential prerequisites, duplicate path order within a unit, and schema-version mismatch.

The project intentionally carries **no schema-validation dependency**. The bundle is authored in TypeScript and compiled with the app, so its shape is already proven by `tsc`; what the compiler cannot see is whether the strings that link records resolve, and whether an exercise is answerable. Those are exactly what the validator checks. When content later arrives from a server, a structural pass belongs *in front of* this function, not instead of it.

## Current state

One tiny original Tarih lesson (`lesson.history.kurultay.001`, five exercises) is shipped to prove the contract end to end. It is `draft`. It is not production academic content and is expected to be replaced.
