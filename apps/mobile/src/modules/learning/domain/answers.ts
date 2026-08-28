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
  | { kind: 'ordering'; itemIds: readonly string[] }
  | { choice: boolean; kind: 'trueFalse' };

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

const ANSWER_KINDS: readonly ExerciseKind[] = [
  'fillBlank',
  'flashcard',
  'matching',
  'multipleChoice',
  'ordering',
  'trueFalse',
];

/**
 * Reads an answer back out of the durable attempt log.
 *
 * Stored answers can outlive the shape that wrote them, so this returns `null`
 * rather than throwing: a record the app can no longer read is a gap in what it
 * can show, never a reason to fail opening the notebook.
 */
export function parseStoredAnswer(serialized: string): ExerciseAnswer | null {
  let parsed: unknown;
  try {
    parsed = JSON.parse(serialized);
  } catch {
    return null;
  }

  if (typeof parsed !== 'object' || parsed === null) {
    return null;
  }
  const kind = (parsed as { kind?: unknown }).kind;

  return typeof kind === 'string' && ANSWER_KINDS.includes(kind as ExerciseKind)
    ? (parsed as ExerciseAnswer)
    : null;
}
