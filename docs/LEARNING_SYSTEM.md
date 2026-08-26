# Learning system

The learning engine will be pure TypeScript, deterministic for the MVP, and independent of React Native. The intended policy boundaries are lesson session reduction, exercise evaluation, recommendation, mastery update, review scheduling, and path progression.

An answer should produce structured evidence and domain events rather than directly mutating UI or analytics. XP measures activity; mastery estimates skill knowledge. Neither implies the other.

The first vertical slice will eventually support immediate feedback, multiple exercise renderers, completion, XP, progress, and a return to the path. None of this logic is part of the repository-foundation milestone.

Open decisions include the v1 mastery formula, review intervals, confidence input, streak timezone rules, and the exact recommendation priority between new lessons, due review, and mistakes.

Curriculum references are defined in [CURRICULUM_MODEL.md](CURRICULUM_MODEL.md); exercise content boundaries are in [CONTENT_MODEL.md](CONTENT_MODEL.md).

