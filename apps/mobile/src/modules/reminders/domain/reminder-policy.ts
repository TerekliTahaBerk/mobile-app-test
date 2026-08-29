import type { ReminderTime, WeeklyReportDay } from '@/modules/learner/domain/learner-profile';
import { addDays, toLocalDate, type LocalDate } from '@/shared/time/local-date';

/**
 * What the app should remind the learner about, as pure calendar arithmetic.
 *
 * Reminders are local notifications: nothing leaves the device, there is no
 * push token and no account. The policy decides *what* and *when* in the
 * learner's own wall clock; turning that into a scheduled notification is the
 * adapter's job, so this stays testable without a native module.
 */

/** Wall-clock targets, not instants: the adapter owns the device's zone. */
export type PlannedReminder = {
  body: string;
  hour: number;
  /** Stable, so re-arming replaces rather than duplicates. */
  id: string;
  localDate: LocalDate;
  minute: number;
  title: string;
};

export type ReminderPlanInput = {
  moment: { atMs: number; timeZone: string };
  remindersEnabled: boolean;
  reminderTime?: ReminderTime | undefined;
  /** Current İz run, so the reminder can say what is actually at stake. */
  streak: number;
  /** True once today already counts; today needs no reminder. */
  todayQualified: boolean;
  /** The weekly report's own words, so push and screen cannot disagree. */
  weeklyReportBody: string;
  weeklyReportDay: WeeklyReportDay;
};

/**
 * How far ahead reminders are armed.
 *
 * They are re-armed every time the app reads its dashboard, so a learner who
 * keeps opening the app always has a week queued. A learner who stops gets a
 * week of nudges and then silence — which is the honest end of a reminder that
 * is no longer being asked for.
 */
const HORIZON_DAYS = 7;

const DEFAULT_TIME: ReminderTime = '20:00';

export function planReminders(input: ReminderPlanInput): readonly PlannedReminder[] {
  if (!input.remindersEnabled) {
    return [];
  }

  const { hour, minute } = parseTime(input.reminderTime ?? DEFAULT_TIME);
  const today = toLocalDate(input.moment.atMs, input.moment.timeZone);
  const reminders: PlannedReminder[] = [];

  for (let offset = 0; offset < HORIZON_DAYS; offset += 1) {
    const localDate = addDays(today, offset);
    // Today is skipped once it already counts: reminding someone to do what
    // they have done is how an app teaches people to ignore it.
    if (offset === 0 && input.todayQualified) {
      continue;
    }

    reminders.push({
      body:
        input.streak > 0
          ? `${input.streak} günlük serin bugün kırılabilir. Tek bir tur yeter.`
          : 'Bugün kısa bir tur yap, seri bugün başlasın.',
      hour,
      id: `streak:${localDate}`,
      localDate,
      minute,
      title: 'Serini koru',
    });
  }

  const reportDate = nextWeekday(today, input.weeklyReportDay);
  reminders.push({
    body: input.weeklyReportBody,
    hour,
    id: `weekly:${reportDate}`,
    localDate: reportDate,
    minute,
    title: 'Haftalık raporun hazır',
  });

  return reminders;
}

function parseTime(time: ReminderTime): { hour: number; minute: number } {
  const [hour, minute] = time.split(':').map(Number);

  return { hour: hour ?? 20, minute: minute ?? 0 };
}

/** The first occurrence of a weekday on or after `today`. */
function nextWeekday(today: LocalDate, weekday: WeeklyReportDay): LocalDate {
  const [year, month, day] = today.split('-').map(Number);
  const current = new Date(Date.UTC(year ?? 1970, (month ?? 1) - 1, day ?? 1)).getUTCDay();

  return addDays(today, (weekday - current + 7) % 7);
}
