import type {
  ExerciseDefinition,
  ExerciseId,
  SubjectId,
} from '@/modules/curriculum/domain/content-types';
import type { EvaluationResult, ExerciseAnswer } from '@/modules/learning/domain/answers';
import type { SubjectKey } from '@/shared/ui/theme/tokens';

/**
 * The contract every exercise screen implements.
 *
 * A renderer collects a draft answer and hands it to the engine; it never
 * decides whether that answer is right. `evaluation` is null while the learner
 * is still answering and holds the engine's verdict once they have checked.
 */
export type ExerciseViewProps<TExercise extends ExerciseDefinition> = {
  evaluation: EvaluationResult & { exerciseId: ExerciseId } | null;
  exercise: TExercise;
  onContinue: () => void;
  onSubmit: (answer: ExerciseAnswer) => void;
  /** Palette for the subject this exercise belongs to. */
  subject: SubjectKey;
};

/**
 * Maps a curriculum subject onto its palette. Content carries no colours, so
 * the tint lives here rather than in the bundle.
 */
const SUBJECT_THEME: Readonly<Record<string, SubjectKey>> = {
  'tyt.social.geography': 'geography',
  'tyt.social.history': 'history',
  'tyt.social.philosophy': 'philosophy',
  'tyt.social.religion': 'religion',
};

export function subjectThemeFor(subjectId: SubjectId): SubjectKey {
  return SUBJECT_THEME[subjectId] ?? 'history';
}
