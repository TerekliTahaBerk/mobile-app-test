import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import type { ExerciseDefinition } from '@/modules/curriculum/domain/content-types';
import { useLessonSession } from '@/modules/learning/application/lesson-session-store';
import { XP_POLICY_V1 } from '@/modules/learning/domain/xp-policy';
import { ExitConfirmSheet } from '@/modules/learning/ui/exit-confirm-sheet';
import { FeedbackSheet } from '@/modules/learning/ui/feedback-sheet';
import { FillBlankExercise } from '@/modules/learning/ui/exercises/fill-blank-exercise';
import { FlashcardExercise } from '@/modules/learning/ui/exercises/flashcard-exercise';
import { MatchingExercise } from '@/modules/learning/ui/exercises/matching-exercise';
import { MultipleChoiceExercise } from '@/modules/learning/ui/exercises/multiple-choice-exercise';
import { OrderingExercise } from '@/modules/learning/ui/exercises/ordering-exercise';
import { TrueFalseExercise } from '@/modules/learning/ui/exercises/true-false-exercise';
import { LessonHeader } from '@/modules/learning/ui/lesson-header';
import { Screen } from '@/shared/ui/components/screen';

type LessonScreenProps = {
  /** `null` when the hearts limit does not apply, e.g. a free practice round. */
  hearts: number | null;
  onComplete: () => void;
  onExit: () => void;
  /** Called when a scored answer comes back wrong, so a heart can be spent. */
  onWrongAnswer?: (() => void) | undefined;
};

/**
 * The exercise runner. It owns the chrome and the feedback sheet; each exercise
 * kind owns its own body and its own "answerable yet?" rule.
 */
export function LessonScreen({ hearts, onComplete, onExit, onWrongAnswer }: LessonScreenProps) {
  const { continueAfterFeedback, lesson, reportQuestion, submitAnswer } = useLessonSession();
  // The deck position is keyed by its exercise, so moving to a new exercise
  // resets the card without an effect that writes state during render.
  const [deckPosition, setDeckPosition] = useState({ exerciseId: '', index: 0 });
  const [confirmingExit, setConfirmingExit] = useState(false);

  const session = lesson?.session ?? null;
  const exercise = currentExercise(lesson);
  const evaluation = session?.lastEvaluation ?? null;
  const showingFeedback = session?.phase === 'feedback' && evaluation !== null;
  const cardIndex = deckPosition.exerciseId === exercise?.id ? deckPosition.index : 0;

  useEffect(() => {
    if (session?.status === 'completed') {
      onComplete();
    }
  }, [onComplete, session?.status]);

  // An unscored exercise has no verdict to show, so there is nothing for the
  // learner to acknowledge: the deck advances itself rather than parking the
  // session in a feedback phase with no way forward.
  useEffect(() => {
    if (session?.phase === 'feedback' && evaluation !== null && !evaluation.scored) {
      continueAfterFeedback();
    }
  }, [continueAfterFeedback, evaluation, session?.phase]);

  if (lesson === null || exercise === undefined || session === null) {
    return null;
  }

  const isFlashcard = exercise.kind === 'flashcard';
  const stepIndex = session.currentIndex;
  const progress = isFlashcard
    ? (cardIndex + 1) / exercise.cards.length
    : (stepIndex + (showingFeedback ? 1 : 0)) / session.exerciseIds.length;

  return (
    <Screen
      background={isFlashcard ? 'flashcard' : 'lesson'}
      includeBottomInset={false}
      testID="lesson-screen"
    >
      <LessonHeader
        counter={
          isFlashcard ? `${cardIndex + 1} / ${exercise.cards.length}` : undefined
        }
        hearts={hearts}
        onDark={isFlashcard}
        onExit={() => setConfirmingExit(true)}
        progress={progress}
      />

      <View style={styles.body}>
        <ExerciseBody
          cardIndex={cardIndex}
          evaluation={evaluation}
          exercise={exercise}
          // Renderers hold the learner's draft answer in their own state.
          // Keying by exercise remounts them, so two questions of the same kind
          // in one round cannot inherit each other's half-finished answer.
          key={exercise.id}
          onAdvanceCard={() => setDeckPosition({ exerciseId: exercise.id, index: cardIndex + 1 })}
          onSubmit={(answer) => {
            submitAnswer(answer);
          }}
        />
      </View>

      {showingFeedback && evaluation.scored ? (
        <FeedbackSheet
          correct={evaluation.correct}
          correctAnswerSummary={evaluation.correctAnswerSummary}
          explanation={exercise.explanation}
          onContinue={() => {
            if (!evaluation.correct) {
              onWrongAnswer?.();
            }
            continueAfterFeedback();
          }}
          onReport={(reason) => {
            // Reporting is not answering: a failed write must not interrupt the
            // round the learner is in the middle of.
            void reportQuestion(exercise.id, reason).catch(() => undefined);
          }}
          xpAwarded={evaluation.correct ? XP_POLICY_V1.correctExercise : null}
        />
      ) : null}

      <ExitConfirmSheet
        onCancel={() => setConfirmingExit(false)}
        onConfirm={() => {
          setConfirmingExit(false);
          onExit();
        }}
        visible={confirmingExit}
      />
    </Screen>
  );
}

type ExerciseBodyProps = {
  cardIndex: number;
  evaluation: React.ComponentProps<typeof MultipleChoiceExercise>['evaluation'];
  exercise: ExerciseDefinition;
  onAdvanceCard: () => void;
  onSubmit: React.ComponentProps<typeof MultipleChoiceExercise>['onSubmit'];
};

function ExerciseBody({
  cardIndex,
  evaluation,
  exercise,
  onAdvanceCard,
  onSubmit,
}: ExerciseBodyProps) {
  switch (exercise.kind) {
    case 'multipleChoice':
      return (
        <MultipleChoiceExercise
          evaluation={evaluation}
          exercise={exercise}
          onSubmit={onSubmit}
        />
      );
    case 'trueFalse':
      return <TrueFalseExercise evaluation={evaluation} exercise={exercise} onSubmit={onSubmit} />;
    case 'fillBlank':
      return <FillBlankExercise evaluation={evaluation} exercise={exercise} onSubmit={onSubmit} />;
    case 'matching':
      return <MatchingExercise evaluation={evaluation} exercise={exercise} onSubmit={onSubmit} />;
    case 'ordering':
      return <OrderingExercise evaluation={evaluation} exercise={exercise} onSubmit={onSubmit} />;
    case 'flashcard':
      return (
        <FlashcardExercise
          cardIndex={cardIndex}
          evaluation={evaluation}
          exercise={exercise}
          onAdvanceCard={onAdvanceCard}
          onSubmit={onSubmit}
        />
      );
  }
}

function currentExercise(
  lesson: ReturnType<typeof useLessonSession>['lesson'],
): ExerciseDefinition | undefined {
  return lesson === null ? undefined : lesson.deps.exercises[lesson.session.currentIndex];
}

const styles = StyleSheet.create({
  body: {
    flex: 1,
  },
});
