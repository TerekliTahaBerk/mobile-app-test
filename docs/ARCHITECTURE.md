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
- `src/modules/<domain>` contains feature code, introduced only when needed.
- `src/shared/ui` contains tokens and reusable presentation primitives without product rules.
- `src/shared/platform` will contain replaceable external adapters.
- Domain code cannot import React, React Native, Expo Router, Supabase, or UI components.
- Content and curriculum data cannot be embedded in screens.

State remains local by default. An active lesson will use a deterministic feature-scoped reducer. Durable state will sit behind repository interfaces. No global state library is justified yet.

Supabase and PostgreSQL are the intended backend, but authentication and backend integration are deferred until the local vertical slice is proven. SQLite is the intended structured local store and is also deferred.

See [DECISIONS/0001-mobile-foundation.md](DECISIONS/0001-mobile-foundation.md) for the accepted foundation decision and [SECURITY.md](SECURITY.md) for trust boundaries.

