/**
 * XP levels, v1.
 *
 * A level is a presentation of the XP ledger, never a stored counter: the
 * ledger is authoritative, so recomputing from it always agrees with what the
 * learner actually earned.
 *
 * The ladder widens by a fixed step, so early levels arrive quickly and later
 * ones take real work. Level 1 costs 300 XP and each level after costs 100 XP
 * more than the one before it.
 */

const BASE_REQUIREMENT = 300;
const STEP = 100;

/** XP needed to move from `level` to `level + 1`. Levels are 1-based. */
export function xpRequiredForLevel(level: number): number {
  if (level < 1) {
    throw new RangeError(`Seviye 1'den küçük olamaz: ${level}.`);
  }

  return BASE_REQUIREMENT + (level - 1) * STEP;
}

export type LevelStatus = {
  level: number;
  /** XP earned inside the current level. */
  xpIntoLevel: number;
  /** XP the current level costs in total. */
  xpForLevel: number;
  /** 0–1, for the level meter. */
  progress: number;
};

export function levelForXp(totalXp: number): LevelStatus {
  const safeTotal = Math.max(0, Math.floor(totalXp));

  let level = 1;
  let remaining = safeTotal;
  let requirement = xpRequiredForLevel(level);

  while (remaining >= requirement) {
    remaining -= requirement;
    level += 1;
    requirement = xpRequiredForLevel(level);
  }

  return {
    level,
    progress: remaining / requirement,
    xpForLevel: requirement,
    xpIntoLevel: remaining,
  };
}
