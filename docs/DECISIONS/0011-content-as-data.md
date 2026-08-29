# 0011 — Content as data, and its shape gate

**Status:** Accepted  
**Date:** 2026-08-29

## Decision

Authored content moves out of a TypeScript literal into JSON data files, one per
unit, plus a curriculum file for the exam/subject/unit skeleton. The bundle
module becomes a thin assembler that keeps the same public surface.

This is the enabling step for the content tool, and it pays for itself without
one: a 997-line module is a file two people cannot edit at once and whose diffs
are unreadable. Per-unit files diff as the records that changed, and every
record now carries its own `provenance` instead of sharing one `DRAFT` constant
— which is what makes "this question was reviewed, by that person, on that date"
recordable at all.

JSON has no types, so the compiler no longer catches a misspelled kind or a
missing prompt. `assertParsedContentBundle` does: a shape gate that runs before
the existing reference validator and reports every malformed record at once.
The two stages have separate jobs and the second is entitled to assume the
first has run:

```text
JSON -> assertParsedContentBundle (shape) -> assertValidContentBundle (references) -> ContentIndex
```

Files are imported explicitly in `content/units.ts` because the app bundler
resolves modules at build time and cannot read a directory. Adding a unit means
adding its file and one line.

## Consequences

- `tyt-draft-bundle.ts` goes from 997 lines to 61; the content itself is in
  `content/data/`.
- The single assertion that turns authored data into `ContentBundle` sits at one
  place and is earned: every record was proved first.
- A new `malformedRecord` issue code joins the validator's vocabulary, so the
  content tool can render authoring mistakes with the same reporting the app
  already throws on startup.
- Content still ships inside the app binary. Nothing here creates a delivery
  mechanism; when Milestone 9 lands, these files become the sync payload.
- The content tool (`apps/studio`) is not built yet. This decision only makes it
  possible to build one that is not a TypeScript-source editor.
