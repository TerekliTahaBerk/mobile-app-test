# TEKRARLA

Mobile-first, gamified exam preparation for Turkish students. The pilot covers only TYT Sosyal Bilimler: Tarih, Coğrafya, Felsefe, and Din Kültürü ve Ahlak Bilgisi.

The repository contains the native product foundation, one validated draft
Tarih lesson, a deterministic learning engine, and device-local SQLite progress
covering XP, İz, mastery, review, mistakes, and session resume. The app is still
**not releasable**: the curriculum is one unreviewed draft topic, production
observability and store/legal work remain, and unfinished commercial/social
features stay gated. See [docs/RELEASE_READINESS.md](docs/RELEASE_READINESS.md).

## Requirements

- Node.js 22 LTS or another version supported by the pinned Expo SDK
- npm 10 or later
- Expo Go or an iOS/Android simulator for native preview

## Setup

```sh
npm install
npm run dev
```

Run quality checks from the repository root:

```sh
npm run lint
npm run typecheck
npm test
```

`npm run dev` starts Expo for `apps/mobile`. Pass Expo arguments after `--`, for example `npm run dev -- --offline`.

No secrets or backend configuration are required. Development defaults to the
approved design preview; run with `EXPO_PUBLIC_APP_MODE=productionPilot` to QA
the accountless durable pilot flow in a development build.

## Repository map

- `apps/mobile`: Expo Router application
- `docs`: product, architecture, domain boundaries, decisions, and execution plan
- `AGENTS.md`: concise permanent engineering instructions

Start with [docs/RELEASE_READINESS.md](docs/RELEASE_READINESS.md), [docs/PRODUCT.md](docs/PRODUCT.md), [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md), [docs/BRAND_IDENTITY.md](docs/BRAND_IDENTITY.md), [docs/DESIGN_SYSTEM.md](docs/DESIGN_SYSTEM.md), and [docs/EXECUTION/MVP.md](docs/EXECUTION/MVP.md).
