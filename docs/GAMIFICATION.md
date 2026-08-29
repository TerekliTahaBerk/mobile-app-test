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
Flashcard decks are self-reported and award no correctness XP. Totals are the
sum of ledger rows; no stored running total is authoritative.

The first-path-level bonus is **not** awarded by the engine, which holds no
history. The completion transaction inserts it with a source key scoped to the
path node. A unique index guarantees that retries or repeat completions cannot
pay it twice. Lesson-completion and correct-exercise awards use session-scoped
source keys for the same reason.

## Levels

A level is a **presentation of the ledger**, never a stored counter, so it can
never disagree with what the learner earned. Level 1 costs 300 XP and each level
after costs 100 XP more than the one before (`level-policy.ts`).

The same ladder runs per subject, over the XP attributed to that subject's
lessons, which is what the Öğren rows and the path header show.

## Seri (the daily streak)

Implemented rules (`streak-policy.ts`):

- The qualifying day is derived from the **device's current IANA timezone**.
- A day qualifies when the learner completes **at least one lesson or one due-review round**.
- There is **no streak repair or freeze** in v1.
- Changing timezone **does not rewrite** historic completed local dates.
- If today has not qualified but yesterday did, the streak remains alive through today and counts backwards from yesterday.

`daily_activity.local_date` is unique. It retains the timezone observed on the
first qualifying completion for that local date; later timezone changes do not
rewrite it.

The full-screen streak moment fires only on a **milestone** (3, 7, 12, 14, 21,
30, 50, 100, 365). A celebration that fires every day stops meaning anything, so
every other round returns straight to the path.

## Can (hearts)

Five hearts, one lost per wrong answer on a scored exercise, one regenerated
every 30 minutes (`hearts-policy.ts`). At zero the learner is offered time, a
free practice round, or Premium — **in that order, and there are no ads
anywhere.** Hearts are never sold directly.

Hearts are stored as a count plus the instant that count was written; the
balance is always derived from elapsed time. That keeps regeneration correct
across restarts and sleep without a background timer, and a clock that moves
backwards can never take a heart away.

**Hearts are off in `productionPilot`.** A limit the learner has no way to lift
— no billing, no practice drill wired up — would just be a wall.

## Rozetler (badges)

Badges are derived from local stats, never stored (`badge-policy.ts`): first
round, 7-day streak, 100 correct, first unit, subject level 5, 30-day streak,
5.000 XP, a perfect round. Unearned badges stay visible as locked tiles, because
the shape of what is still ahead is part of what makes them worth chasing.

`perfectRounds` currently always reads 0: nothing records a per-round perfect
result yet, so the badge that depends on it cannot be earned. That is a gap, not
a decision.

## Lig (the league)

Weekly standings with a promotion zone. It needs a real leaderboard service and
its standings are **disabled in `productionPilot`**. The destination stays in
Home and the bottom navigation and explains itself rather than ranking the
learner against people who do not exist. The production delivery sequence is
owned by [EXECUTION/LEAGUE.md](EXECUTION/LEAGUE.md).

## Current state

XP, levels, the streak and badges are durable and every production screen reads
them. Hearts are durable but gated off in the pilot. The league is
presentation-only. `designPreview` retains the approved reference screens for
all of them.
