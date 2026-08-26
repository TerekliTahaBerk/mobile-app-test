# Content model

Curriculum and exercise content are versioned product assets, not screen constants. A published bundle should identify its schema version, curriculum version, content version, and locale, and use stable IDs throughout.

Exercise definitions will form a discriminated union. Rendering and answer evaluation will be registered by exercise kind so new types do not require changing the central lesson engine. Exercise records should retain skill mappings, difficulty, explanation, distractor metadata where relevant, and provenance/review status.

Engineering demo content must be tiny, original, replaceable, and marked non-production. Copied ÖSYM questions are prohibited. Production content requires validation and academic review before publication.

No curriculum schema, demo lesson, content validator, or CMS is implemented in Milestone 1.

