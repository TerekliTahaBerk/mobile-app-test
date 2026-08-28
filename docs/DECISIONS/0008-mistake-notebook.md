# 0008 — Mistake notebook

**Status:** Accepted  
**Date:** 2026-08-28

## Decision

The durable mistake records are opened to the learner as a notebook: the
question as it was asked, the answer they gave, the right answer, the
explanation, the main topic and subtopic, how many times that question has been
missed, when the skill was last worked, and a one-tap drill of other questions
measuring the same subtopic.

**A learner cannot delete or dismiss a mistake.** There is no delete control and
no "mark as learned" button. A mistake closes exactly one way — the way it
already closed before this screen existed: a clean first-attempt answer on the
same skill during a repeat. The screen states that rule in place of the missing
button, and shows closed records under "Artık öğrendiklerin" rather than
removing them.

`MistakeRepository` gains `listAll`, because a notebook that only listed open
records could not show what the learner has closed.

Per-kind learner-facing answer text — the prompt, the right answer, and a
submitted answer — is registered next to each evaluator in
`evaluator-registry.ts`. Evaluation and the notebook therefore read the right
answer from one place and cannot describe it differently. Stored answers are
parsed defensively: an answer that no longer matches its exercise renders as
absent, never as a crash.

## Consequences

- The notebook is a read model. It performs no writes at all, so opening it can
  neither resolve nor reopen anything.
- A record whose question has left the content bundle stays in storage but is
  omitted from the notebook, matching the rule topic performance already uses.
- "Kaç kez yanlış" counts wrong answers to that specific question, which the
  learner can verify against their own history; the skill-level view stays in
  topic performance.
- Profil's menu carries the open-mistake count, so the notebook is discoverable
  without adding a fifth tab.
