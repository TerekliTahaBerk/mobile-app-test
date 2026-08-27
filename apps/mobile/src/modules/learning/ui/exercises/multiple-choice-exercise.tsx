import { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import type { MultipleChoiceExercise as MultipleChoiceDefinition } from '@/modules/curriculum/domain/content-types';
import type { ExerciseViewProps } from '@/modules/learning/ui/exercise-view';
import { AnswerCard, type AnswerTone } from '@/modules/learning/ui/answer-card';
import { FeedbackPanel, feedbackSurface } from '@/modules/learning/ui/feedback-panel';
import { AppButton } from '@/shared/ui/components/app-button';
import { AppText } from '@/shared/ui/components/app-text';
import { BottomAction } from '@/shared/ui/components/bottom-action';
import { SubjectTag } from '@/shared/ui/components/subject-tag';
import { CizgiSpeech } from '@/shared/ui/cizgi/cizgi-speech';
import { theme } from '@/shared/ui/theme/tokens';

/** A/B/C/D markers are presentation, not content. */
const MARKERS = ['A', 'B', 'C', 'D', 'E'] as const;

/**
 * Design screen 04. Selecting arms the CTA; checking hands the answer to the
 * lesson engine and renders the verdict it returns.
 */
export function MultipleChoiceExercise({
  evaluation,
  exercise,
  onContinue,
  onSubmit,
  subject,
}: ExerciseViewProps<MultipleChoiceDefinition>) {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const checked = evaluation !== null;
  const isCorrect = evaluation?.correct === true;
  const feedback = checked ? (isCorrect ? 'correct' : 'wrong') : null;

  const toneFor = (optionId: string): AnswerTone => {
    if (!checked) {
      return optionId === selectedId ? 'selected' : 'idle';
    }
    if (optionId === exercise.correctOptionId) {
      return 'correct';
    }

    return optionId === selectedId ? 'wrong' : 'idle';
  };

  const stateLabelFor = (optionId: string) => {
    if (!checked) {
      return optionId === selectedId ? 'Seçili' : undefined;
    }
    if (optionId === exercise.correctOptionId) {
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
        <SubjectTag label={exercise.tag} subject={subject} />

        <CizgiSpeech mood="thinking" width={74}>
          <AppText accessibilityRole="header" variant="headingS">
            {exercise.prompt}
          </AppText>
        </CizgiSpeech>

        <View style={styles.options}>
          {exercise.options.map((option, index) => (
            <AnswerCard
              disabled={checked}
              key={option.id}
              label={option.label}
              marker={MARKERS[index] ?? `${index + 1}`}
              onPress={() => setSelectedId(option.id)}
              stateLabel={stateLabelFor(option.id)}
              testID={`mc-option-${MARKERS[index] ?? index}`}
              tone={toneFor(option.id)}
            />
          ))}
        </View>
      </ScrollView>

      <BottomAction surfaceColor={feedback ? feedbackSurface[feedback] : undefined}>
        {feedback ? (
          <FeedbackPanel
            detail={exercise.explanation}
            kind={feedback}
            title={isCorrect ? 'Doğru!' : `Doğrusu: ${evaluation?.correctAnswerSummary ?? ''}`}
          />
        ) : null}

        <AppButton
          disabled={selectedId === null}
          label={checked ? 'DEVAM ET' : 'KONTROL ET'}
          onPress={() => {
            if (checked) {
              onContinue();
              return;
            }
            if (selectedId !== null) {
              onSubmit({ kind: 'multipleChoice', optionId: selectedId });
            }
          }}
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
