# Repository guide

This repository is the system of record for the Online Dershanem working product; `tekrarla` remains the transitional technical identifier. Read [README.md](README.md) for commands and [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) before changing application boundaries. Read [docs/BRAND_IDENTITY.md](docs/BRAND_IDENTITY.md) and [docs/DESIGN_SYSTEM.md](docs/DESIGN_SYSTEM.md) before changing user-facing visuals or copy.

## Permanent instructions

- Keep the pilot limited to TYT Sosyal Bilimler unless product scope is explicitly changed.
- Keep route files thin. Domain logic must not import React, React Native, Expo, or infrastructure adapters.
- Prefer small, feature-oriented modules and application-owned UI primitives.
- Keep XP, mastery, progress, and İz/streak concepts separate.
- Do not hardcode curriculum or exercise content into screens; author it in the content bundle.
- Never mark AI- or engineering-written content as `reviewed` or `approved`. Only a human subject-matter review may do that.
- Add dependencies only for a demonstrated current need; use Expo-compatible versions for native packages.
- User-facing copy is Turkish. Code, identifiers, documentation, and commits are English.
- Every change must pass `npm run lint`, `npm run typecheck`, and `npm test`.
- Record material architectural decisions under `docs/DECISIONS/` and update the relevant source-of-truth document rather than duplicating it.

## Documentation map

- Product scope: [docs/PRODUCT.md](docs/PRODUCT.md)
- Architecture: [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)
- Brand identity: [docs/BRAND_IDENTITY.md](docs/BRAND_IDENTITY.md)
- Design system: [docs/DESIGN_SYSTEM.md](docs/DESIGN_SYSTEM.md)
- MVP sequence: [docs/EXECUTION/MVP.md](docs/EXECUTION/MVP.md)
- Release blockers: [docs/RELEASE_READINESS.md](docs/RELEASE_READINESS.md)
- Content and engine decisions: [docs/DECISIONS/0002-content-contract-and-learning-engine.md](docs/DECISIONS/0002-content-contract-and-learning-engine.md)
- Remaining domain documents: [docs/](docs/)
