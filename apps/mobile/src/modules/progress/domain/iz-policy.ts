import { previousDay, type LocalDate } from '@/shared/time/local-date';

/**
 * İz, v1 — the learner-facing habit trace.
 *
 * A local calendar day qualifies when the learner completes at least one lesson
 * session or one due-review session. Days are counted in the device's IANA zone
 * *at the moment the activity happened*, and a recorded day is never rewritten
 * if the learner later changes timezone.
 *
 * **The grace rule matters.** If they studied yesterday but have not studied yet
 * today, the İz stays alive: it counts back from yesterday. Breaking a run at
 * local midnight, before the learner has had any chance to study that day,
 * would punish them for the clock rather than for stopping.
 *
 * v1 has no freeze, no repair, and no gem payment.
 */

export type IzStatus = {
  /** Consecutive qualifying days, applying the grace rule. */
  current: number;
  /** True once today itself qualifies. */
  todayQualified: boolean;
};

export function computeIz(
  qualifyingDates: readonly LocalDate[],
  today: LocalDate,
): IzStatus {
  const days = new Set(qualifyingDates);
  const todayQualified = days.has(today);
  const yesterday = previousDay(today);

  // Count back from today when it qualifies, otherwise from yesterday — the
  // grace window that keeps an unbroken run alive until the day is over.
  let cursor: LocalDate;
  if (todayQualified) {
    cursor = today;
  } else if (days.has(yesterday)) {
    cursor = yesterday;
  } else {
    return { current: 0, todayQualified: false };
  }

  let current = 0;
  while (days.has(cursor)) {
    current += 1;
    cursor = previousDay(cursor);
  }

  return { current, todayQualified };
}

export type IzDayState = 'future' | 'missed' | 'pending' | 'qualified' | 'today';

/**
 * The week strip around today, oldest first. `today` is the current day once it
 * qualifies; `pending` is today before it does.
 */
export function buildIzWeek(
  qualifyingDates: readonly LocalDate[],
  today: LocalDate,
  daysBefore = 4,
  daysAfter = 2,
): readonly { date: LocalDate; state: IzDayState }[] {
  const days = new Set(qualifyingDates);
  const week: { date: LocalDate; state: IzDayState }[] = [];

  let cursor = today;
  for (let i = 0; i < daysBefore; i += 1) {
    cursor = previousDay(cursor);
  }

  for (let offset = 0; offset <= daysBefore + daysAfter; offset += 1) {
    const date = cursor;
    const isToday = date === today;
    const qualified = days.has(date);
    const isFuture = !isToday && offsetIsAfterToday(offset, daysBefore);

    week.push({
      date,
      state: isToday
        ? qualified
          ? 'today'
          : 'pending'
        : isFuture
          ? 'future'
          : qualified
            ? 'qualified'
            : 'missed',
    });

    cursor = nextDay(cursor);
  }

  return week;
}

function offsetIsAfterToday(offset: number, daysBefore: number): boolean {
  return offset > daysBefore;
}

function nextDay(date: LocalDate): LocalDate {
  const [year, month, day] = date.split('-').map(Number);
  const next = new Date(Date.UTC(year ?? 1970, (month ?? 1) - 1, (day ?? 1) + 1));

  return next.toISOString().slice(0, 10);
}
