import type {
  ExerciseDefinition,
  ExerciseId,
} from '@/modules/curriculum/domain/content-types';
import type { StoredAttempt } from '@/modules/progress/domain/progress-types';

/** The learner's most recent answer to each question, by exercise id. */
export type ExerciseHistory = ReadonlyMap<ExerciseId, StoredAttempt>;

export function latestAttemptByExercise(attempts: readonly StoredAttempt[]): ExerciseHistory {
  const latest = new Map<ExerciseId, StoredAttempt>();
  for (const attempt of attempts) {
    const current = latest.get(attempt.exerciseId);
    if (current === undefined || attempt.occurredAt > current.occurredAt) {
      latest.set(attempt.exerciseId, attempt);
    }
  }

  return latest;
}

/**
 * Orders questions so a drill teaches the outcome rather than one item: a
 * question never seen comes before one already missed, which comes before one
 * already answered correctly. Ties fall back to difficulty and then to a stable
 * id, so the same history always assembles the same drill.
 */
export function rankByHistory(
  exercises: readonly ExerciseDefinition[],
  history: ExerciseHistory,
): readonly ExerciseDefinition[] {
  const priority = (exerciseId: ExerciseId) => {
    const previous = history.get(exerciseId);
    return previous === undefined ? 0 : previous.correct ? 2 : 1;
  };

  return [...exercises].sort(
    (left, right) =>
      priority(left.id) - priority(right.id) ||
      left.difficulty - right.difficulty ||
      left.id.localeCompare(right.id),
  );
}
