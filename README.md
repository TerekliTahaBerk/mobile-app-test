# TYT Sosyal Learning Platform

Mobile-first, gamified exam preparation for Turkish students. The pilot covers only TYT Sosyal Bilimler: Tarih, Coğrafya, Felsefe, and Din Kültürü ve Ahlak Bilgisi.

The repository currently contains only the engineering foundation. Product screens, curriculum, learning logic, persistence, authentication, and backend integration have not been implemented.

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

No environment variables are required for the foundation. Add a root `.env.example` only when a milestone introduces configuration.

## Repository map

- `apps/mobile`: Expo Router application
- `docs`: product, architecture, domain boundaries, decisions, and execution plan
- `AGENTS.md`: concise permanent engineering instructions

Start with [docs/PRODUCT.md](docs/PRODUCT.md), [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md), and [docs/EXECUTION/MVP.md](docs/EXECUTION/MVP.md).

