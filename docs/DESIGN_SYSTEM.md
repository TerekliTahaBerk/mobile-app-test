# Design system

## Responsibility

[BRAND_IDENTITY.md](BRAND_IDENTITY.md) owns the working name, voice, personality, palette, typeface choices, and unresolved identity decisions. This document owns the implementation system: semantic roles, scales, components, interaction states, layout behavior, and accessibility constraints.

The implemented system is the pastel pass of the approved Claude Design project **TEKRARLA Ekranlar v2**. It is warm, path-first, and physical. Coral is the single action colour; subject colours carry learning context; the interface reads as friendly objects with weight rather than flat cards.

## Semantic color roles

Components consume roles from `apps/mobile/src/shared/ui/theme/tokens.ts`. The raw palette lives in a private `palette` object in that file and is never read directly by a component; screen-level raw colours are not allowed.

- `background.app` / `background.lesson` / `background.flashcard` — the warm path canvas, the white exercise canvas, and the violet flashcard canvas.
- `background.scrim` — the modal dim behind the exit sheet.
- `surface.default`, `surface.soft`, `surface.recessed`, `surface.sheet`.
- `text.primary`, `text.body`, `text.secondary`, `text.muted`, `text.faint`, `text.eyebrow`, `text.inverse`, `text.accent`, `text.accentStrong`, `text.disabled`.
- `border.hairline`, `border.subtle`, `border.strong`, `border.accent`.
- `action.*` — primary, success, danger, neutral, disabled, each with its structural `…Depth` companion.
- `progress.track`, `progress.fill`, `progress.gloss`.
- `status.*` — success and danger surfaces, borders, and ink, always paired with a glyph and a word.
- `reward.*` — XP, gem, and heart tones kept distinct from one another.
- `trace.*` — the İz palette: a coral that tapers through `mid`, `soft`, and `faint`.
- `path.*` — node faces and depths for locked, current, checkpoint, and the unit banner.
- `navigation.*` — the tab bar surface and its active pill.
- `event.*` — the pink seasonal-event accent on the quest board.
- `campaign.*` — the cool-blue campaign band on the Plus screen, the one cool surface in the system.
- `profile.portrait` — the green band behind ÇİZGİ on the profile screen.
- `subject.history | geography | philosophy | religion` — `primary`, `depth`, `soft`, `ink`, `deep`.

A future theme must implement the same semantic shape rather than changing component APIs.

## Type scale

Roles are `display`, `headingXXL`, `headingXL`, `headingL`, `headingM`, `headingS`, `headingXS`, `numeric`, `question`, `bodyL`, `bodyM`, `bodyS`, `prose`, `proseS`, `labelL`, `labelM`, `labelS`, `caption`, `eyebrow`, and `hud`.

- Display, heading, and `numeric` roles render in **Baloo 2 ExtraBold**.
- `prose` uses Nunito Regular; `proseS` uses Nunito SemiBold.
- `question`, `bodyL`, `bodyM`, and `bodyS` use Nunito Bold.
- Label, caption, and eyebrow roles use Nunito ExtraBold; `hud` uses Nunito Black.
- System fonts remain the non-blocking startup and error fallback.
- Native font scaling stays enabled by default.

## Scales

- Spacing: `xxs` 2, `xs` 4, `sm` 8, `md` 12, `lg` 16, `xl` 20, `xxl` 24, `xxxl` 32, `huge` 40.
- Radius: `xs` 9, `small` 13, `medium` 16, `large` 20, `xlarge` 26, `sheet` 30, `pill` 999.
- `hitTarget` is 44 points and is the floor for every interactive control.
- Depth: `button` 5, `node` 8, `nodeSmall` 6, `panel` 6, `banner` 4, and card bottom borders of 4/5/6.
- Motion is built on React Native's own `Animated`; no animation library ships. See **Motion** below.

## Motion

The design's four keyframes are implemented in `src/shared/ui/motion/`, on the
built-in `Animated` API with the native driver and no added dependency:

- `Bob` — ÇİZGİ's slow vertical float, on the path, the lesson intro, and the completion screen.
- `Pulse` — the breathing ring around the current level node.
- `Pop` — the entrance of the start callout and the level detail panel.
- `Shake` — the refusal when a match does not land.

**Reduce Motion is honoured everywhere.** `useReducedMotion()` reads the OS
setting and subscribes to changes; when it is on, every component above renders
a static frame — loops never start, and `Pop` mounts fully visible. Motion is
therefore always decorative: no state in the app is communicated by movement
alone.

The design's 3D card flip is the one motion not reproduced; the flashcard swaps
faces instead.

## Physical depth

The design expresses weight two ways, and both are implemented without an animation dependency:

- **Offset depth.** `TactilePressable` draws a solid shadow view beneath a face view; pressing translates the face down onto it. Buttons, path nodes, the level panel CTA, and the unit banner all use it.
- **Structural bottom border.** Cards that read as touchable — answer options, word chips, match tiles, onboarding choices — carry a thickened bottom border instead of an offset shadow.

## Primitives

- `AppText` applies semantic typography and text colour while preserving native text props and scaling.
- `Screen` owns safe areas and the page background. It takes `includeBottomInset={false}` when the screen owns a fixed bottom region.
- `BottomAction` is that fixed region: it clears the home indicator from live safe-area insets rather than a hard-coded height, and tints itself when feedback is showing.
- `AppButton` supports primary, success, danger, neutral, and ghost tones, full-width by default, with disabled state exposed to assistive technology.
- `TactilePressable` is the shared physical control described above.
- `Card` supports plain, outlined, elevated, and tactile surfaces, with optional state-tinted border and surface colours.
- `ProgressBar` clamps normalized progress, exposes accessible numeric progress, and renders the design's inset gloss. Visible text must accompany it.
- `TraceMark` draws the İz stroke at four sizes. It is always decorative; adjacent copy carries the meaning.
- `SubjectTag` is the subject-tinted context pill that opens an exercise.
- `glyphs.tsx` draws the small geometric icons (close, back, heart, gem, lock) from plain views. No icon font and no SVG runtime.
- `Cizgi` renders one mascot pose at a fixed width *or* height, deriving the other axis from the artwork's ratio. Size by height inside a fixed-height band, by width everywhere else. `CizgiSpeech` pairs a pose with an outlined bubble.

Product rules do not belong in shared primitives.

## Path and state treatment

The path is the home screen and the visual centre of the product. Nodes weave left and right down a scroll view using a repeating offset pattern that scales down on narrow phones; there is no SVG, canvas, geometry engine, or gesture-driven map.

- Completed: subject-coloured node with a check mark and "Tamamlandı".
- Current: the largest and loudest node — coral, ringed, with the "BAŞLA" callout beside it and "Şimdi" in its label.
- Available: subject-tinted node, "Açık".
- Locked: neutral node with a lock glyph and "Kilitli"; colour is never the only cue.
- Review: coral-tinted node with a repeat glyph.
- Checkpoint: smaller reward-yellow node with a star.

Selecting the current node opens the coral level panel inline beneath it, carrying the lesson title, its position in the unit, the XP on offer, and a single CTA.

## Mobile interaction

Primary continuation controls sit in a fixed lower action region on every flow
screen. The shell tab bar carries all five sections — Yol, Görev, Lig, Mağaza,
Profil — and every one of them routes. Tabs `replace` rather than `push` so the
shell never stacks on itself.

Screen density stays mobile-native, safe areas are preserved, and every control
clears 44 points. Layouts are verified at 375 pt (iPhone SE) as well as 402 pt:
the level path scales its weave from window width, and selecting a level scrolls
its detail panel into view so the CTA is never left below the fold on a short
screen.

## Accessibility rules

- Locked, current, completed, correct, wrong, selected, and matched states all carry a word, not only a colour.
- Path nodes, answer cards, and match tiles expose their state through `accessibilityState` and a spoken state label.
- ÇİZGİ is decorative by default and hidden from screen readers unless a pose carries meaning; then it takes an explicit label.
- Feedback panels and live counters use `accessibilityLiveRegion` so the verdict is announced.
- Decorative geometry — trace marks, glyphs, the start callout that duplicates its node's action — is hidden from assistive technology.
- Font scaling is never disabled.
