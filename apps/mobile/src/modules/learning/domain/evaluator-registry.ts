import type {
  ExerciseDefinition,
  ExerciseKind,
  FillBlankExercise,
  FlashcardExercise,
  MatchingExercise,
  MultipleChoiceExercise,
  OrderingExercise,
  TrueFalseExercise,
} from '@/modules/curriculum/domain/content-types';
import type { EvaluationResult, ExerciseAnswer } from '@/modules/learning/domain/answers';

/**
 * Evaluation is registered per exercise kind, never branched on inside the
 * lesson engine. Adding an exercise type means adding a content contract, an
 * evaluator here, and a renderer — the session reducer stays untouched.
 */

type EvaluatorFor<E extends ExerciseDefinition, A extends ExerciseAnswer> = (
  exercise: E,
  answer: A,
) => EvaluationResult;

type ExerciseByKind = {
  [K in ExerciseKind]: Extract<ExerciseDefinition, { kind: K }>;
};

type AnswerByKind = {
  [K in ExerciseKind]: Extract<ExerciseAnswer, { kind: K }>;
};

type EvaluatorRegistry = {
  [K in ExerciseKind]: EvaluatorFor<ExerciseByKind[K], AnswerByKind[K]>;
};

const evaluateMultipleChoice: EvaluatorFor<
  MultipleChoiceExercise,
  { kind: 'multipleChoice'; optionId: string }
> = (exercise, answer) => {
  const correctOption = exercise.options.find((option) => option.id === exercise.correctOptionId);

  return {
    correct: answer.optionId === exercise.correctOptionId,
    correctAnswerSummary: correctOption?.label ?? '',
    scored: true,
  };
};

const evaluateFillBlank: EvaluatorFor<
  FillBlankExercise,
  { kind: 'fillBlank'; tokenIds: readonly string[] }
> = (exercise, answer) => {
  const labelOf = (id: string) => exercise.bank.find((token) => token.id === id)?.label ?? '';
  const correct =
    answer.tokenIds.length === exercise.solutionTokenIds.length &&
    answer.tokenIds.every((id, index) => id === exercise.solutionTokenIds[index]);

  return {
    correct,
    correctAnswerSummary: exercise.solutionTokenIds.map(labelOf).join(' '),
    scored: true,
  };
};

const evaluateMatching: EvaluatorFor<
  MatchingExercise,
  { kind: 'matching'; pairs: Readonly<Record<string, string>> }
> = (exercise, answer) => {
  const correct = exercise.pairs.every((pair) => answer.pairs[pair.id] === pair.right);

  return {
    correct,
    correctAnswerSummary: exercise.pairs
      .map((pair) => `${pair.left} — ${pair.right}`)
      .join(', '),
    scored: true,
  };
};

const evaluateOrdering: EvaluatorFor<
  OrderingExercise,
  { itemIds: readonly string[]; kind: 'ordering' }
> = (exercise, answer) => {
  const labelOf = (id: string) => exercise.items.find((item) => item.id === id)?.label ?? '';
  const correct =
    answer.itemIds.length === exercise.correctOrder.length &&
    answer.itemIds.every((id, index) => id === exercise.correctOrder[index]);

  return {
    correct,
    correctAnswerSummary: exercise.correctOrder.map(labelOf).join(' → '),
    scored: true,
  };
};

const evaluateTrueFalse: EvaluatorFor<
  TrueFalseExercise,
  { choice: boolean; kind: 'trueFalse' }
> = (exercise, answer) => ({
  correct: answer.choice === exercise.correctAnswer,
  correctAnswerSummary: exercise.correctAnswer ? 'Doğru' : 'Yanlış',
  scored: true,
});

const evaluateFlashcard: EvaluatorFor<
  FlashcardExercise,
  { kind: 'flashcard'; selfReport: 'known' | 'unknown' }
> = () => ({
  // Self-report is evidence, not a verdict: the deck always completes.
  correct: true,
  correctAnswerSummary: '',
  scored: false,
});

const registry: EvaluatorRegistry = {
  fillBlank: evaluateFillBlank,
  flashcard: evaluateFlashcard,
  matching: evaluateMatching,
  multipleChoice: evaluateMultipleChoice,
  ordering: evaluateOrdering,
  trueFalse: evaluateTrueFalse,
};

export class AnswerKindMismatchError extends Error {
  constructor(exerciseKind: ExerciseKind, answerKind: ExerciseKind) {
    super(`"${exerciseKind}" alıştırmasına "${answerKind}" türünde cevap gönderildi.`);
    this.name = 'AnswerKindMismatchError';
  }
}

/**
 * Evaluates an answer against its exercise. Throws when the answer's kind does
 * not match the exercise's — that is a wiring bug, not learner input.
 */
export function evaluateAnswer(
  exercise: ExerciseDefinition,
  answer: ExerciseAnswer,
): EvaluationResult {
  if (answer.kind !== exercise.kind) {
    throw new AnswerKindMismatchError(exercise.kind, answer.kind);
  }

  // The discriminators are proven equal above; the registry is keyed by kind.
  const evaluator = registry[exercise.kind] as EvaluatorFor<ExerciseDefinition, ExerciseAnswer>;

  return evaluator(exercise, answer);
}
