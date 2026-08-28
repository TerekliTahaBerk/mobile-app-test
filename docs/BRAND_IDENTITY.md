# Brand identity

## Working name

**Online Dershanem** — the learner's own online cram school, in their pocket. The name is a working one: `slug`, `scheme`, and the store bundle identifiers still carry the earlier `tekrarla` name and are deliberately unchanged, because renaming an identifier orphans the EAS project and the store listing. Settle the name commercially before touching those.

## What the product is

A study game, not a dashboard. The learner opens the app, sees one obvious next step, plays a short round of questions, and leaves with their streak intact. Everything else on screen exists to get them into that loop or to show them what the loop earned.

The product line is: **dersler → ünite yolu → interaktif çalışma → can / XP / seri → lig → bir tane daha.**

## Mascot

**Dino** — a green cartoon dinosaur in a graduation cap. He is the app's reaction, not its narrator: he appears on the welcome screen, beside each onboarding question, in the verdict after an answer, when hearts run out, at a streak milestone, and on the paywall. He never explains the curriculum and he never blocks a screen.

Dino has one piece of artwork, sized by the composition and desaturated when the moment is a setback. There is no pose library and no mascot state machine — see `apps/mobile/src/shared/ui/dino/dino.tsx`.

> The approved artwork is not in the repository yet. `apps/mobile/assets/dino/dino.png` is a placeholder; the design MCP caps a file response at 256 KiB and the real file is larger, so every fetch arrives truncated. Dropping the real file at that path is the whole change — see `apps/mobile/assets/dino/README.md`.

## Voice

Turkish, second person singular, short sentences. Encouraging without being saccharine; direct without being cold.

- "Soru çöz, seriyi bozma."
- "Doğru!" / "Olmadı." — the verdict is one word, the reason follows it.
- "Canların bitti. Biraz sonra yeniden deneyebilirsin."
- "XP, seri ve lig sıralaması satın alınamaz."

Never: exam-anxiety language, guilt about a broken streak, or claims about score improvement the product cannot support.

## Colour

| Role | Hex | Where it appears |
| --- | --- | --- |
| Brand | `#14976B` | Primary actions, the current path node, correct answers |
| Brand deep | `#0C4A38` | Button edges, the dark flashcard stage, the league banner |
| Brand soft | `#EDF7F2` | Selected states, correct-answer sheets, quiet chips |
| Ink | `#14201C` | Body and heading text |
| Canvas | `#FBFCFA` | Tab-shell backgrounds |
| Streak | `#E08A1E` | The daily-streak flame and its counter |
| Hearts | `#D9556B` | The hearts counter and every wrong-answer surface |

Subjects each own a colour so a learner can tell where they are without reading: Tarih amber `#B4762A`, Matematik and Türkçe brand green, Fizik `#4A6FA5`, Kimya and Felsefe `#7A5AA8`, Biyoloji `#6E9B3A`, Coğrafya `#2E8A8A`.

Green is the only action colour. Rose is only ever a setback. Amber is only ever the streak or the Tarih subject. Nothing else in the system is allowed to be red or green for decoration.

## Typography

**Manrope** carries everything — 800 for headings, counters and labels, 700 for body, 400 for prose. **JetBrains Mono Medium** appears only in micro-labels: question counters, XP figures, league scores. Mono is a texture for numbers, never for reading.

## Open identity decisions

- The commercial name, and whether the `tekrarla` identifiers get migrated with it.
- App icon and splash artwork, which still carry the previous brand.
- Whether Dino gets a second pose for the setback moments, or keeps the single-artwork rule.
