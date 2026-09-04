import { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import type { MultipleChoiceExercise as Exercise } from '@/modules/curriculum/domain/content-types';
import { AnswerCard, type AnswerCardState } from '@/modules/learning/ui/answer-card';
import type { ExerciseViewProps } from '@/modules/learning/ui/exercise-view';
import { AppButton } from '@/shared/ui/components/app-button';
import { AppText } from '@/shared/ui/components/app-text';
import { BottomAction } from '@/shared/ui/components/bottom-action';
import { EyebrowPill } from '@/shared/ui/components/eyebrow-pill';
import { theme } from '@/shared/ui/theme/tokens';

export function MultipleChoiceExercise({
  evaluation,
  exercise,
  onSubmit,
}: ExerciseViewProps<Exercise>) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const checked = evaluation !== null;

  return (
    <>
      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        <View style={styles.tagRow}>
          <EyebrowPill
            ink={theme.colors.subject.history.ink}
            label={exercise.tag}
            surface={theme.colors.subject.history.soft}
            uppercase={false}
          />
        </View>

        <AppText
          accessibilityRole="header"
          color={checked ? 'secondary' : 'primary'}
          style={styles.prompt}
          variant="question"
        >
          {exercise.prompt}
        </AppText>

        <View style={styles.options}>
          {exercise.options.map((option) => (
            <AnswerCard
              key={option.id}
              label={option.label}
              onPress={() => setSelectedId(option.id)}
              readOnly={checked}
              state={stateFor({
                checked,
                correctOptionId: exercise.correctOptionId,
                optionId: option.id,
                selectedId,
              })}
              testID={`option-${option.id}`}
            />
          ))}
        </View>
      </ScrollView>

      {checked ? null : (
        <BottomAction style={styles.action}>
          <AppButton
            disabled={selectedId === null}
            label="Kontrol Et"
            onPress={() => {
              if (selectedId !== null) {
                onSubmit({ kind: 'multipleChoice', optionId: selectedId });
              }
            }}
            testID="check-answer"
          />
        </BottomAction>
      )}
    </>
  );
}

function stateFor({
  checked,
  correctOptionId,
  optionId,
  selectedId,
}: {
  checked: boolean;
  correctOptionId: string;
  optionId: string;
  selectedId: string | null;
}): AnswerCardState {
  if (!checked) {
    return optionId === selectedId ? 'selected' : 'idle';
  }
  if (optionId === correctOptionId) {
    return 'correct';
  }

  return optionId === selectedId ? 'wrong' : 'muted';
}

const styles = StyleSheet.create({
  action: {
    borderTopColor: theme.colors.border.hairline,
    borderTopWidth: 1,
  },
  body: {
    flexGrow: 1,
    paddingBottom: theme.spacing.xxl,
    paddingHorizontal: theme.spacing.xl,
    paddingTop: theme.spacing.sm,
  },
  options: {
    gap: theme.spacing.md + 1,
    marginTop: theme.spacing.xxxl,
  },
  prompt: {
    marginTop: theme.spacing.lg + 4,
  },
  tagRow: {
    flexDirection: 'row',
  },
});
