import type { ExerciseDefinition } from '@/modules/curriculum/domain/content-types';
import { lessonPreviewData } from '@/modules/learning/model/lesson-preview-data';
import type { ScreenBackground } from '@/shared/ui/components/screen';
import { theme } from '@/shared/ui/theme/tokens';

export type LessonChrome = {
  background: ScreenBackground;
  counter?: string | undefined;
  counterColor?: string | undefined;
  fillColor?: string | undefined;
  glyphColor?: string | undefined;
  hearts?: string | undefined;
  progress: number;
  trackColor?: string | undefined;
};

type LessonChromeInput = {
  cardIndex: number;
  exercise: ExerciseDefinition;
  exerciseCount: number;
  stepIndex: number;
};

/**
 * Chooses the HUD treatment for the exercise on screen. The flashcard deck runs
 * in the philosophy palette and counts cards instead of hearts, exactly as the
 * design specifies.
 *
 * Hearts remain preview data: there is no hearts economy yet, and inventing one
 * here would be a gamification decision this phase does not own.
 */
export function lessonChromeFor({
  cardIndex,
  exercise,
  exerciseCount,
  stepIndex,
}: LessonChromeInput): LessonChrome {
  const sequenceProgress = (stepIndex + 1) / exerciseCount;

  if (exercise.kind === 'flashcard') {
    return {
      background: 'flashcard',
      counter: `${cardIndex + 1}/${exercise.cards.length}`,
      counterColor: theme.colors.subject.philosophy.ink,
      fillColor: theme.colors.subject.philosophy.primary,
      glyphColor: theme.colors.subject.philosophy.dim,
      progress: (cardIndex + 1) / exercise.cards.length,
      trackColor: theme.colors.subject.philosophy.track,
    };
  }

  return {
    background: 'lesson',
    hearts: lessonPreviewData.hearts,
    progress: sequenceProgress,
  };
}
