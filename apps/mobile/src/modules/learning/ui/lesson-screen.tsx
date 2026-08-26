import { useState } from 'react';

import {
  lessonPreviewData,
  type LessonExercisePreview,
} from '@/modules/learning/model/lesson-preview-data';
import { ExitConfirmSheet } from '@/modules/learning/ui/exit-confirm-sheet';
import { FlashcardExercise } from '@/modules/learning/ui/exercises/flashcard-exercise';
import { MatchingExercise } from '@/modules/learning/ui/exercises/matching-exercise';
import { MultipleChoiceExercise } from '@/modules/learning/ui/exercises/multiple-choice-exercise';
import { WordBankExercise } from '@/modules/learning/ui/exercises/word-bank-exercise';
import { LessonHeader } from '@/modules/learning/ui/lesson-header';
import { Screen, type ScreenBackground } from '@/shared/ui/components/screen';
import { theme } from '@/shared/ui/theme/tokens';

type LessonScreenProps = {
  onComplete: () => void;
  onExit: () => void;
};

/**
 * Walks the preview lesson through the imported design's exercise screens.
 * The step order is presentation sequencing only — there is no recommendation,
 * evaluation, or session engine behind it.
 */
export function LessonScreen({ onComplete, onExit }: LessonScreenProps) {
  const [stepIndex, setStepIndex] = useState(0);
  const [exitVisible, setExitVisible] = useState(false);

  const exercise = lessonPreviewData.exercises[stepIndex];
  if (exercise === undefined) {
    return null;
  }

  const advance = () => {
    if (stepIndex + 1 >= lessonPreviewData.exercises.length) {
      onComplete();
      return;
    }
    setStepIndex((index) => index + 1);
  };

  const chrome = chromeFor(exercise, stepIndex, lessonPreviewData.exercises.length);

  return (
    <Screen background={chrome.background} includeBottomInset={false} testID="lesson-screen">
      <LessonHeader
        counter={chrome.counter}
        counterColor={chrome.counterColor}
        fillColor={chrome.fillColor}
        glyphColor={chrome.glyphColor}
        hearts={chrome.hearts}
        onClose={() => setExitVisible(true)}
        progress={chrome.progress}
        trackColor={chrome.trackColor}
      />

      <ExerciseStep exercise={exercise} onAdvance={advance} />

      <ExitConfirmSheet
        exit={lessonPreviewData.exit}
        onConfirm={() => {
          setExitVisible(false);
          onExit();
        }}
        onStay={() => setExitVisible(false)}
        visible={exitVisible}
      />
    </Screen>
  );
}

type ExerciseStepProps = {
  exercise: LessonExercisePreview;
  onAdvance: () => void;
};

/** One renderer per exercise shape — composition instead of one universal component. */
function ExerciseStep({ exercise, onAdvance }: ExerciseStepProps) {
  switch (exercise.kind) {
    case 'multipleChoice':
      return <MultipleChoiceExercise exercise={exercise} onAdvance={onAdvance} />;
    case 'wordBank':
      return <WordBankExercise exercise={exercise} onAdvance={onAdvance} />;
    case 'matching':
      return <MatchingExercise exercise={exercise} onAdvance={onAdvance} />;
    case 'flashcard':
      return <FlashcardExercise exercise={exercise} onAdvance={onAdvance} />;
  }
}

type LessonChrome = {
  background: ScreenBackground;
  counter?: string | undefined;
  counterColor?: string | undefined;
  fillColor?: string | undefined;
  glyphColor?: string | undefined;
  hearts?: string | undefined;
  progress: number;
  trackColor?: string | undefined;
};

/**
 * The flashcard deck runs in the philosophy palette and tracks cards instead of
 * hearts, exactly as the design shows.
 */
function chromeFor(
  exercise: LessonExercisePreview,
  stepIndex: number,
  stepCount: number,
): LessonChrome {
  const sequenceProgress = (stepIndex + 1) / stepCount;

  if (exercise.kind === 'flashcard') {
    return {
      background: 'flashcard',
      counter: `${stepIndex + 1}/${exercise.deckSize}`,
      counterColor: theme.colors.subject.philosophy.ink,
      fillColor: theme.colors.subject.philosophy.primary,
      glyphColor: theme.colors.subject.philosophy.dim,
      progress: sequenceProgress,
      trackColor: theme.colors.subject.philosophy.track,
    };
  }

  return {
    background: 'lesson',
    hearts: lessonPreviewData.hearts,
    progress:
      exercise.kind === 'matching' ? sequenceProgress : exercise.progress,
  };
}
