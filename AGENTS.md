# Repository guide

This repository is the system of record for the TYT Sosyal learning platform. Read [README.md](README.md) for commands and [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) before changing application boundaries.

## Permanent instructions

- Keep the pilot limited to TYT Sosyal Bilimler unless product scope is explicitly changed.
- Keep route files thin. Domain logic must not import React, React Native, Expo, or infrastructure adapters.
- Prefer small, feature-oriented modules and application-owned UI primitives.
- Keep XP, mastery, progress, and streak concepts separate.
- Do not hardcode curriculum or exercise content into screens.
- Add dependencies only for a demonstrated current need; use Expo-compatible versions for native packages.
- User-facing copy is Turkish. Code, identifiers, documentation, and commits are English.
- Every change must pass `npm run lint`, `npm run typecheck`, and `npm test`.
- Record material architectural decisions under `docs/DECISIONS/` and update the relevant source-of-truth document rather than duplicating it.

## Documentation map

- Product scope: [docs/PRODUCT.md](docs/PRODUCT.md)
- Architecture: [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)
- MVP sequence: [docs/EXECUTION/MVP.md](docs/EXECUTION/MVP.md)
- Remaining domain documents: [docs/](docs/)

