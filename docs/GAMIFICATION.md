# Gamification

Gamification exists to reinforce learning and return behaviour, not to obstruct motivated students. XP must remain an auditable activity measure separate from mastery.

## XP — v1 product defaults

| Event | Award |
| --- | --- |
| Correct completed exercise | **10 XP** |
| Lesson completion | **20 XP** |
| First completion of a path level | **25 XP** |

**XP is not mastery.** XP measures activity; mastery estimates knowledge. A learner can earn XP on material they have not mastered, and mastering material awards no XP by itself.

Implemented in `xp-policy.ts` and committed to an auditable SQLite ledger.
Flashcard decks are self-reported and award no correctness XP. Home totals are
the sum of ledger rows; no stored running total is authoritative.

The first-path-level bonus is **not** awarded by the engine, which holds no
history. The completion transaction inserts it with a source key scoped to the
path node. A unique index guarantees that retries or repeat completions cannot
pay it twice. Lesson-completion and correct-exercise awards use session-scoped
source keys for the same reason.

## İz — v1 product decisions

Implemented rules:

- The qualifying day is derived from the **device's current IANA timezone**.
- A day qualifies when the learner completes **at least one lesson or one due-review session**.
- There is **no İz repair or freeze** in v1.
- Changing timezone **does not rewrite** historic completed local dates.
- If today has not qualified but yesterday did, the current İz remains alive
  through today and counts backwards from yesterday.

`daily_activity.local_date` is unique. It retains the timezone observed on the
first qualifying completion for that local date; later timezone changes do not
rewrite it. There is no freeze, repair, or gem payment.

## Current state

XP and İz are durable and production Home uses them. League, Plus, quests,
hearts, and gems remain presentation-only and are all disabled in
`productionPilot`; `designPreview` retains their approved reference screens.

Hearts, energy, ads, alternative İz rules, and boss variants remain experiments and must be feature-flagged before introduction. Whether any reward carries competitive value is still open.
