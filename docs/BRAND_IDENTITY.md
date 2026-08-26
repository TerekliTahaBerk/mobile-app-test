# Brand identity

This document owns the working identity, voice, visual personality, and brand-level design decisions for the product. [DESIGN_SYSTEM.md](DESIGN_SYSTEM.md) owns how those decisions become semantic tokens, reusable primitives, interaction states, and accessibility rules.

## Working identity

- **Name:** TEKRARLA
- **Role:** a focused study companion for Turkish exam preparation
- **Current pilot:** TYT Sosyal Bilimler
- **Personality:** lively, clear, encouraging, and purposeful
- **Promise:** make the next useful repetition feel obvious and manageable

TEKRARLA is a working brand name. It is used consistently in the application until naming and legal checks are complete.

## Companion character

ÇİZGİ is a lively pencil study companion. ÇİZGİ may add warmth, point toward the next action, and acknowledge steady effort. ÇİZGİ is not a teacher, authority figure, answer engine, or character who claims to be smarter than the learner.

Milestone 2.1 uses only a simple abstract `Ç` placeholder mark. Mascot anatomy, poses, expressions, illustration rules, and animation are intentionally unresolved.

## Voice

Copy is concise, direct, supportive, and nonpunitive. It should reduce decision load without sounding childish or overly celebratory.

Prefer:

- “Hazırsan bir iz bırakalım.”
- “Sıradaki kısa adım hazır.”
- “Bir kısa adım daha, bugünün izi tamam.”

Avoid:

- blame, shame, loss aversion, or threats about broken habits;
- claims that ÇİZGİ teaches, knows better, or guarantees outcomes;
- loud reward language for ordinary navigation;
- English-facing “streak” terminology. The learner-facing habit marker is **İz**.

## Color identity

Brand palette:

| Role | Value | Use |
| --- | --- | --- |
| Primary coral | `#F4623A` | Main actions and the strongest current state |
| Primary dark | `#B9391A` | Structural button depth and dark coral emphasis |
| Primary soft | `#FFE7DE` | Coral-tinted labels and trace surfaces |
| Warm soft | `#FFEDE5` | Recessed and locked surfaces |
| App background | `#FFF8F4` | Main page background |
| Ink | `#241C18` | Primary text |
| Dark accent | `#2B3A67` | Restrained structural contrast |
| Reward yellow | `#FFC53D` | Checkpoints and small reward highlights |

Subject palette:

| Subject | Primary | Dark |
| --- | --- | --- |
| Tarih | `#B4552B` | `#8A3E1D` |
| Coğrafya | `#1E9E6A` | `#147A50` |
| Felsefe | `#7C5CF5` | `#5C3ED0` |
| Din Kültürü | `#2D7FF9` | `#185FC7` |

Subject colors identify learning context. Coral remains the primary action color, including inside a subject-colored area. Reward yellow is an accent, not a substitute for state text or icons.

## Typography

- **Baloo 2:** display headings, strong numbers, XP, and playful emphasis.
- **Nunito:** body copy, labels, buttons, and supporting text.

The app loads only Baloo 2 Bold/ExtraBold and Nunito Regular/Bold through `@expo-google-fonts` and `expo-font`. Runtime loading preserves the Expo Go workflow. Rendering is never blocked; native system fonts remain the startup and error fallback, so a font failure cannot produce a blank screen.

Both families are distributed under the SIL Open Font License 1.1. Package code is MIT licensed. Sources: [Expo font guidance](https://docs.expo.dev/develop/user-interface/fonts/), [Expo Google Fonts](https://github.com/expo/google-fonts), [Baloo 2](https://github.com/EkType/Baloo2), and [Nunito metadata](https://github.com/google/fonts/blob/main/ofl/nunito/METADATA.pb).

## Shapes and surfaces

- Corner radii center on 12, 16, 24, and pill shapes.
- Cards feel warm and substantial, with elevation reserved for meaningful hierarchy.
- The learning path uses a simple segmented trace built from normal layout primitives.
- The current node is the strongest state. Completed, available, locked, and checkpoint states always include text or a marker in addition to color.

## Buttons

The primary CTA uses a coral face with darker coral structural depth below it. Pressing the control moves the face downward and compresses that depth without an animation dependency. Secondary and ghost actions stay visually quieter. Disabled controls remain readable and expose their disabled state to assistive technology.

Primary actions use short verbs and appear in lower, thumb-friendly regions when they drive the screen’s main flow.

## Icons and companion art

Icons should be simple, rounded, and immediately readable. Do not introduce a large icon set for a small number of symbols. Text labels remain available where an icon alone would be ambiguous.

The abstract ÇİZGİ placeholder is not a final logo, mascot drawing, or app icon.

## One-handed mobile use

- Keep primary continuation controls near the bottom of the screen.
- Maintain at least 48-point interactive targets.
- Avoid dense dashboard arrangements and tiny status affordances.
- Preserve native scrolling, safe areas, font scaling, and concise hierarchy.

## Unresolved brand decisions

- Final mascot design, poses, illustration ownership, and motion rules
- Final wordmark and logo system
- Final app icon and launch artwork
- Naming, trademark, and other legal clearance for TEKRARLA and ÇİZGİ
- Formal brand asset licensing and production handoff

