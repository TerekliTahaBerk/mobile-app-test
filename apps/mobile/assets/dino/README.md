# Dino artwork

The approved Dino mascot ships in three transparent PNG poses:

- `dino.png` — general encouragement and neutral product moments
- `dino-writing.png` — onboarding questions and study guidance
- `dino-graduation.png` — placement results and completed work

All three retain alpha transparency. `src/shared/ui/dino/dino.tsx` is the only
module that loads the files; screens choose a semantic `pose`, `size`, and
optional subdued `tone` without importing image assets directly.
