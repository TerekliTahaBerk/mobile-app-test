# Online Dershanem

Mobile-first, gamified exam preparation for Turkish students. Online Dershanem
is the working product name; `tekrarla` remains in technical identifiers until
commercial name and trademark clearance are complete.

The production pilot is limited to TYT Sosyal Bilimler. The compiled 2027 draft
bundle currently makes only Tarih usable: 55 lessons across 25 units, 55 path
nodes and 331 exercises. All authored material remains AI-assisted or
engineering-written `draft` content.
Catalogue-only subjects are not shown as available in the production pilot.

The repository contains the native product foundation, deterministic learning
engine, first-launch onboarding, and device-local SQLite progress covering XP,
İz, mastery, review, mistakes, resumable sessions, and derived profile metrics.
The app is still **not releasable**: human academic review and broad curriculum,
production analytics/crash-provider deployment, native/accessibility QA, and
store/legal work remain. See [docs/RELEASE_READINESS.md](docs/RELEASE_READINESS.md).

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

`npm run build` creates the static Expo web export in `apps/mobile/dist`. Vercel
uses this command and output path through the repository's `vercel.json`.

No secrets or backend configuration are required. Development defaults to the
approved design preview; run with `EXPO_PUBLIC_APP_MODE=productionPilot` to QA
the accountless durable pilot flow in a development build.

## Content studio

Authored content lives as JSON under
`apps/mobile/src/modules/curriculum/content/data/`. To write or review it:

```sh
npm run studio
```

The tool opens on `http://localhost:5174`. It navigates unit → topic → lesson →
question; creates, renames, reorders (by dragging or with the arrow keys) and deletes all
five; edits questions of
every exercise kind; previews what the learner will be asked; and reports
coverage per skill. It edits the
content files in place and validates with the app's own two gates, so anything
it saves is content the app will load. Reviewers come from the repository's
stable human-expert registry; signed status changes include identity, time and
content/curriculum versions in the diff, while Git/PR history is the audit trail.

## Repository map

- `apps/mobile`: Expo Router application
- `apps/studio`: local content authoring and academic review tool
- `docs`: product, architecture, domain boundaries, decisions, and execution plan
- `AGENTS.md`: concise permanent engineering instructions

Start with [docs/RELEASE_READINESS.md](docs/RELEASE_READINESS.md), [docs/PRODUCT.md](docs/PRODUCT.md), [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md), [docs/BRAND_IDENTITY.md](docs/BRAND_IDENTITY.md), [docs/DESIGN_SYSTEM.md](docs/DESIGN_SYSTEM.md), and [docs/EXECUTION/MVP.md](docs/EXECUTION/MVP.md).
