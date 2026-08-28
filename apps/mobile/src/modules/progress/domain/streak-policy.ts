import { previousDay, type LocalDate } from '@/shared/time/local-date';

/**
 * The daily streak (seri), v1.
 *
 * A local calendar day qualifies when the learner completes at least one lesson
 * round or one due-review round. Days are counted in the device's IANA zone
 * *at the moment the activity happened*, and a recorded day is never rewritten
 * if the learner later changes timezone.
 *
 * **The grace rule matters.** If they studied yesterday but have not studied yet
 * today, the streak stays alive: it counts back from yesterday. Breaking a run
 * at local midnight, before the learner has had any chance to study that day,
 * would punish them for the clock rather than for stopping.
 *
 * v1 has no freeze, no repair, and no way to buy a day back.
 */

export type StreakStatus = {
  /** Consecutive qualifying days, applying the grace rule. */
  current: number;
  /** True once today itself qualifies. */
  todayQualified: boolean;
};

export function computeStreak(
  qualifyingDates: readonly LocalDate[],
  today: LocalDate,
): StreakStatus {
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

export type StreakDayState = 'future' | 'missed' | 'pending' | 'qualified' | 'today';

export type StreakDay = {
  date: LocalDate;
  /** Turkish two-letter weekday initial, as the milestone strip shows it. */
  label: string;
  state: StreakDayState;
};

const WEEKDAY_LABELS = ['Pz', 'Pt', 'Sa', 'Ça', 'Pe', 'Cu', 'Ct'] as const;

/**
 * The week strip around today, oldest first. `today` is the current day once it
 * qualifies; `pending` is today before it does.
 */
export function buildStreakWeek(
  qualifyingDates: readonly LocalDate[],
  today: LocalDate,
  daysBefore = 4,
  daysAfter = 2,
): readonly StreakDay[] {
  const days = new Set(qualifyingDates);
  const week: StreakDay[] = [];

  let cursor = today;
  for (let i = 0; i < daysBefore; i += 1) {
    cursor = previousDay(cursor);
  }

  for (let offset = 0; offset <= daysBefore + daysAfter; offset += 1) {
    const date = cursor;
    const isToday = date === today;
    const qualified = days.has(date);
    const isFuture = !isToday && offset > daysBefore;

    week.push({
      date,
      label: weekdayLabel(date),
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

/**
 * Milestones the streak screen celebrates. Reaching one is what promotes a
 * finished round into the full-screen streak moment instead of going straight
 * back to the path.
 */
export const STREAK_MILESTONES: readonly number[] = [3, 7, 12, 14, 21, 30, 50, 100, 365];

export function isStreakMilestone(streak: number): boolean {
  return STREAK_MILESTONES.includes(streak);
}

function weekdayLabel(date: LocalDate): string {
  const [year, month, day] = date.split('-').map(Number);
  const weekday = new Date(Date.UTC(year ?? 1970, (month ?? 1) - 1, day ?? 1)).getUTCDay();

  return WEEKDAY_LABELS[weekday] ?? '';
}

function nextDay(date: LocalDate): LocalDate {
  const [year, month, day] = date.split('-').map(Number);
  const next = new Date(Date.UTC(year ?? 1970, (month ?? 1) - 1, (day ?? 1) + 1));

  return next.toISOString().slice(0, 10);
}
