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

type DescriberFor<E extends ExerciseDefinition, A extends ExerciseAnswer> = {
  correct: (exercise: E) => string;
  given: (exercise: E, answer: A) => string;
  /** The question as the learner was asked it. */
  prompt: (exercise: E) => string;
};

type DescriberRegistry = {
  [K in ExerciseKind]: DescriberFor<ExerciseByKind[K], AnswerByKind[K]>;
};

/**
 * Learner-facing renderings of an answer, registered per kind alongside its
 * evaluator. Evaluation and the mistake notebook read the right answer from the
 * same place, so the two can never describe it differently.
 */
const describers: DescriberRegistry = {
  fillBlank: {
    correct: (exercise) => exercise.solutionTokenIds.map(tokenLabel(exercise)).join(' '),
    given: (exercise, answer) => answer.tokenIds.map(tokenLabel(exercise)).join(' '),
    prompt: (exercise) => exercise.title,
  },
  flashcard: {
    correct: () => '',
    given: (_exercise, answer) => (answer.selfReport === 'known' ? 'Biliyorum' : 'Tekrar et'),
    prompt: (exercise) => exercise.cards.map((card) => card.front).join(' · '),
  },
  matching: {
    correct: (exercise) => exercise.pairs.map((pair) => `${pair.left} — ${pair.right}`).join(', '),
    given: (exercise, answer) =>
      exercise.pairs.map((pair) => `${pair.left} — ${answer.pairs[pair.id] ?? '—'}`).join(', '),
    prompt: (exercise) => exercise.title,
  },
  multipleChoice: {
    correct: (exercise) => optionLabel(exercise, exercise.correctOptionId),
    given: (exercise, answer) => optionLabel(exercise, answer.optionId),
    prompt: (exercise) => exercise.prompt,
  },
  ordering: {
    correct: (exercise) => exercise.correctOrder.map(itemLabel(exercise)).join(' → '),
    given: (exercise, answer) => answer.itemIds.map(itemLabel(exercise)).join(' → '),
    prompt: (exercise) => exercise.prompt,
  },
  trueFalse: {
    correct: (exercise) => (exercise.correctAnswer ? 'Doğru' : 'Yanlış'),
    given: (_exercise, answer) => (answer.choice ? 'Doğru' : 'Yanlış'),
    prompt: (exercise) => exercise.statement,
  },
};

const tokenLabel = (exercise: FillBlankExercise) => (id: string) =>
  exercise.bank.find((token) => token.id === id)?.label ?? '';

const itemLabel = (exercise: OrderingExercise) => (id: string) =>
  exercise.items.find((item) => item.id === id)?.label ?? '';

function optionLabel(exercise: MultipleChoiceExercise, optionId: string): string {
  return exercise.options.find((option) => option.id === optionId)?.label ?? '';
}

/** The question as the learner was asked it. */
export function describePrompt(exercise: ExerciseDefinition): string {
  const describer = describers[exercise.kind] as DescriberFor<ExerciseDefinition, ExerciseAnswer>;

  return describer.prompt(exercise);
}

/** How the right answer reads to a learner. */
export function describeCorrectAnswer(exercise: ExerciseDefinition): string {
  const describer = describers[exercise.kind] as DescriberFor<ExerciseDefinition, ExerciseAnswer>;

  return describer.correct(exercise);
}

/**
 * How a submitted answer reads to a learner, or `null` when the stored answer
 * no longer matches the exercise it was recorded against.
 */
export function describeGivenAnswer(
  exercise: ExerciseDefinition,
  answer: ExerciseAnswer,
): string | null {
  if (answer.kind !== exercise.kind) {
    return null;
  }
  const describer = describers[exercise.kind] as DescriberFor<ExerciseDefinition, ExerciseAnswer>;
  const described = describer.given(exercise, answer);

  return described === '' ? null : described;
}

const evaluateMultipleChoice: EvaluatorFor<
  MultipleChoiceExercise,
  { kind: 'multipleChoice'; optionId: string }
> = (exercise, answer) => {
  return {
    correct: answer.optionId === exercise.correctOptionId,
    correctAnswerSummary: describeCorrectAnswer(exercise),
    scored: true,
  };
};

const evaluateFillBlank: EvaluatorFor<
  FillBlankExercise,
  { kind: 'fillBlank'; tokenIds: readonly string[] }
> = (exercise, answer) => {
  const correct =
    answer.tokenIds.length === exercise.solutionTokenIds.length &&
    answer.tokenIds.every((id, index) => id === exercise.solutionTokenIds[index]);

  return { correct, correctAnswerSummary: describeCorrectAnswer(exercise), scored: true };
};

const evaluateMatching: EvaluatorFor<
  MatchingExercise,
  { kind: 'matching'; pairs: Readonly<Record<string, string>> }
> = (exercise, answer) => {
  const correct = exercise.pairs.every((pair) => answer.pairs[pair.id] === pair.right);

  return { correct, correctAnswerSummary: describeCorrectAnswer(exercise), scored: true };
};

const evaluateOrdering: EvaluatorFor<
  OrderingExercise,
  { itemIds: readonly string[]; kind: 'ordering' }
> = (exercise, answer) => {
  const correct =
    answer.itemIds.length === exercise.correctOrder.length &&
    answer.itemIds.every((id, index) => id === exercise.correctOrder[index]);

  return { correct, correctAnswerSummary: describeCorrectAnswer(exercise), scored: true };
};

const evaluateTrueFalse: EvaluatorFor<
  TrueFalseExercise,
  { choice: boolean; kind: 'trueFalse' }
> = (exercise, answer) => ({
  correct: answer.choice === exercise.correctAnswer,
  correctAnswerSummary: describeCorrectAnswer(exercise),
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
