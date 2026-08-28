import type { ContentIndex } from '@/modules/curriculum/domain/content-index';
import type { ReviewItem, StoredAttempt } from '@/modules/progress/domain/progress-types';

export type TopicPerformanceBand = 'developing' | 'needsPractice' | 'strong';

export type SubtopicPerformance = PerformanceSummary & {
  id: string;
  nextReviewAt: string | null;
  title: string;
};

export type MainTopicPerformance = PerformanceSummary & {
  id: string;
  nextReviewAt: string | null;
  subtopics: readonly SubtopicPerformance[];
  title: string;
};

type PerformanceSummary = {
  accuracy: number;
  band: TopicPerformanceBand;
  correctAnswers: number;
  lastAttemptAt: string;
  totalAttempts: number;
  wrongAnswers: number;
};

type MutableSummary = {
  correctAnswers: number;
  lastAttemptAt: string;
  totalAttempts: number;
};

/**
 * Builds an honest, evidence-aware topic read model from the durable attempt log.
 * A multi-subtopic question contributes once to its main topic and once to each
 * distinct subtopic it intentionally measures.
 */
export function buildTopicPerformance(
  attempts: readonly StoredAttempt[],
  index: ContentIndex,
  reviewItems: readonly ReviewItem[] = [],
): readonly MainTopicPerformance[] {
  const main = new Map<string, MutableSummary>();
  const sub = new Map<string, MutableSummary>();

  for (const attempt of attempts) {
    if (!attempt.scored) {
      continue;
    }

    const exerciseExists = index.bundle.exercises.some(
      (exercise) => exercise.id === attempt.exerciseId,
    );
    if (!exerciseExists) {
      // Old attempts can outlive an authored content version. They remain in
      // history but cannot be attributed safely after their taxonomy disappears.
      continue;
    }

    const taxonomy = index.getExerciseTaxonomy(attempt.exerciseId);
    addEvidence(main, taxonomy.mainTopic.id, attempt);
    for (const topic of taxonomy.subtopics) {
      addEvidence(sub, topic.id, attempt);
    }
  }

  return index.bundle.units.flatMap((unit) => {
    const summary = main.get(unit.id);
    if (summary === undefined) {
      return [];
    }

    const subtopics = unit.topicIds.flatMap((topicId) => {
      const topicSummary = sub.get(topicId);
      if (topicSummary === undefined) {
        return [];
      }
      const topic = index.getTopic(topicId);
      return [{
        id: topicId,
        nextReviewAt: earliestReviewAt(topic.skillIds, reviewItems),
        title: topic.title,
        ...finish(topicSummary),
      }];
    });

    return [{
      id: unit.id,
      nextReviewAt: earliest(
        subtopics.flatMap((subtopic) =>
          subtopic.nextReviewAt === null ? [] : [subtopic.nextReviewAt],
        ),
      ),
      subtopics,
      title: unit.title,
      ...finish(summary),
    }];
  });
}

function earliestReviewAt(
  skillIds: readonly string[],
  reviewItems: readonly ReviewItem[],
): string | null {
  const relevant = new Set(skillIds);
  return earliest(
    reviewItems.flatMap((item) => (relevant.has(item.skillId) ? [item.dueAt] : [])),
  );
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

function addEvidence(
  summaries: Map<string, MutableSummary>,
  id: string,
  attempt: StoredAttempt,
): void {
  const current = summaries.get(id) ?? {
    correctAnswers: 0,
    lastAttemptAt: attempt.occurredAt,
    totalAttempts: 0,
  };
  current.totalAttempts += 1;
  current.correctAnswers += attempt.correct ? 1 : 0;
  if (attempt.occurredAt > current.lastAttemptAt) {
    current.lastAttemptAt = attempt.occurredAt;
  }
  summaries.set(id, current);
}

function finish(summary: MutableSummary): PerformanceSummary {
  const accuracy = summary.correctAnswers / summary.totalAttempts;
  return {
    accuracy,
    band:
      summary.totalAttempts >= 3 && accuracy >= 0.75
        ? 'strong'
        : summary.totalAttempts >= 2 && accuracy < 0.5
          ? 'needsPractice'
          : 'developing',
    correctAnswers: summary.correctAnswers,
    lastAttemptAt: summary.lastAttemptAt,
    totalAttempts: summary.totalAttempts,
    wrongAnswers: summary.totalAttempts - summary.correctAnswers,
  };
}
