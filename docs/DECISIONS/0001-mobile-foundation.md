# ADR 0001: Mobile foundation

- Status: Accepted
- Date: 2026-08-26

## Context

The empty repository needs a low-risk mobile foundation that can prove navigation and engineering quality without prematurely implementing product systems.

## Decision

Use React Native with the current pinned Expo SDK, Expo Router, strict TypeScript, and npm workspaces. Place the mobile app at `apps/mobile`. Keep route files thin and product/domain logic independent of React Native and Expo. Use Jest through `jest-expo` and React Native Testing Library.

Do not add a global state library, large UI framework, custom Metro monorepo configuration, authentication, Supabase, SQLite, or product-domain implementations during the foundation milestone.

## Consequences

Expo provides an integrated native toolchain and compatible package versioning. File-based routes establish a clear navigation convention and support typed routes. The workspace layout leaves room for future tooling without forcing shared packages before a second consumer exists.

The team accepts Expo's upgrade cadence and will validate SDK upgrades explicitly. More advanced state, persistence, and server-cache tools will be introduced only when a milestone demonstrates their need.

