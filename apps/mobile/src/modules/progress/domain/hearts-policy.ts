/**
 * Hearts (can), v1.
 *
 * A wrong answer on a scored exercise costs one heart. At zero the learner
 * cannot start a new round until hearts regenerate, earn one back through a
 * free practice round, or hold a premium entitlement that removes the limit
 * entirely. **There are no ads and hearts are never sold directly.**
 *
 * Hearts are stored as a count plus the instant that count was written, and the
 * current balance is derived from elapsed time. That keeps regeneration correct
 * across app restarts and device clock changes without a background timer.
 */

export const MAX_HEARTS = 5;

/** One heart returns every 30 minutes. */
export const REFILL_INTERVAL_MS = 30 * 60 * 1000;

export type HeartsRecord = {
  /** Hearts held when `updatedAtMs` was written. */
  hearts: number;
  updatedAtMs: number;
};

export type HeartsStatus = {
  /** `null` means unlimited: the limit does not apply to this learner. */
  hearts: number | null;
  /** Milliseconds until the next heart returns; `null` when nothing is pending. */
  nextHeartInMs: number | null;
  unlimited: boolean;
};

export function fullHearts(atMs: number): HeartsRecord {
  return { hearts: MAX_HEARTS, updatedAtMs: atMs };
}

/**
 * The balance right now. Regeneration is computed from elapsed time rather
 * than stored, so a device that was asleep for two hours comes back full.
 *
 * A clock that moved backwards is treated as no elapsed time rather than as
 * negative regeneration, so hearts can never be taken away by the clock.
 */
export function readHearts(
  record: HeartsRecord,
  atMs: number,
  options: { unlimited?: boolean } = {},
): HeartsStatus {
  if (options.unlimited === true) {
    return { hearts: null, nextHeartInMs: null, unlimited: true };
  }

  const held = clamp(record.hearts);
  if (held >= MAX_HEARTS) {
    return { hearts: MAX_HEARTS, nextHeartInMs: null, unlimited: false };
  }

  const elapsed = Math.max(0, atMs - record.updatedAtMs);
  const regenerated = Math.floor(elapsed / REFILL_INTERVAL_MS);
  const hearts = clamp(held + regenerated);

  if (hearts >= MAX_HEARTS) {
    return { hearts: MAX_HEARTS, nextHeartInMs: null, unlimited: false };
  }

  return {
    hearts,
    nextHeartInMs: REFILL_INTERVAL_MS - (elapsed % REFILL_INTERVAL_MS),
    unlimited: false,
  };
}

/**
 * Spends one heart, returning the record to persist. Regeneration is folded in
 * first so a spend never discards time the learner already waited.
 *
 * Spending at zero is a no-op rather than an error: the screens refuse the
 * round before it starts, and a domain that could go negative would be a worse
 * guarantee than one that simply cannot.
 */
export function spendHeart(record: HeartsRecord, atMs: number): HeartsRecord {
  const current = readHearts(record, atMs).hearts ?? MAX_HEARTS;
  if (current <= 0) {
    return { hearts: 0, updatedAtMs: atMs };
  }

  // Restart the refill window from now, so a spend does not immediately grant
  // back the partial interval that was already in flight.
  return { hearts: current - 1, updatedAtMs: atMs };
}

/** Grants one heart back — the reward for a free practice round. */
export function grantHeart(record: HeartsRecord, atMs: number): HeartsRecord {
  const current = readHearts(record, atMs).hearts ?? MAX_HEARTS;

  return { hearts: clamp(current + 1), updatedAtMs: atMs };
}

/** Formats the wait as the design shows it: "18 dk", or "45 sn" under a minute. */
export function formatHeartWait(nextHeartInMs: number): string {
  if (nextHeartInMs < 60_000) {
    return `${Math.max(1, Math.ceil(nextHeartInMs / 1000))} sn`;
  }

  return `${Math.ceil(nextHeartInMs / 60_000)} dk`;
}

function clamp(hearts: number): number {
  return Math.min(MAX_HEARTS, Math.max(0, Math.floor(hearts)));
}
