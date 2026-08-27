/**
 * Local calendar dates.
 *
 * İz counts *calendar days in the learner's zone*, while review scheduling
 * works in instants. The two must never be conflated, so calendar arithmetic
 * lives here and deals only in `YYYY-MM-DD` strings.
 *
 * Dates are compared and stepped as plain calendar values via UTC midnight,
 * which makes month, year, and DST boundaries fall out correctly: a calendar
 * day is always exactly one step, regardless of whether that day was 23, 24, or
 * 25 hours long in the local zone.
 */

/** `YYYY-MM-DD` in the learner's zone. */
export type LocalDate = string;

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

/**
 * Formats an instant as a calendar date in the given zone. `en-CA` is used
 * because it renders as `YYYY-MM-DD`, which sorts lexicographically.
 */
export function toLocalDate(atMs: number, timeZone: string): LocalDate {
  return new Intl.DateTimeFormat('en-CA', {
    day: '2-digit',
    month: '2-digit',
    timeZone,
    year: 'numeric',
  }).format(new Date(atMs));
}

export function isLocalDate(value: string): boolean {
  return DATE_PATTERN.test(value);
}

function toUtcMidnight(date: LocalDate): number {
  const [year, month, day] = date.split('-').map(Number);

  return Date.UTC(year ?? 1970, (month ?? 1) - 1, day ?? 1);
}

function fromUtcMidnight(ms: number): LocalDate {
  return new Date(ms).toISOString().slice(0, 10);
}

const DAY_MS = 24 * 60 * 60 * 1000;

export function addDays(date: LocalDate, days: number): LocalDate {
  return fromUtcMidnight(toUtcMidnight(date) + days * DAY_MS);
}

export function previousDay(date: LocalDate): LocalDate {
  return addDays(date, -1);
}

/** Whole calendar days from `from` to `to`; negative when `to` precedes `from`. */
export function daysBetween(from: LocalDate, to: LocalDate): number {
  return Math.round((toUtcMidnight(to) - toUtcMidnight(from)) / DAY_MS);
}
