# Brand identity

## App name

**Tekrarla** — the learner repeats, the streak holds. The app name is settled;
`slug`, `scheme`, bundle identifier (`com.tekrarla.app`), and Android package
name intentionally match the name and are not subject to further rename.

> Trademark clearance and App Store / Google Play name-registration are external
> human steps — see `docs/STORE_SUBMISSION_CHECKLIST.md`.

## What the product is

A study game, not a dashboard. The learner opens the app, sees one obvious next step, plays a short round of questions, and leaves with their streak intact. Everything else on screen exists to get them into that loop or to show them what the loop earned.

The product line is: **dersler → ünite yolu → interaktif çalışma → can / XP / seri → lig → bir tane daha.**

## Mascot

**Dino** — a green cartoon dinosaur in a graduation cap. He is the app's reaction, not its narrator: he appears on the welcome screen, beside each onboarding question, in the verdict after an answer, when hearts run out, at a streak milestone, and on the paywall. He never explains the curriculum and he never blocks a screen.

Dino has three approved poses: general encouragement, writing/study guidance,
and graduation/completion. Screens choose them semantically rather than by
file path; setback moments still use a subdued tone. There is no mascot state
machine — see `apps/mobile/src/shared/ui/dino/dino.tsx` and
`apps/mobile/assets/dino/README.md`.

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

- Trademark clearance for **Tekrarla** — external human step; see `docs/STORE_SUBMISSION_CHECKLIST.md`.
- App icon and splash artwork (final production-resolution versions not yet in repo).
- Whether a dedicated setback pose is needed; current setback moments reuse the
  general pose with a subdued tone.
