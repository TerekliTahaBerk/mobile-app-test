import type { ExerciseKind } from '@/modules/curriculum/domain/content-types';

/**
 * What a learner submits. Answers are plain, serializable data keyed by the
 * same discriminator as the exercise, so a renderer and an evaluator never
 * need to know about each other.
 */
export type ExerciseAnswer =
  | { kind: 'fillBlank'; tokenIds: readonly string[] }
  /** Recall is self-reported; it completes the card without being scored. */
  | { kind: 'flashcard'; selfReport: 'known' | 'unknown' }
  /** Left pair id -> chosen right label. */
  | { kind: 'matching'; pairs: Readonly<Record<string, string>> }
  | { kind: 'multipleChoice'; optionId: string }
  | { kind: 'ordering'; itemIds: readonly string[] };

export type EvaluationResult = {
  correct: boolean;
  /** Learner-facing rendering of the right answer, shown when they miss. */
  correctAnswerSummary: string;
  /**
   * False for self-reported kinds. Unscored exercises still complete and still
   * produce skill evidence, but never count as right/wrong and never award
   * correctness XP.
   */
  scored: boolean;
};

export function answerMatchesKind(answer: ExerciseAnswer, kind: ExerciseKind): boolean {
  return answer.kind === kind;
}
