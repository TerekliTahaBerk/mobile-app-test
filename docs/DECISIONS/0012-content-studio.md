# 0012 — Content studio

**Status:** Accepted  
**Date:** 2026-08-29

## Decision

The content tool is a separate web app in the same repository — `apps/studio`,
Vite and React, run locally with `npm run studio`. It is not a hidden mode of
the mobile app and it is not a hosted CMS.

**Not inside the app.** Editors do not work on phones, authored content is a
compiled asset the app cannot write, and an editor built into the shipped binary
is shipped to learners.

**Not a backend CMS.** Milestone 9 has not started. A CMS would add accounts,
authentication, hosting and a privacy review to solve a problem two people have.
Git already provides versioning, diffs, attribution and irreversible history —
which is exactly what makes "only a human subject-matter review may approve"
provable: an approval is a commit, and the commit says who made it.

**One validator, not two.** The studio imports the app's own
`assertParsedContentBundle` and `validateContentBundle` and runs them in the
app's own order. It therefore cannot approve content the app would refuse to
load, and its issue list is literally what the app throws at startup.

**The review guard uses a repository registry and the domain workflow.** A
free-text name is not identity. Studio selects a reviewer from
`content/data/reviewers.json`; every entry has a stable id, display name,
active/inactive status and authorized subjects. The shared transition function
requires an active human subject-matter expert, forbids `draft → approved`, and
stamps reviewer id, display-name snapshot, time, content version and curriculum
version. Lessons and exercises are signed independently. The app's validator
rechecks the registry and metadata, so editing JSON cannot bypass the UI guard.

The registry contains no placeholder people. Adding or changing a reviewer and
every review transition are ordinary repository diffs, so PR review and Git
history provide the external audit trail while the attestation in the content
record identifies exactly which content/curriculum versions were signed.

Editing is field-driven: each exercise kind declares its fields in
`model/exercise-fields.ts` and one generic form renders them. A new exercise
kind is a contract, an evaluator, a renderer and an entry there — not a seventh
bespoke editor screen that drifts from the other six.

**Navigation follows the author, not the file.** The files are flat arrays
because that is what diffs well and what the app reads; the tool shows unit →
topic → lesson → question, with each level's "add" sitting on that level. An
author should never have to know that a lesson and its questions live in
different arrays of the same file.

**Creating is a first-class action.** Units, topics, skills, lessons and
questions are all created in the tool. Ids are derived once from the title —
slugged through Turkish letters, deduplicated against every id in the bundle —
and then never rewritten, because an id is what lessons and attempt history
point at. A new lesson is chained onto the end of its unit's path, so
progression stays a single line.

**Renaming changes the title and nothing else.** Ids stay put because lessons,
path nodes and the learner's own progress records all point at them. A lesson's
name is also what the path shows, so renaming one renames both.

**Deleting says what goes before it goes**, counted rather than implied: "this
lesson, its step on the path, and the 6 questions in it". Deleting a lesson or a
topic rebuilds the unit's path into a single chain — node ids are left alone,
order and prerequisites are recomputed — so a removed step never leaves a gap
that blocks the ones after it. Nothing is soft-deleted: the repository is the
store, so a deletion is a deletion in git and recoverable there.

**Order is editable everywhere it means something**, by dragging or by the
arrow buttons beside it — neither replaces the other, because dragging is the
fast way and the keyboard is the only way for some people. Questions reorder
within their lesson and move between the lessons of their own subtopic; topics
reorder within their unit; units reorder within their subject.

A unit's path is one chain across all of its topics, so it cannot be reordered
from inside a topic without lying about what the list is. It gets its own view —
"Yol sırası" — where the only question is what comes after what. Reordering
there rewrites the chain, so a step's prerequisite is always whatever now sits
before it.

New records are complete placeholders rather than empty ones: a half-formed
record would fail the shape gate and take the whole bundle — and therefore the
rest of the tool — down with it. For the same reason the "new unit" and "new
topic" forms ask for the first topic and the first skill in the same step; a
unit with no topic cannot be valid, and leaving the author on a broken bundle
for three more steps would be a poor trade for a smaller form.

## Consequences

- Root `lint`, `typecheck` and `test` now run across workspaces, so the studio
  is held to the same gates as the app.
- The studio's own tests use Node's built-in runner with TypeScript stripping,
  which costs no new dependency. They cover the write-path guard and the
  coverage counting; the validation path is covered by the mobile suite that
  already tests both gates.
- Exercise ids are shown but not editable. Renaming one would silently orphan
  the lessons that reference it and the attempt history the tool cannot see.
- `content/units.ts` is generated from the content directory whenever a unit is
  written. The bundler cannot read a directory, so the import list has to exist;
  generating it means adding a unit is one action in the tool rather than an
  edit the author has to remember to make in TypeScript.
- Writes are confined to the content directory and to ids matching a content-id
  pattern: a path arriving over HTTP is input even when the server is local.
- The coverage report counts questions per skill, the review split, and the
  difficulty spread, so "this unit is finished" is a claim the tool can
  contradict with numbers.
- The preview shows the question as asked and what counts as correct, read
  through the app's own describers. It is deliberately not a picture of the
  native screens: reproducing them on the web would be a second renderer that
  drifts from the first, and the panel says so on the screen.
- Not built yet: reading learner question reports, which stay on the device
  until backend synchronisation exists.
