# Design system

## Responsibility

[BRAND_IDENTITY.md](BRAND_IDENTITY.md) owns the working name, voice, personality, fixed palette, typeface choices, and unresolved identity decisions. This document owns the implementation system: semantic roles, scales, components, interaction states, layout behavior, and accessibility constraints.

The Milestone 2 light theme is warm, path-first, and mobile-native. It avoids a school-dashboard feel. Subject color communicates learning context; coral communicates the primary action and strongest current state.

## Semantic color roles

Components consume roles from `apps/mobile/src/shared/ui/theme/tokens.ts`; screen-level raw colors are not allowed.

- `background.app` and `background.subtle` separate the warm canvas from recessed areas.
- `surface.default`, `surface.elevated`, `surface.soft`, and `surface.inverted` define reusable surfaces.
- `text.primary`, `text.secondary`, `text.muted`, `text.inverse`, and `text.accent` define readable hierarchy.
- `border.subtle`, `border.strong`, and `border.accent` define structure without encoding behavior.
- `action.primary`, `action.primaryPressed`, `action.primarySoft`, secondary, ghost, and disabled roles define controls.
- `reward.xp`, `reward.trace`, their soft surfaces, and `reward.highlight` keep XP, İz, and checkpoint emphasis distinct.
- `subject.history`, `subject.geography`, `subject.philosophy`, and `subject.religion` provide primary, dark, and soft context roles.
- Status colors remain independent of subject identity and are always paired with text or a marker.

A future theme must implement the same semantic shape rather than changing component APIs.

## Type scale

Typography roles are `display`, `headingXL`, `headingL`, `headingM`, `bodyL`, `bodyM`, `bodyS`, `labelL`, `labelM`, and `caption`.

- Display and heading roles use Baloo 2 Bold or ExtraBold after fonts load.
- Body roles use Nunito Regular.
- Labels, buttons, and captions use Nunito Bold.
- System fonts remain the non-blocking startup/error fallback.
- Native font scaling stays enabled by default.

Font ownership, sourcing, licensing, and unresolved decisions live in [BRAND_IDENTITY.md](BRAND_IDENTITY.md).

## Scales

- Spacing: `xs` 4, `sm` 8, `md` 12, `lg` 16, `xl` 24, `xxl` 32, `xxxl` 48.
- Radius: `small` 12, `medium` 16, `large` 24, and `pill` 999.
- Elevation: one restrained `raised` preset for meaningful hierarchy.
- Primary control depth: 6 points of structural depth at rest, compressed on press.
- Motion: `instant` 0 ms, `fast` 120 ms, `standard` 220 ms, and `slow` 360 ms. Milestone 2.1 adds no animation library or custom motion engine.

## Primitives

- `AppText` applies semantic typography and text color while preserving native text props and scaling.
- `Screen` owns safe areas, page background, width constraints, optional scrolling, and optional keyboard avoidance.
- `AppButton` supports primary, secondary, and ghost variants, at least 48-point targets, structural primary depth, pressed behavior, disabled accessibility, and full width.
- `Card` supports default, elevated, and outlined surfaces without product behavior.
- `ProgressBar` clamps normalized progress and exposes accessible numeric progress. Visible text must accompany it.

Product rules do not belong in shared primitives.

## Path and state treatment

The path is the home screen’s visual center. A segmented trace is built with ordinary layout views; SVG, canvas, geometry engines, and animation packages are unnecessary.

- Completed: explicit check mark and “Tamamlandı”.
- Current: strongest coral outline/node and “Şimdi”.
- Available: subject-colored node and “Açık”.
- Locked: neutral treatment plus “Kilitli” text and marker; color is not the only cue.
- Checkpoint: reward-yellow accent plus “Kontrol noktası”.

The static History banner provides subject context while the continuation CTA remains coral.

## Mobile interaction

Primary continuation controls stay in a fixed lower action region on the home and lesson preview screens. Screen density remains mobile-native, safe areas are preserved, and important controls are usable one-handed. No bottom navigation is introduced in this milestone.

