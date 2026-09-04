# Content model

Curriculum and exercise content are versioned product assets, not screen constants. Contracts live in `apps/mobile/src/modules/curriculum/domain/content-types.ts`; the shipped bundle lives under `src/modules/curriculum/content/`.

## Where content is authored

Content is JSON under `src/modules/curriculum/content/data/`: `curriculum.json`
for the exam/subject/unit skeleton, and one file per unit under `data/units/`
holding that unit's topics, skills, concepts, lessons, exercises and path nodes.
Every record carries its own `provenance`, so review status is recorded per
question rather than shared by the whole bundle.

`tyt-draft-bundle.ts` only assembles those files. New units are added by
dropping in a file and listing it in `content/units.ts`, which the bundler needs
because it resolves modules at build time and cannot read a directory.

Authored data passes two gates before it becomes a bundle, in this order:

```text
JSON -> assertParsedContentBundle (shape) -> assertValidContentBundle (references)
```

The first proves each record is the shape its kind claims — an unknown exercise
kind, a missing prompt, a difficulty outside 1–5, a review status that is not
one of the three. The second checks identity, references, taxonomy and answer
integrity, and is entitled to assume the first has run. Both report every issue
at once rather than throwing on the first.

## Bundle

A published bundle identifies `schemaVersion`, `curriculumVersion`, `contentVersion`, `locale`, and optional `publishedAt`, and carries flat collections of exams, subjects, units, topics, skills, concepts, exercises, lessons, and path nodes. Records reference each other by stable string ID; nothing is identified by array position, so content can be reordered and versioned without touching UI.

The learner-facing topic taxonomy reuses that hierarchy deliberately:

```text
Unit  = ana konu
Topic = alt konu
Skill = ölçülen kazanım
```

Questions map to one or more skills. The content index derives their subtopics
from those skills and their single main topic from the owning unit; authors do
not duplicate topic IDs on every exercise. A question may measure multiple
subtopics only when all of them belong to the same main topic.

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

Rendering and evaluation are registered separately by kind. Multiple choice,
true/false, fill-blank, matching, ordering, and flashcard exercises all have
renderers. Adding a type still means adding a contract, evaluator, renderer, and
validation support; the lesson engine does not change. Audio remains future scope.

Flashcards are self-reported recall: they complete and produce skill evidence, but are never marked right or wrong and never award correctness XP. Every *scored* exercise must map to at least one skill.

## Provenance and review

Every lesson and exercise carries `provenance` with an author and a `reviewStatus` of `draft`, `reviewed`, or `approved`.

**Production content requires `approved`, and `approved` means a human subject-matter reviewer signed it off.** Engineering demo content stays `draft` no matter how finished it looks. Marking AI-written or engineering-written material as reviewed or approved is prohibited.

`reviewed` and `approved` records must also carry non-empty `reviewedBy` and
`reviewedAt` metadata. The production-pilot bundle uses approved lessons as its
roots, retains only their required exercises and taxonomy, and then validates
the closed result with the production gate. A referenced draft exercise makes
that gate fail; it is never silently removed from an otherwise approved lesson.
Subjects and units with no approved lesson are absent from the production
catalogue, so list screens and direct routes share the same visibility rule.

CI runs `npm run content:production:check` before the full test suite. This is
the release invariant that prevents a draft or unattributed review from being
compiled into the learner-facing bundle.

Copied ÖSYM questions are prohibited. Production material must be original and academically reviewed before publication.

## Validation

`validateContentBundle` runs over the bundle at load and throws a `ContentValidationError` listing every issue with a dotted path and an actionable message. It catches duplicate IDs, broken references in either direction, unsupported exercise kinds inside a lesson, scored exercises with no skill, exercises whose skills cross main-topic boundaries, unanswerable exercises (a correct option that is not among the options, a solution token missing from the bank, ambiguous matching pairs, an ordering that does not cover its items), self-referential prerequisites, duplicate path order within a unit, and schema-version mismatch.

The project intentionally carries **no schema-validation dependency**. The bundle is authored in TypeScript and compiled with the app, so its shape is already proven by `tsc`; what the compiler cannot see is whether the strings that link records resolve, and whether an exercise is answerable. Those are exactly what the validator checks. When content later arrives from a server, a structural pass belongs *in front of* this function, not instead of it.

## Current state

The bundle contains the 25-unit 2027 TYT Tarih draft: 49 topics, 96 measurable
skills, 55 lessons, 55 chained path nodes and 331 exercises. Every lesson and
exercise is `draft`; none is production academic content. The three original
unit IDs and their authored records were retained, while the curriculum order
and cross-unit prerequisites now follow the 2027 draft scope. Catalogue entries
without units are not usable curriculum and production screens do not present
them as such.

The bundle also contains a 15-unit 2027 TYT Din Kültürü ve Ahlak Bilgisi
AI-assisted draft under the stable subject id `tyt.religion`: 45 topics, 90
measurable skills, 45 lessons, 45 chained path nodes and 315 exercises. Direct
verse/hadith quotations and numbered source references are intentionally absent
from this first draft. Every lesson and exercise remains `draft` until a DKAB
teacher or theology subject-matter reviewer approves it.
