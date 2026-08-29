import type { ContentIndex } from '@/modules/curriculum/domain/content-index';
import type { DailyActivity, StoredAttempt } from '@/modules/progress/domain/progress-types';
import {
  buildTopicPerformance,
  type ReportMoment,
  type TopicPerformanceBand,
} from '@/modules/progress/domain/topic-performance';
import { addDays, toLocalDate, type LocalDate } from '@/shared/time/local-date';

/**
 * The weekly report.
 *
 * The week runs to the learner's chosen report day: the seven days ending on
 * the next occurrence of it. Opened mid-week that is the week they are living,
 * marked as still running; on the report day itself the week closes and the
 * report is final. Reporting the *previous* closed week instead would leave the
 * screen stale and empty six days out of seven.
 *
 * The comparison is always against the seven days before the window, so a week
 * in progress is compared with a full week rather than flattered by one.
 */

/** 0 = Sunday, matching `Date.getUTCDay`. Pazar is the default. */
export type ReportDay = 0 | 1 | 2 | 3 | 4 | 5 | 6;

export const DEFAULT_REPORT_DAY: ReportDay = 0;

export type ReportedTopic = {
  accuracy: number;
  id: string;
  mainTopicTitle: string;
  title: string;
};

export type WeeklyReport = {
  /** Accuracy over the week, or null when nothing was answered. */
  accuracy: number | null;
  /** Change against the week before, or null when either week lacks evidence. */
  accuracyDelta: number | null;
  /** Calendar days the learner qualified on. */
  activeDays: number;
  /** True on the report day itself, when the week is final. */
  closed: boolean;
  correctAnswers: number;
  from: LocalDate;
  questions: number;
  /** Qualifying rounds completed inside the window. */
  rounds: number;
  /** Subtopics that were not strong at the start of the week and are now. */
  strengthened: readonly ReportedTopic[];
  /** Subtopics the week closed on still needing practice, weakest first. */
  stillWeak: readonly ReportedTopic[];
  to: LocalDate;
};

export type WeeklyReportInput = {
  attempts: readonly StoredAttempt[];
  dailyActivity: readonly DailyActivity[];
  index: ContentIndex;
  moment: ReportMoment;
  reportDay?: ReportDay;
};

/** Builds the report for the week running to the next report day. */
export function buildWeeklyReport(input: WeeklyReportInput): WeeklyReport {
  const { attempts, dailyActivity, index, moment, reportDay = DEFAULT_REPORT_DAY } = input;
  const today = toLocalDate(moment.atMs, moment.timeZone);
  const to = nextReportDay(reportDay, today);
  const from = addDays(to, -6);
  const previousTo = addDays(from, -1);
  const previousFrom = addDays(previousTo, -6);

  const dateOf = (attempt: StoredAttempt) =>
    toLocalDate(Date.parse(attempt.occurredAt), moment.timeZone);
  const scored = attempts.filter((attempt) => attempt.scored);
  const inWindow = scored.filter((attempt) => {
    const date = dateOf(attempt);
    return date >= from && date <= to;
  });
  const inPrevious = scored.filter((attempt) => {
    const date = dateOf(attempt);
    return date >= previousFrom && date <= previousTo;
  });
  const beforeWindow = attempts.filter((attempt) => dateOf(attempt) < from);
  const upToWindow = attempts.filter((attempt) => dateOf(attempt) <= to);

  const accuracy = accuracyOf(inWindow);
  const previousAccuracy = accuracyOf(inPrevious);
  const activity = dailyActivity.filter((day) => day.localDate >= from && day.localDate <= to);

  const bandsBefore = bandsFor(beforeWindow, index, moment);
  const closing = subtopicsOf(upToWindow, index, moment);

  return {
    accuracy,
    closed: to === today,
    accuracyDelta:
      accuracy === null || previousAccuracy === null ? null : accuracy - previousAccuracy,
    activeDays: activity.filter((day) => day.qualifyingSessions > 0).length,
    correctAnswers: inWindow.filter((attempt) => attempt.correct).length,
    from,
    questions: inWindow.length,
    rounds: activity.reduce((sum, day) => sum + day.qualifyingSessions, 0),
    // A strength claimed for the first time this week is the report's headline:
    // it is the one number that says the week changed something.
    strengthened: closing
      .filter((topic) => topic.band === 'strong' && bandsBefore.get(topic.id) !== 'strong')
      .map(toReported),
    stillWeak: closing
      .filter((topic) => topic.band === 'needsPractice')
      .sort((left, right) => left.accuracy - right.accuracy || left.id.localeCompare(right.id))
      .map(toReported),
    to,
  };
}

/** The first occurrence of a weekday, on or after `today`. */
function nextReportDay(reportDay: ReportDay, today: LocalDate): LocalDate {
  const [year, month, day] = today.split('-').map(Number);
  const weekday = new Date(Date.UTC(year ?? 1970, (month ?? 1) - 1, day ?? 1)).getUTCDay();

  return addDays(today, (reportDay - weekday + 7) % 7);
}

type ClosingTopic = {
  accuracy: number;
  band: TopicPerformanceBand;
  id: string;
  mainTopicTitle: string;
  title: string;
};

function subtopicsOf(
  attempts: readonly StoredAttempt[],
  index: ContentIndex,
  moment: ReportMoment,
): readonly ClosingTopic[] {
  return buildTopicPerformance(attempts, index, { moment }).topics.flatMap((topic) =>
    topic.subtopics.map((subtopic) => ({
      accuracy: subtopic.accuracy,
      band: subtopic.band,
      id: subtopic.id,
      mainTopicTitle: topic.title,
      title: subtopic.title,
    })),
  );
}

function bandsFor(
  attempts: readonly StoredAttempt[],
  index: ContentIndex,
  moment: ReportMoment,
): ReadonlyMap<string, TopicPerformanceBand> {
  return new Map(
    subtopicsOf(attempts, index, moment).map((subtopic) => [subtopic.id, subtopic.band]),
  );
}

function toReported(topic: ClosingTopic): ReportedTopic {
  return {
    accuracy: topic.accuracy,
    id: topic.id,
    mainTopicTitle: topic.mainTopicTitle,
    title: topic.title,
  };
}

function accuracyOf(attempts: readonly StoredAttempt[]): number | null {
  return attempts.length === 0
    ? null
    : attempts.filter((attempt) => attempt.correct).length / attempts.length;
}
