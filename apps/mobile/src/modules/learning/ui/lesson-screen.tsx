import { useEffect, useState } from 'react';

import { getContentIndex } from '@/modules/curriculum/content/content-source';
import type { ExerciseDefinition } from '@/modules/curriculum/domain/content-types';
import { useLessonSession } from '@/modules/learning/application/lesson-session-store';
import { subjectThemeFor, type ExerciseViewProps } from '@/modules/learning/ui/exercise-view';
import { ExitConfirmSheet } from '@/modules/learning/ui/exit-confirm-sheet';
import { FlashcardExercise } from '@/modules/learning/ui/exercises/flashcard-exercise';
import { MatchingExercise } from '@/modules/learning/ui/exercises/matching-exercise';
import { MultipleChoiceExercise } from '@/modules/learning/ui/exercises/multiple-choice-exercise';
import { WordBankExercise } from '@/modules/learning/ui/exercises/word-bank-exercise';
import { lessonChromeFor } from '@/modules/learning/ui/lesson-chrome';
import { LessonHeader } from '@/modules/learning/ui/lesson-header';
import { lessonPreviewData } from '@/modules/learning/model/lesson-preview-data';
import { Screen } from '@/shared/ui/components/screen';

type LessonScreenProps = {
  onComplete: () => void;
  onExit: () => void;
};

/**
 * Runs the active lesson. The screen holds no learning rules: it renders the
 * exercise the engine says is current, hands answers back, and reacts to the
 * session status the engine returns.
 */
export function LessonScreen({ onComplete, onExit }: LessonScreenProps) {
  const { continueAfterFeedback, discard, lesson, submitAnswer } = useLessonSession();
  const [cardIndex, setCardIndex] = useState(0);
  const [exitVisible, setExitVisible] = useState(false);

  const session = lesson?.session ?? null;
  const isCompleted = session?.status === 'completed';

  useEffect(() => {
    if (isCompleted) {
      onComplete();
    }
  }, [isCompleted, onComplete]);

  if (lesson === null || session === null || isCompleted) {
    return null;
  }

  const exercise = lesson.deps.exercises[session.currentIndex];
  if (exercise === undefined) {
    return null;
  }

  const index = getContentIndex();
  const topic = index.getTopic(lesson.deps.lesson.topicId);
  const subject = subjectThemeFor(index.getSubjectOfUnit(topic.unitId).id);
  const evaluation =
    session.lastEvaluation?.exerciseId === exercise.id ? session.lastEvaluation : null;

  const chrome = lessonChromeFor({
    cardIndex,
    exercise,
    exerciseCount: session.exerciseIds.length,
    stepIndex: session.currentIndex,
  });

  const viewProps: ExerciseViewProps<ExerciseDefinition> = {
    evaluation,
    exercise,
    onContinue: () => {
      setCardIndex(0);
      continueAfterFeedback();
    },
    onSubmit: submitAnswer,
    subject,
  };

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

      <ExerciseStep
        cardIndex={cardIndex}
        onCardIndexChange={setCardIndex}
        viewProps={viewProps}
      />

      <ExitConfirmSheet
        exit={lessonPreviewData.exit}
        onConfirm={() => {
          setExitVisible(false);
          discard();
          onExit();
        }}
        onStay={() => setExitVisible(false)}
        visible={exitVisible}
      />
    </Screen>
  );
}

type ExerciseStepProps = {
  cardIndex: number;
  onCardIndexChange: (index: number) => void;
  viewProps: ExerciseViewProps<ExerciseDefinition>;
};

/**
 * One renderer per exercise kind. The lesson engine never branches on kind;
 * this is the only place that does, and it only chooses a component.
 */
function ExerciseStep({ cardIndex, onCardIndexChange, viewProps }: ExerciseStepProps) {
  const { exercise } = viewProps;

  switch (exercise.kind) {
    case 'multipleChoice':
      return <MultipleChoiceExercise {...viewProps} exercise={exercise} />;
    case 'fillBlank':
      return <WordBankExercise {...viewProps} exercise={exercise} />;
    case 'matching':
      return <MatchingExercise {...viewProps} exercise={exercise} />;
    case 'flashcard':
      return (
        <FlashcardExercise
          {...viewProps}
          cardIndex={cardIndex}
          exercise={exercise}
          onCardIndexChange={onCardIndexChange}
        />
      );
    case 'ordering':
      // Contracted but unrendered; content validation blocks it from a lesson.
      return null;
  }
}
