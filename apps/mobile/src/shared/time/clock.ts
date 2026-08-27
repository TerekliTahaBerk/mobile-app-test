/**
 * The application's only source of "now".
 *
 * Domain policies never read the clock themselves — they receive instants. This
 * boundary exists so İz, mastery, review scheduling, and recommendation are all
 * exhaustively testable at fixed times without mocking global `Date`.
 */
export type Clock = {
  /** Milliseconds since the epoch. */
  now: () => number;
  /** The device's current IANA zone, e.g. `Europe/Istanbul`. */
  timeZone: () => string;
};

export const systemClock: Clock = {
  now: () => Date.now(),
  timeZone: () => Intl.DateTimeFormat().resolvedOptions().timeZone,
};

/** A clock frozen at a chosen instant and zone. */
export function fixedClock(isoInstant: string, timeZone = 'Europe/Istanbul'): Clock {
  const at = Date.parse(isoInstant);

  return { now: () => at, timeZone: () => timeZone };
}

/** A clock a test can wind forward. */
export function controllableClock(isoInstant: string, timeZone = 'Europe/Istanbul') {
  let at = Date.parse(isoInstant);

  return {
    advanceDays: (days: number) => {
      at += days * 24 * 60 * 60 * 1000;
    },
    advanceMs: (ms: number) => {
      at += ms;
    },
    clock: { now: () => at, timeZone: () => timeZone } satisfies Clock,
  };
}
