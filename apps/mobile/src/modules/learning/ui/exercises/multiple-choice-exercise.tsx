import { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import type { MultipleChoicePreview } from '@/modules/learning/model/lesson-preview-data';
import { AnswerCard, type AnswerTone } from '@/modules/learning/ui/answer-card';
import { FeedbackPanel, feedbackSurface } from '@/modules/learning/ui/feedback-panel';
import { AppButton } from '@/shared/ui/components/app-button';
import { AppText } from '@/shared/ui/components/app-text';
import { BottomAction } from '@/shared/ui/components/bottom-action';
import { SubjectTag } from '@/shared/ui/components/subject-tag';
import { CizgiSpeech } from '@/shared/ui/cizgi/cizgi-speech';
import { theme } from '@/shared/ui/theme/tokens';

type MultipleChoiceExerciseProps = {
  exercise: MultipleChoicePreview;
  onAdvance: () => void;
};

/**
 * Design screen 04. Selecting arms the CTA, checking reveals the verdict and
 * the correct option.
 *
 * The "correct" flag is preview copy from the design, not an evaluation
 * contract: nothing here scores, awards XP, or records an attempt.
 */
export function MultipleChoiceExercise({ exercise, onAdvance }: MultipleChoiceExerciseProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [checked, setChecked] = useState(false);

  const selected = exercise.options.find((option) => option.id === selectedId);
  const isCorrect = checked && selected?.correct === true;
  const feedback = checked ? (isCorrect ? 'correct' : 'wrong') : null;

  const toneFor = (optionId: string, correct: boolean): AnswerTone => {
    if (!checked) {
      return optionId === selectedId ? 'selected' : 'idle';
    }
    if (correct) {
      return 'correct';
    }

    return optionId === selectedId ? 'wrong' : 'idle';
  };

  const stateLabelFor = (optionId: string, correct: boolean) => {
    if (!checked) {
      return optionId === selectedId ? 'Seçili' : undefined;
    }
    if (correct) {
      return 'Doğru yanıt';
    }

    return optionId === selectedId ? 'Yanlış yanıt' : undefined;
  };

  return (
    <>
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        style={styles.scroll}
      >
        <SubjectTag label={exercise.tag} subject={exercise.subject} />

        <CizgiSpeech mood={exercise.mood} width={74}>
          <AppText accessibilityRole="header" variant="headingS">
            {exercise.prompt}
          </AppText>
        </CizgiSpeech>

        <View style={styles.options}>
          {exercise.options.map((option) => (
            <AnswerCard
              disabled={checked}
              key={option.id}
              label={option.label}
              marker={option.key}
              onPress={() => setSelectedId(option.id)}
              stateLabel={stateLabelFor(option.id, option.correct)}
              testID={`mc-option-${option.key}`}
              tone={toneFor(option.id, option.correct)}
            />
          ))}
        </View>
      </ScrollView>

      <BottomAction surfaceColor={feedback ? feedbackSurface[feedback] : undefined}>
        {feedback ? (
          <FeedbackPanel
            detail={exercise.explanation}
            kind={feedback}
            title={isCorrect ? 'Doğru!' : exercise.wrongTitle}
          />
        ) : null}

        <AppButton
          disabled={selectedId === null}
          label={checked ? 'DEVAM ET' : 'KONTROL ET'}
          onPress={() => (checked ? onAdvance() : setChecked(true))}
          testID="mc-action"
          variant={checked ? (isCorrect ? 'success' : 'danger') : 'primary'}
        />
      </BottomAction>
    </>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: theme.spacing.xl,
    paddingBottom: theme.spacing.xl,
    paddingHorizontal: theme.spacing.xl,
  },
  options: {
    gap: theme.spacing.md,
  },
  scroll: {
    flex: 1,
  },
});
