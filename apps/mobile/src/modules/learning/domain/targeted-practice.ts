import type { ContentIndex } from '@/modules/curriculum/domain/content-index';
import {
  isScoredKind,
  type ExerciseDefinition,
  type Lesson,
  type TopicId,
} from '@/modules/curriculum/domain/content-types';
import type { StoredAttempt } from '@/modules/progress/domain/progress-types';

export type TargetedPractice = {
  exercises: readonly ExerciseDefinition[];
  lesson: Lesson;
  topicId: TopicId;
};

/**
 * Builds a stable, bounded drill from every scored exercise that measures one
 * of the selected subtopic's skills. It reuses an authored lesson identity so
 * the existing durable session and attempt schema need no synthetic content.
 */
export function assembleTargetedPractice(
  topicId: TopicId,
  index: ContentIndex,
  limit = 5,
  attempts: readonly StoredAttempt[] = [],
): TargetedPractice {
  const topic = index.getTopic(topicId);
  const skillIds = new Set(topic.skillIds);
  const latestAttempt = new Map<string, StoredAttempt>();
  for (const attempt of attempts) {
    const current = latestAttempt.get(attempt.exerciseId);
    if (current === undefined || attempt.occurredAt > current.occurredAt) {
      latestAttempt.set(attempt.exerciseId, attempt);
    }
  }

  const exercises = index.bundle.exercises
    .filter(
      (exercise) =>
        isScoredKind(exercise.kind) && exercise.skillIds.some((skillId) => skillIds.has(skillId)),
    )
    .sort((left, right) => {
      const historyPriority = (exerciseId: string) => {
        const previous = latestAttempt.get(exerciseId);
        return previous === undefined ? 0 : previous.correct ? 2 : 1;
      };
      return (
        historyPriority(left.id) - historyPriority(right.id) ||
        left.difficulty - right.difficulty ||
        left.id.localeCompare(right.id)
      );
    })
    .slice(0, Math.max(1, limit));

  if (exercises.length === 0) {
    throw new Error(`Alt konu için puanlanan alıştırma bulunamadı: "${topicId}".`);
  }

  const sourceLesson = index.bundle.lessons.find((lesson) =>
    lesson.exerciseIds.includes(exercises[0]!.id),
  );
  if (sourceLesson === undefined) {
    throw new Error(`Hedefli çalışma alıştırmasının dersi bulunamadı: "${exercises[0]!.id}".`);
  }

  return {
    exercises,
    lesson: {
      ...sourceLesson,
      exerciseIds: exercises.map((exercise) => exercise.id),
      title: `${topic.title} · Hedefli Çalışma`,
      topicId,
    },
    topicId,
  };
}
