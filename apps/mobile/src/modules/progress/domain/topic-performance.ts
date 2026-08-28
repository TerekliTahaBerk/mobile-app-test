import type { ContentIndex } from '@/modules/curriculum/domain/content-index';
import type { ReviewItem, StoredAttempt } from '@/modules/progress/domain/progress-types';
import { addDays, daysBetween, toLocalDate } from '@/shared/time/local-date';

export type TopicPerformanceBand = 'developing' | 'needsPractice' | 'strong';

/** How far back the report looks. Windows are calendar days in the learner's zone. */
export type TopicPerformanceWindow = 'all' | 'last30' | 'last7';

/**
 * Direction of travel inside the window. `unknown` is reported honestly when
 * the sample is too small for a comparison to mean anything.
 */
export type TopicTrend = 'falling' | 'rising' | 'steady' | 'unknown';

/** The instant the report is rendered against, in the learner's own zone. */
export type ReportMoment = {
  atMs: number;
  timeZone: string;
};

export type TopicPerformanceOptions = {
  moment: ReportMoment;
  reviewItems?: readonly ReviewItem[];
  window?: TopicPerformanceWindow;
};

export type SubtopicPerformance = PerformanceSummary & {
  id: string;
  nextReviewAt: string | null;
  title: string;
};

export type MainTopicPerformance = PerformanceSummary & {
  /** How much of the authored main topic the learner has actually been measured on. */
  coverage: { measured: number; total: number };
  id: string;
  nextReviewAt: string | null;
  subtopics: readonly SubtopicPerformance[];
  title: string;
};

/** A subtopic where a previously missed question was answered correctly today. */
export type TopicCorrection = {
  /** Distinct questions turned from wrong to right today. */
  correctedQuestions: number;
  mainTopicTitle: string;
  subtopicId: string;
  title: string;
};

export type TopicPerformanceReport = {
  /** Every scored, attributable attempt on record, regardless of window. */
  attemptsAllTime: number;
  attemptsInWindow: number;
  correctedToday: readonly TopicCorrection[];
  topics: readonly MainTopicPerformance[];
  window: TopicPerformanceWindow;
};

type PerformanceSummary = {
  accuracy: number;
  band: TopicPerformanceBand;
  correctAnswers: number;
  /** Calendar days between the last measured answer and today. */
  daysSinceLastAttempt: number;
  /** Accuracy the first time each question was ever seen, or null with no such answer. */
  firstAttemptAccuracy: number | null;
  hasEnoughEvidence: boolean;
  lastAttemptAt: string;
  /** Accuracy on questions the learner had already answered before. */
  retryAccuracy: number | null;
  /** Looks strong, but has not been measured for a long time. */
  stale: boolean;
  totalAttempts: number;
  trend: TopicTrend;
  wrongAnswers: number;
};

type Sample = {
  correct: boolean;
  firstEver: boolean;
  occurredAt: string;
};

/** Below this, a percentage is a coincidence rather than a measurement. */
const EVIDENCE_THRESHOLD = 3;

/** A trend needs two comparable halves, so it needs a real sample. */
const TREND_THRESHOLD = 6;

/** How far apart the halves must be before movement is claimed. */
const TREND_MARGIN = 0.1;

/** A strength untouched for this long is worth re-measuring. */
const STALE_AFTER_DAYS = 14;

const WINDOW_DAYS: Readonly<Record<TopicPerformanceWindow, number | null>> = {
  all: null,
  last30: 30,
  last7: 7,
};

/**
 * Builds an honest, evidence-aware topic read model from the durable attempt log.
 * A multi-subtopic question contributes once to its main topic and once to each
 * distinct subtopic it intentionally measures.
 *
 * The window bounds what is *summarised*; corrections made today are always
 * derived from the learner's whole history, because turning a question that was
 * missed months ago into a correct answer is precisely the event worth showing.
 */
export function buildTopicPerformance(
  attempts: readonly StoredAttempt[],
  index: ContentIndex,
  options: TopicPerformanceOptions,
): TopicPerformanceReport {
  const { moment, reviewItems = [], window = 'all' } = options;
  const today = toLocalDate(moment.atMs, moment.timeZone);
  const localDateOf = (attempt: StoredAttempt) =>
    toLocalDate(Date.parse(attempt.occurredAt), moment.timeZone);

  const days = WINDOW_DAYS[window];
  const from = days === null ? null : addDays(today, -(days - 1));

  const attributable = attempts.filter(
    (attempt) =>
      attempt.scored &&
      // Old attempts can outlive an authored content version. They remain in
      // history but cannot be attributed safely after their taxonomy disappears.
      index.bundle.exercises.some((exercise) => exercise.id === attempt.exerciseId),
  );

  const firstEverIds = firstEverAttemptIds(attributable);
  const inWindow = attributable.filter(
    (attempt) => from === null || localDateOf(attempt) >= from,
  );

  const main = new Map<string, Sample[]>();
  const sub = new Map<string, Sample[]>();

  for (const attempt of inWindow) {
    const taxonomy = index.getExerciseTaxonomy(attempt.exerciseId);
    const sample: Sample = {
      correct: attempt.correct,
      firstEver: firstEverIds.has(attempt.id),
      occurredAt: attempt.occurredAt,
    };
    push(main, taxonomy.mainTopic.id, sample);
    for (const topic of taxonomy.subtopics) {
      push(sub, topic.id, sample);
    }
  }

  const topics = index.bundle.units.flatMap((unit) => {
    const samples = main.get(unit.id);
    if (samples === undefined) {
      return [];
    }

    const subtopics = unit.topicIds.flatMap((topicId) => {
      const topicSamples = sub.get(topicId);
      if (topicSamples === undefined) {
        return [];
      }
      const topic = index.getTopic(topicId);
      return [
        {
          id: topicId,
          nextReviewAt: earliestReviewAt(topic.skillIds, reviewItems),
          title: topic.title,
          ...summarize(topicSamples, today, moment.timeZone),
        },
      ];
    });

    return [
      {
        coverage: { measured: subtopics.length, total: unit.topicIds.length },
        id: unit.id,
        nextReviewAt: earliest(
          subtopics.flatMap((subtopic) =>
            subtopic.nextReviewAt === null ? [] : [subtopic.nextReviewAt],
          ),
        ),
        subtopics,
        title: unit.title,
        ...summarize(samples, today, moment.timeZone),
      },
    ];
  });

  return {
    attemptsAllTime: attributable.length,
    attemptsInWindow: inWindow.length,
    correctedToday: correctionsToday(attributable, index, today, moment.timeZone),
    topics,
    window,
  };
}

/**
 * Questions the learner had missed before and answered correctly today, grouped
 * by the subtopics they measure. A question already answered correctly and
 * repeated is not a correction: something has to have been wrong first.
 */
function correctionsToday(
  attempts: readonly StoredAttempt[],
  index: ContentIndex,
  today: string,
  timeZone: string,
): readonly TopicCorrection[] {
  const firstWrongAt = new Map<string, string>();
  for (const attempt of attempts) {
    if (attempt.correct) {
      continue;
    }
    const current = firstWrongAt.get(attempt.exerciseId);
    if (current === undefined || attempt.occurredAt < current) {
      firstWrongAt.set(attempt.exerciseId, attempt.occurredAt);
    }
  }

  const corrected = new Set<string>();
  for (const attempt of attempts) {
    const missedAt = firstWrongAt.get(attempt.exerciseId);
    if (
      attempt.correct &&
      missedAt !== undefined &&
      attempt.occurredAt > missedAt &&
      toLocalDate(Date.parse(attempt.occurredAt), timeZone) === today
    ) {
      corrected.add(attempt.exerciseId);
    }
  }

  const bySubtopic = new Map<string, TopicCorrection>();
  for (const exerciseId of corrected) {
    const taxonomy = index.getExerciseTaxonomy(exerciseId);
    for (const topic of taxonomy.subtopics) {
      const current = bySubtopic.get(topic.id);
      if (current === undefined) {
        bySubtopic.set(topic.id, {
          correctedQuestions: 1,
          mainTopicTitle: taxonomy.mainTopic.title,
          subtopicId: topic.id,
          title: topic.title,
        });
        continue;
      }
      bySubtopic.set(topic.id, {
        ...current,
        correctedQuestions: current.correctedQuestions + 1,
      });
    }
  }

  return [...bySubtopic.values()].sort(
    (left, right) =>
      right.correctedQuestions - left.correctedQuestions || left.title.localeCompare(right.title, 'tr'),
  );
}

/** Ids of the attempts that were the learner's first ever answer to their question. */
function firstEverAttemptIds(attempts: readonly StoredAttempt[]): ReadonlySet<string> {
  const earliestPerExercise = new Map<string, StoredAttempt>();
  for (const attempt of attempts) {
    const current = earliestPerExercise.get(attempt.exerciseId);
    if (
      current === undefined ||
      attempt.occurredAt < current.occurredAt ||
      (attempt.occurredAt === current.occurredAt && attempt.id < current.id)
    ) {
      earliestPerExercise.set(attempt.exerciseId, attempt);
    }
  }

  return new Set([...earliestPerExercise.values()].map((attempt) => attempt.id));
}

function push(samples: Map<string, Sample[]>, id: string, sample: Sample): void {
  const current = samples.get(id);
  if (current === undefined) {
    samples.set(id, [sample]);
    return;
  }
  current.push(sample);
}

function earliestReviewAt(
  skillIds: readonly string[],
  reviewItems: readonly ReviewItem[],
): string | null {
  const relevant = new Set(skillIds);
  return earliest(reviewItems.flatMap((item) => (relevant.has(item.skillId) ? [item.dueAt] : [])));
}

function earliest(instants: readonly string[]): string | null {
  let result: string | null = null;
  for (const instant of instants) {
    if (result === null || instant < result) {
      result = instant;
    }
  }

  return result;
}

function summarize(
  samples: readonly Sample[],
  today: string,
  timeZone: string,
): PerformanceSummary {
  const ordered = [...samples].sort((left, right) =>
    left.occurredAt.localeCompare(right.occurredAt),
  );
  const totalAttempts = ordered.length;
  const correctAnswers = ordered.filter((sample) => sample.correct).length;
  const accuracy = correctAnswers / totalAttempts;
  const lastAttemptAt = ordered[totalAttempts - 1]!.occurredAt;
  const band =
    totalAttempts >= EVIDENCE_THRESHOLD && accuracy >= 0.75
      ? 'strong'
      : totalAttempts >= 2 && accuracy < 0.5
        ? 'needsPractice'
        : 'developing';
  const daysSinceLastAttempt = daysBetween(
    toLocalDate(Date.parse(lastAttemptAt), timeZone),
    today,
  );

  return {
    accuracy,
    band,
    correctAnswers,
    daysSinceLastAttempt,
    firstAttemptAccuracy: accuracyOf(ordered.filter((sample) => sample.firstEver)),
    hasEnoughEvidence: totalAttempts >= EVIDENCE_THRESHOLD,
    lastAttemptAt,
    retryAccuracy: accuracyOf(ordered.filter((sample) => !sample.firstEver)),
    stale: band === 'strong' && daysSinceLastAttempt >= STALE_AFTER_DAYS,
    totalAttempts,
    trend: trendOf(ordered),
    wrongAnswers: totalAttempts - correctAnswers,
  };
}

function accuracyOf(samples: readonly Sample[]): number | null {
  return samples.length === 0
    ? null
    : samples.filter((sample) => sample.correct).length / samples.length;
}

/**
 * Compares the older half of the window against the newer half. Anything
 * smaller than two halves worth reading, or any movement inside the margin, is
 * reported as no movement rather than as a direction.
 */
function trendOf(ordered: readonly Sample[]): TopicTrend {
  if (ordered.length < TREND_THRESHOLD) {
    return 'unknown';
  }

  const split = Math.floor(ordered.length / 2);
  const earlierAccuracy = accuracyOf(ordered.slice(0, split));
  const laterAccuracy = accuracyOf(ordered.slice(split));
  if (earlierAccuracy === null || laterAccuracy === null) {
    return 'unknown';
  }

  const delta = laterAccuracy - earlierAccuracy;

  return delta > TREND_MARGIN ? 'rising' : delta < -TREND_MARGIN ? 'falling' : 'steady';
}
