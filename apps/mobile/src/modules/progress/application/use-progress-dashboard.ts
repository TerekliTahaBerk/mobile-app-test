import { useCallback, useState } from 'react';
import { useFocusEffect } from 'expo-router';

import { getContentIndex } from '@/modules/curriculum/content/content-source';
import type {
  ExamId,
  PathNodeId,
  Subject,
  SubjectId,
} from '@/modules/curriculum/domain/content-types';
import {
  buildUnitPath,
  nextOpenStep,
  type PathStep,
  type UnitPath,
} from '@/modules/curriculum/domain/path-progression';
import type { LearnerProfile } from '@/modules/learner/domain/learner-profile';
import { buildDailyPlan, type DailyPlan } from '@/modules/learning/domain/daily-plan';
import { useRepositories } from '@/modules/progress/application/progress-store';
import { levelForXp, type LevelStatus } from '@/modules/progress/domain/level-policy';
import type {
  PathProgress,
  ReviewItem,
  StoredAttempt,
} from '@/modules/progress/domain/progress-types';
import {
  buildMistakeNotebook,
  type MistakeNotebook,
} from '@/modules/progress/domain/mistake-notebook';
import {
  buildTopicPerformance,
  type ReportMoment,
  type TopicPerformanceReport,
} from '@/modules/progress/domain/topic-performance';
import {
  recommendNext,
  type Recommendation,
} from '@/modules/progress/domain/recommendation-policy';
import { isDue, sortDueItems } from '@/modules/progress/domain/review-policy';
import { buildWeeklyReport, type WeeklyReport } from '@/modules/progress/domain/weekly-report';
import {
  buildStreakWeek,
  computeStreak,
  type StreakDay,
} from '@/modules/progress/domain/streak-policy';
import { systemClock, type Clock } from '@/shared/time/clock';
import { toLocalDate } from '@/shared/time/local-date';

/** Everything one subject contributes to the Home and Öğren tabs. */
export type SubjectProgress = {
  completedUnits: number;
  level: LevelStatus;
  /** Empty while the subject is in the catalogue but has no authored units. */
  paths: readonly UnitPath[];
  /** 0–1 across the whole subject. */
  progress: number;
  subject: Subject;
  totalUnits: number;
  xp: number;
};

export type ProgressDashboard = {
  /** Subjects grouped by the exam they belong to, in authored order. */
  byExam: ReadonlyMap<ExamId, readonly SubjectProgress[]>;
  bestStreak: number;
  completedNodes: number;
  completedSessions: { lessons: number; reviews: number };
  correctAnswers: number;
  /** Today's mixed, explainable question set. */
  dailyPlan: DailyPlan;
  level: LevelStatus;
  /** Every mistake ever opened, with the evidence behind it. */
  mistakeNotebook: MistakeNotebook;
  /** The next node the learner can open anywhere, or null when none is left. */
  nextStep: PathStep | null;
  /** The instant and zone every derived date on screen is measured against. */
  observedAt: ReportMoment;
  pathProgress: ReadonlyMap<PathNodeId, PathProgress>;
  perfectRounds: number;
  profile: LearnerProfile | null;
  recommendation: Recommendation;
  /** Due review schedule, so window-specific reports can be rebuilt without a re-read. */
  reviewItems: readonly ReviewItem[];
  /** Questions this learner reported as broken. */
  reportedExerciseIds: ReadonlySet<string>;
  /** The attributable answer log behind every performance read model. */
  scoredAttempts: readonly StoredAttempt[];
  streak: { current: number; todayQualified: boolean };
  subjects: ReadonlyMap<SubjectId, SubjectProgress>;
  totalXp: number;
  /** All-time report. Windowed views are rebuilt from `scoredAttempts`. */
  topicPerformance: TopicPerformanceReport;
  week: readonly StreakDay[];
  /** The closed week ending on the learner's chosen report day. */
  weeklyReport: WeeklyReport;
};

export type ProgressDashboardState =
  | { status: 'loading' }
  | { error: Error; refresh: () => void; status: 'failed' }
  | { data: ProgressDashboard; refresh: () => void; status: 'ready' };

/**
 * One consistent read model behind every tab.
 *
 * Everything derived here — levels, unit unlocking, subject completion — is
 * recomputed from the ledger and the path records on each focus rather than
 * cached, so no screen can show a figure that the learner's own history does
 * not support.
 */
export function useProgressDashboard(clock: Clock = systemClock): ProgressDashboardState {
  const repositories = useRepositories();
  const [revision, setRevision] = useState(0);
  const [state, setState] = useState<
    | { data: ProgressDashboard; status: 'ready' }
    | { error: Error; status: 'failed' }
    | { status: 'loading' }
  >({ status: 'loading' });
  const refresh = useCallback(() => setRevision((value) => value + 1), []);

  useFocusEffect(
    useCallback(() => {
      // `revision` is an explicit refresh signal; reading it makes a retry
      // re-run the focused query without changing repository identity.
      void revision;
      let cancelled = false;
      const now = clock.now();
      const today = toLocalDate(now, clock.timeZone());

      Promise.all([
        repositories.xp.total(),
        repositories.dailyActivity.listQualifyingDates(),
        repositories.dailyActivity.list(),
        repositories.progress.getAll(),
        repositories.sessions.findActive(),
        repositories.review.listAll(),
        repositories.mistakes.listUnresolved(),
        repositories.mistakes.listAll(),
        repositories.sessions.completionCounts(),
        repositories.profile.read(),
        repositories.xp.list(),
        repositories.statistics.read(),
        repositories.attempts.listAllScored(),
        repositories.reports.listAll(),
      ])
        .then(
          ([
            totalXp,
            dates,
            activityDays,
            progressRows,
            activeSession,
            reviewItems,
            mistakes,
            allMistakes,
            counts,
            profile,
            ledger,
            statistics,
            attempts,
            reports,
          ]) => {
            if (cancelled) {
              return;
            }

            const index = getContentIndex();
            const pathProgress = new Map(progressRows.map((row) => [row.pathNodeId, row]));

            const subjects = new Map<SubjectId, SubjectProgress>();
            const byExam = new Map<ExamId, SubjectProgress[]>();

            for (const subject of index.bundle.subjects) {
              const paths = subject.unitIds.map((unitId) =>
                buildUnitPath(unitId, index.getUnitPath(unitId), pathProgress),
              );
              const totalSteps = paths.reduce((sum, path) => sum + path.steps.length, 0);
              const doneSteps = paths.reduce((sum, path) => sum + path.completedCount, 0);
              const subjectXp = subjectXpFor(ledger, index, subject.id);

              const entry: SubjectProgress = {
                completedUnits: paths.filter(
                  (path) => path.steps.length > 0 && path.completedCount === path.steps.length,
                ).length,
                level: levelForXp(subjectXp),
                paths,
                progress: totalSteps === 0 ? 0 : doneSteps / totalSteps,
                subject,
                totalUnits: paths.length,
                xp: subjectXp,
              };

              subjects.set(subject.id, entry);
              const examGroup = byExam.get(subject.examId) ?? [];
              examGroup.push(entry);
              byExam.set(subject.examId, examGroup);
            }

            const allPaths = [...subjects.values()].flatMap((entry) => entry.paths);
            const nextStep = nextOpenStep(allPaths);
            const streak = computeStreak(dates, today);
            const observedAt: ReportMoment = { atMs: now, timeZone: clock.timeZone() };
            const reportedExerciseIds = new Set(reports.map((report) => report.exerciseId));
            const topicPerformance = buildTopicPerformance(attempts, index, {
              moment: observedAt,
              reviewItems,
            });
            // The plan may open any lesson the path has already unlocked, not
            // only the single next step, so a short day can still be filled.
            const openLessonIds = allPaths.flatMap((path) =>
              path.steps.flatMap((step) =>
                (step.status === 'available' || step.status === 'current') &&
                step.node.lessonId !== undefined
                  ? [step.node.lessonId]
                  : [],
              ),
            );

            setState({
              data: {
                bestStreak: longestRun(dates),
                byExam,
                completedNodes: progressRows.filter((row) => row.status === 'completed').length,
                completedSessions: counts,
                correctAnswers: statistics.correctAnswers,
                dailyPlan: buildDailyPlan({
                  attempts,
                  dueSkillIds: sortDueItems(
                    reviewItems.filter((item) => isDue(item, now)),
                  ).map((item) => item.skillId),
                  index,
                  newLessonIds: openLessonIds,
                  reportedExerciseIds,
                  topics: topicPerformance.topics,
                }),
                level: levelForXp(totalXp),
                mistakeNotebook: buildMistakeNotebook(allMistakes, attempts, index),
                nextStep,
                observedAt,
                pathProgress,
                perfectRounds: statistics.perfectRounds,
                profile,
                recommendation: recommendNext({
                  activeSession,
                  atMs: now,
                  nextLesson:
                    nextStep === null || nextStep.node.lessonId === undefined
                      ? null
                      : { lessonId: nextStep.node.lessonId, pathNodeId: nextStep.node.id },
                  reviewItems,
                  unresolvedMistakes: mistakes,
                }),
                reportedExerciseIds,
                reviewItems,
                scoredAttempts: attempts,
                streak,
                subjects,
                totalXp,
                topicPerformance,
                week: buildStreakWeek(dates, today),
                weeklyReport: buildWeeklyReport({
                  attempts,
                  dailyActivity: activityDays,
                  index,
                  moment: observedAt,
                  ...(profile === null ? {} : { reportDay: profile.weeklyReportDay }),
                }),
              },
              status: 'ready',
            });
          },
        )
        .catch((cause: unknown) => {
          if (!cancelled) {
            setState({
              error: cause instanceof Error ? cause : new Error(String(cause)),
              status: 'failed',
            });
          }
        });

      return () => {
        cancelled = true;
      };
    }, [clock, repositories, revision]),
  );

  return state.status === 'ready'
    ? { ...state, refresh }
    : state.status === 'failed'
      ? { ...state, refresh }
      : state;
}

/**
 * Attributes ledger entries to a subject through the lesson they came from.
 * Entries with no lesson (there are none today) simply do not count toward any
 * subject, which is safer than guessing.
 */
function subjectXpFor(
  ledger: readonly { amount: number; lessonId?: string | undefined }[],
  index: ReturnType<typeof getContentIndex>,
  subjectId: SubjectId,
): number {
  let total = 0;
  for (const entry of ledger) {
    if (entry.lessonId === undefined) {
      continue;
    }
    const lesson = index.bundle.lessons.find((candidate) => candidate.id === entry.lessonId);
    if (lesson === undefined) {
      continue;
    }
    const topic = index.getTopic(lesson.topicId);
    if (index.getSubjectOfUnit(topic.unitId).id === subjectId) {
      total += entry.amount;
    }
  }

  return total;
}

/** The longest run of consecutive qualifying days ever recorded. */
function longestRun(dates: readonly string[]): number {
  const sorted = [...new Set(dates)].sort();
  let best = 0;
  let run = 0;
  let previous: string | null = null;

  for (const date of sorted) {
    run = previous !== null && isNextDay(previous, date) ? run + 1 : 1;
    best = Math.max(best, run);
    previous = date;
  }

  return best;
}

function isNextDay(earlier: string, later: string): boolean {
  const [y, m, d] = earlier.split('-').map(Number);
  const next = new Date(Date.UTC(y ?? 1970, (m ?? 1) - 1, (d ?? 1) + 1));

  return next.toISOString().slice(0, 10) === later;
}
