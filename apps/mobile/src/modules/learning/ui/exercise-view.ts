import type { ExerciseDefinition, ExerciseId } from '@/modules/curriculum/domain/content-types';
import type { EvaluationResult, ExerciseAnswer } from '@/modules/learning/domain/answers';

/**
 * The contract every exercise screen implements.
 *
 * A renderer collects a draft answer and hands it to the engine; it never
 * decides whether that answer is right. `evaluation` is null while the learner
 * is still answering and holds the engine's verdict once they have checked.
 *
 * A renderer also owns its own primary action, because "Kontrol Et" is only
 * enabled once *that* exercise considers itself answerable.
 */
export type ExerciseViewProps<TExercise extends ExerciseDefinition> = {
  evaluation: (EvaluationResult & { exerciseId: ExerciseId }) | null;
  exercise: TExercise;
  onSubmit: (answer: ExerciseAnswer) => void;
};
