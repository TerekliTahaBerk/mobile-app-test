# Gamification

Gamification exists to reinforce learning and return behaviour, not to obstruct motivated students. XP must remain an auditable activity measure separate from mastery.

## XP — v1 product defaults

| Event | Award |
| --- | --- |
| Correct completed exercise | **10 XP** |
| Lesson completion | **20 XP** |
| First completion of a path level | **25 XP** |

**XP is not mastery.** XP measures activity; mastery estimates knowledge. A learner can earn XP on material they have not mastered, and mastering material awards no XP by itself.

Implemented in `xp-policy.ts` and applied by the lesson engine. Flashcard decks are self-reported and award no correctness XP.

The first-path-level bonus is **not** awarded by the engine, which holds no history. `LessonCompleted` reports it as `firstCompletionBonusXp` alongside the `pathNodeId`, and the progression layer decides whether it applies. Duplicate prevention belongs to persistence — Release Phase 2.

## İz — v1 product decisions

Rules are decided but **not implemented**:

- The qualifying day is derived from the **device's current IANA timezone**.
- A day qualifies when the learner completes **at least one lesson or one due-review session**.
- There is **no İz repair or freeze** in v1.
- Changing timezone **does not rewrite** historic completed local dates.

İz remains presentation-only until durable progress exists.

## Current state

No gamification logic is persisted. The İz counter and week strip, the XP and gem totals in the HUD, the heart count, and the quest board are all preview values. The XP a lesson awards is real and computed, but it is lost when the app restarts.

Hearts, energy, ads, alternative İz rules, and boss variants remain experiments and must be feature-flagged before introduction. Whether any reward carries competitive value is still open.
