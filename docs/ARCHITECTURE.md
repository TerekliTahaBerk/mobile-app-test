# Architecture

## Foundation

The client is a TypeScript-strict React Native app on the current pinned Expo SDK. Expo Router owns navigation. The repository uses npm workspaces, with the app at `apps/mobile`.

The product is a modular monolith. Routes compose screens; product modules own application and domain behaviour; shared platform adapters implement persistence, analytics, flags, and later network access.

```text
route -> module UI -> application use case -> domain
                                  \-> repository interface
platform adapter --------------------> implementation
```

## Boundaries

- `src/app` contains route and layout files only.
- `src/modules/<domain>` contains feature code, introduced only when needed. A
  module may layer internally as `domain/` (pure rules), `application/` (use
  cases and React bridges), `content/` (authored assets), `model/` (view
  models), and `ui/` (screens and components).
- `src/shared/config` holds build-mode configuration and feature flags.
- `src/shared/ui` contains tokens and reusable presentation primitives without product rules.
- `src/shared/platform` will contain replaceable external adapters.
- Domain code cannot import React, React Native, Expo Router, Supabase, or UI components.
- Content and curriculum data cannot be embedded in screens.

State remains local by default. An active lesson uses a deterministic
feature-scoped reducer in `modules/learning/domain`, bridged to React by a
single provider in `modules/learning/application`. Durable state will sit behind
repository interfaces. No global state library is justified yet.

Curriculum content is a compiled-in versioned bundle validated at load
(`modules/curriculum`). The loader is the seam that changes when content later
arrives over the network.

Supabase and PostgreSQL are the intended backend, but authentication and backend integration are deferred until the local vertical slice is proven. SQLite is the intended structured local store and is also deferred.

See [DECISIONS/0001-mobile-foundation.md](DECISIONS/0001-mobile-foundation.md) for the accepted foundation decision and [SECURITY.md](SECURITY.md) for trust boundaries.

