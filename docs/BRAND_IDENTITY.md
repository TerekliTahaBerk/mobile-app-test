# Brand identity

This document owns the working identity, voice, visual personality, and brand-level design decisions for the product. [DESIGN_SYSTEM.md](DESIGN_SYSTEM.md) owns how those decisions become semantic tokens, reusable primitives, interaction states, and accessibility rules.

The identity below is taken from the approved Claude Design project **TEKRARLA Ekranlar v2** (the pastel pass), which is the visual source of truth.

## Working identity

- **Name:** TEKRARLA
- **Role:** a focused study companion for Turkish exam preparation
- **Current pilot:** TYT Sosyal Bilimler
- **Personality:** lively, clear, encouraging, and purposeful
- **Promise:** make the next useful repetition feel obvious and manageable

TEKRARLA is a working brand name. It is used consistently in the application until naming and legal checks are complete.

## Companion character

ÇİZGİ is a pencil study companion: an orange barrel body with a wooden tip, a yellow ferrule band, navy shoes, and large expressive eyes. The character is rendered as soft 3D artwork, not a flat illustration.

ÇİZGİ points toward the next action, keeps the learner company on the path, and acknowledges steady effort. ÇİZGİ is not a teacher, authority figure, answer engine, or a character who claims to be smarter than the learner.

### Poses in use

Nine poses ship as transparent PNGs under `apps/mobile/assets/cizgi/`, cut from the approved pose sheet:

| Mood | Where the design uses it |
| --- | --- |
| `wave` | Onboarding, first question |
| `thinking` | Onboarding level question; multiple-choice exercises |
| `idle` | Onboarding start question; fill-in-the-blank exercises |
| `proud` | Onboarding daily-goal question; İz celebration |
| `pose` | Lesson preparation |
| `happy` | Beside the current node on the learning path |
| `sad` | Exit confirmation |
| `cheer` | Lesson completed |
| `excited` | TEKRARLA Plus |

Poses are consumed through the registry in `src/shared/ui/cizgi/cizgi-assets.ts`. Screens never call `require` on a mascot file directly, and there is no mascot state engine — which pose appears is a per-screen presentation decision.

## Voice

Copy is concise, direct, supportive, and nonpunitive. It should reduce decision load without sounding childish or overly celebratory.

Prefer:

- "Merhaba, ben Çizgi! Hangi sınava çalışıyoruz?"
- "Tamam! Ünite 3, Ders 2'ye hazırlan — Tanzimat."
- "Her gün en az bir ders çöz, izin kesilmesin."

Avoid:

- blame, shame, loss aversion, or threats about broken habits;
- claims that ÇİZGİ teaches, knows better, or guarantees outcomes;
- loud reward language for ordinary navigation;
- English-facing "streak" terminology. The learner-facing habit marker is **İz**.

Exit copy states what leaving costs without scolding — "Şimdi çıkarsan bu ders izine yazılmaz" — and the loud action keeps the learner in the lesson while leaving stays one quiet tap away.

## Color identity

Coral is the single action colour. Everything else is pastel, and text is warm graphite rather than black.

| Role | Value | Use |
| --- | --- | --- |
| Coral | `#F2794F` | The one action colour and the current path node |
| Coral dark | `#C2552F` | Structural depth beneath coral controls |
| Coral deep | `#B9491F` | Coral text on light surfaces |
| Coral ink | `#E2683A` | İz numerals and celebration headings |
| Coral tint | `#FFF3EC` | Selected-choice surfaces |
| Coral soft | `#FFE7DB` | Coral-tinted labels |
| App background | `#FFFCFA` | Path and celebration canvas |
| Lesson background | `#FFFFFF` | Exercise canvas |
| Ink | `#2E2A26` | Primary text |
| Body ink | `#3A342F` | Answer and body text |
| Reward yellow | `#F6CE7C` | XP, progress fill, checkpoints |
| Heart | `#F2857F` | Remaining attempts |
| Success | `#5FB78E` | Correct verdicts |
| Error | `#EF8078` | Wrong verdicts |

Subject palette:

| Subject | Primary | Depth | Soft | Ink |
| --- | --- | --- | --- | --- |
| Tarih | `#E0A876` | `#C08850` | `#FBE7D6` | `#A9662F` |
| Coğrafya | `#86C9A6` | `#34785A` | `#DFF3E8` | `#34785A` |
| Felsefe | `#A79BE6` | `#5C4CB0` | `#EAE5FB` | `#5C4CB0` |
| Din Kültürü | `#8FBBE8` | `#3A6D9E` | `#E3EFFB` | `#3A6D9E` |

Subject colours identify learning context and may take over a whole screen — the flashcard deck runs in the Felsefe palette end to end. Coral remains the action colour inside a subject-coloured area. Reward yellow is an accent, not a substitute for state text or icons.

## Typography

- **Baloo 2 ExtraBold:** display numerals, headings, celebration copy, and large concept words.
- **Nunito:** everything else — Regular for prose, SemiBold for secondary prose, Bold for questions and body, ExtraBold for labels and buttons, Black for HUD numerals.

The app loads Baloo 2 ExtraBold and Nunito 400/600/700/800/900 through `@expo-google-fonts` and `expo-font`. Runtime loading preserves the Expo Go workflow. Rendering is never blocked; native system fonts remain the startup and error fallback, so a font failure cannot produce a blank screen. Turkish glyphs — ı, İ, ğ, ş, ç, ö, ü — are verified in both families on device.

Both families are distributed under the SIL Open Font License 1.1. Package code is MIT licensed. Sources: [Expo font guidance](https://docs.expo.dev/develop/user-interface/fonts/), [Expo Google Fonts](https://github.com/expo/google-fonts), [Baloo 2](https://github.com/EkType/Baloo2), and [Nunito metadata](https://github.com/google/fonts/blob/main/ofl/nunito/METADATA.pb).

## İz

İz is the learner-facing habit trace and replaces any flame, fire, or "streak" iconography. Its mark is a short stroke that tapers as it recedes: three or four rounded bars stepping down in width and coral saturation. It appears in the path HUD, on the lesson preparation screen, in the completion summary, on the exit sheet, and at full size on the İz celebration screen.

The İz week strip states each day in words as well as colour: completed, today, and not yet arrived.

## Shapes and surfaces

- Corner radii step through 9, 13, 16, 20, 26, 30, and pill.
- Path nodes are circles with solid offset depth; the current node wears a partial coral ring.
- Cards are two-point outlines on warm surfaces. Anything touchable gains a thickened bottom border.
- Buttons are wide, tall, and compress onto their own shadow when pressed.
- Speech bubbles are outlined with a rotated square tail.
- The unit banner is a subject-tinted band with an index affordance on its right edge.

## Icons and companion art

Icons are small, geometric, and drawn from plain views — no icon font, no SVG runtime. Text labels remain available where an icon alone would be ambiguous.

## One-handed mobile use

- Primary continuation controls stay in a fixed lower action region.
- Every interactive control clears 44 points.
- Safe areas, native scrolling, and font scaling are preserved.
- The path scrolls; nothing depends on a fixed device height.

## Unresolved brand decisions

- Final wordmark and logo system.
- Final app icon and launch artwork.
- Naming, trademark, and other legal clearance for TEKRARLA and ÇİZGİ.
- Ownership and licensing of the ÇİZGİ artwork for production. The shipped poses are cut from a source sheet in which each character is roughly 140 pt wide, so the largest placements (196–206 pt) are interpolated on a 3× display. Sharpening them requires re-rendering from the original 3D source, not a different export.
- Whether the league is competitive, and what the standings on the Lig screen would actually rank — the current rows are fixture text.
- Whether TEKRARLA Plus ships at all, and at what price. The Plus screen is layout only: it has no billing integration and collects nothing.
