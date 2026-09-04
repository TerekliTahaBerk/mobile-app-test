# Design system

## Responsibility

[BRAND_IDENTITY.md](BRAND_IDENTITY.md) owns the working name, voice, mascot, palette and typeface choices. This document owns the implementation system: semantic roles, scales, components, interaction states, layout behaviour, and accessibility constraints.

The implemented system is the approved Claude Design project **Online Dershanem Oyun v2**. It is a game loop: bright, physical, and built around one obvious next action per screen.

## Semantic colour roles

Components consume roles from `apps/mobile/src/shared/ui/theme/tokens.ts`. The raw palette lives in a private `palette` object in that file and is never read directly by a component; screen-level raw colours are not allowed.

- `background.app` / `background.lesson` — the canvas behind the tab shell, and the white exercise canvas.
- `background.flashcard` / `background.celebration` / `background.streak` / `background.premium` — the four full-bleed stages: dark green recall, brand-green payoff, amber streak, warm paywall.
- `background.scrim` — the dim behind the exit sheet.
- `surface.default`, `surface.soft`, `surface.recessed`, `surface.recessedSoft`, `surface.sheet`, `surface.onDark`, `surface.onDarkStrong`.
- `text.*` — `primary`, `secondary`, `muted`, `faint`, `inverse`, `onDark`, `onDarkFaint`, `accent`, `accentStrong`, `accentSoft`, `disabled`.
- `border.hairline`, `border.subtle`, `border.strong`, `border.dashed`, `border.accent`, `border.onDark`.
- `action.*` — `primary`, `danger`, `neutral`, `inverse`, `disabled`, each with its structural `…Depth` companion.
- `progress.track`, `progress.fill`, `progress.gain`, and their `…OnDark` counterparts. `gain` is the lighter segment showing what the current round just added.
- `status.*` — success and danger surfaces, borders and ink, always paired with a glyph and a word.
- `reward.*` — XP, streak, heart and badge tones, kept distinct from one another.
- `path.*` — node faces, edges and glyph tints for locked, current and checkpoint states, plus the two track tones.
- `navigation.*` — the tab bar surface, hairline, and its active/inactive tints.
- `subject.history | math | turkish | physics | chemistry | biology | geography | philosophy` — `primary`, `depth`, `ink`, `deep`, `soft`, `border`.

A subject's colours are resolved through `shared/ui/theme/subject-theme.ts`, keyed by the `themeKey` on the content record. **Screens never branch on a subject ID.**

A future theme must implement the same semantic shape rather than changing component APIs.

## Type scale

Roles are `display`, `headingXXL`, `headingXL`, `headingL`, `headingM`, `headingS`, `headingXS`, `numeric`, `question`, `questionS`, `bodyL`, `bodyM`, `bodyS`, `prose`, `proseS`, `proseXS`, `labelL`, `labelM`, `labelS`, `caption`, `eyebrow`, `hud`, `mono`, `monoM`.

- Display, heading, question, numeric, label, caption, eyebrow and `hud` roles render in **Manrope ExtraBold**.
- `bodyL` and `bodyS` use Manrope Bold; `bodyM` uses ExtraBold, because it is the row-title weight.
- `prose`, `proseS` and `proseXS` use Manrope Regular.
- `mono` and `monoM` use **JetBrains Mono Medium**, and are reserved for counters and XP figures.
- System fonts remain the non-blocking startup and error fallback: a font failure can never produce a blank screen.

## Spacing, radius, depth

- `spacing` runs 2 · 4 · 8 · 11 · 14 · 20 · 22 · 26 · 34.
- `radii` runs 6 · 12 · 16 · 18 · 22 · 24 (node) · 32 (sheet) · 999 (pill).
- `depth` is the physical system: `button` and `node` 4pt, `nodeCurrent` 5pt, `cardBorder` 4pt.

Depth is drawn two ways, never with a blur: a solid offset edge beneath a pressable face (`TactilePressable`), and a thickened bottom border on cards and options. Pressing a tactile control translates the face down onto its edge.

## Components

Shared primitives (`shared/ui/components`): `AppText`, `AppButton`, `Card`, `ProgressBar`, `StepProgress`, `SegmentedToggle`, `HudChip`, `EyebrowPill`, `TactilePressable`, `Screen`, `BottomAction`, and the SVG icon set in `icons.tsx`.

- `AppButton` variants: `primary`, `danger`, `neutral` (outlined), `inverse` (white on a coloured stage), `ghost` (quiet text action).
- `HudChip` renders the streak and hearts counters, and speaks its own value — `∞` for an unlimited account.
- `icons.tsx` transcribes the design's icon set one-for-one at its two source viewBoxes (20 and 24). Every icon is decorative; the control that owns it carries the label.

Mascot: `shared/ui/dino/dino.tsx` owns the general, writing, and graduation
poses; `dino-speech.tsx` uses the writing pose for study prompts. Consumers
select a semantic pose and never import mascot files directly.

Motion (`shared/ui/motion`): `Bob`, `Pulse`, `Pop`, `Shake`, all on React Native's built-in `Animated`, all collapsing to a static frame under Reduce Motion. Only the current path node pulses.

## Layout behaviour

- Screens own their own horizontal rhythm; `Screen` owns safe areas and the page background.
- A screen with a fixed bottom action opts out of the bottom safe inset and consumes it inside `BottomAction`.
- The unit path is a fixed 100pt row rhythm with a 104pt node column; the connecting track is drawn behind the nodes, solid where the learner has been and dashed where they have not.
- Exercise renderers own their own primary action, because "Kontrol Et" is only enabled once *that* exercise considers itself answerable.

## Accessibility constraints

- Nothing is communicated by colour alone. Every verdict, lock, rank and match state also carries a word or a glyph in its accessible label.
- Minimum touch target is 44pt (`theme.hitTarget`).
- The two drag interactions in the design — ordering and matching — are implemented as tap-to-place and tap-to-take-back. Same result, no precision cost, and it works with a screen reader.
- Progress bars expose a percentage; step rails expose a step count.
- Text scales with the OS setting; `allowFontScaling` is never disabled.

## Screen inventory

Onboarding (welcome, 5 Milestone 1 questions, summary) · Ana Sayfa · Öğren · ünite yolu · six exercise renderers (multipleChoice, trueFalse, fillBlank, matching, ordering, flashcard) · feedback sheet · çalışma tamamlandı · canlar bitti · premium · seri milestone · lig · profil · konu performansı · settings and not-found fallbacks.

Konu performansı is a first-class drill-down reached from Profile. Its overview
shows overall answer accuracy and durable correct/wrong totals; its sections
prioritize needs-practice, developing, and strong main topics, with every card
showing the underlying subtopic evidence. Rose remains limited to explicitly
labelled practice needs, and green to strength/progress.
