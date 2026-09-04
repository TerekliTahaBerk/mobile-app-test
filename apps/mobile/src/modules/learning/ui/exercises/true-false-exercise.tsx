import { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import type { TrueFalseExercise as Exercise } from '@/modules/curriculum/domain/content-types';
import type { ExerciseViewProps } from '@/modules/learning/ui/exercise-view';
import { AppButton } from '@/shared/ui/components/app-button';
import { AppText } from '@/shared/ui/components/app-text';
import { BottomAction } from '@/shared/ui/components/bottom-action';
import { TactilePressable } from '@/shared/ui/components/tactile-pressable';
import { theme } from '@/shared/ui/theme/tokens';

const CHOICES = [
  { label: 'Doğru', value: true },
  { label: 'Yanlış', value: false },
] as const;

export function TrueFalseExercise({ evaluation, exercise, onSubmit }: ExerciseViewProps<Exercise>) {
  const [choice, setChoice] = useState<boolean | null>(null);
  const checked = evaluation !== null;

  return (
    <>
      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        <AppText color="muted" variant="mono">
          {exercise.tag.toLocaleLowerCase('tr-TR')} · doğru–yanlış
        </AppText>

        <AppText
          accessibilityRole="header"
          color={checked ? 'secondary' : 'primary'}
          style={styles.statement}
          variant="questionS"
        >
          {exercise.statement}
        </AppText>

        <View style={styles.choices}>
          {CHOICES.map((option) => {
            const tone = toneFor({
              checked,
              correctAnswer: exercise.correctAnswer,
              selected: choice,
              value: option.value,
            });

            return (
              <TactilePressable
                accessibilityLabel={option.label}
                accessibilityRole="radio"
                accessibilityState={{ selected: choice === option.value }}
                depth={theme.depth.cardBorder}
                depthColor={tone.depth}
                disabled={checked}
                key={option.label}
                onPress={() => setChoice(option.value)}
                style={styles.choice}
                testID={`truefalse-${option.value ? 'true' : 'false'}`}
              >
                <View style={[styles.choiceFace, tone.face]}>
                  <AppText align="center" style={{ color: tone.ink }} variant="bodyL">
                    {option.label}
                  </AppText>
                </View>
              </TactilePressable>
            );
          })}
        </View>
      </ScrollView>

      {checked ? null : (
        <BottomAction>
          <AppButton
            disabled={choice === null}
            label="Kontrol Et"
            onPress={() => {
              if (choice !== null) {
                onSubmit({ choice, kind: 'trueFalse' });
              }
            }}
            testID="check-answer"
          />
        </BottomAction>
      )}
    </>
  );
}

function toneFor({
  checked,
  correctAnswer,
  selected,
  value,
}: {
  checked: boolean;
  correctAnswer: boolean;
  selected: boolean | null;
  value: boolean;
}) {
  const isSelected = selected === value;

  if (!checked) {
    return isSelected
      ? {
          depth: theme.colors.action.primaryDepth,
          face: {
            backgroundColor: theme.colors.surface.soft,
            borderColor: theme.colors.action.primary,
          },
          ink: theme.colors.status.successInk,
        }
      : {
          depth: theme.colors.border.subtle,
          face: { borderColor: theme.colors.border.subtle },
          ink: theme.colors.text.primary,
        };
  }

  if (value === correctAnswer) {
    return {
      depth: theme.colors.action.primaryDepth,
      face: {
        backgroundColor: theme.colors.surface.soft,
        borderColor: theme.colors.action.primary,
      },
      ink: theme.colors.status.successInk,
    };
  }

  return isSelected
    ? {
        depth: theme.colors.status.dangerInk,
        face: {
          backgroundColor: theme.colors.status.dangerSoft,
          borderColor: theme.colors.status.danger,
        },
        ink: theme.colors.status.dangerInk,
      }
    : {
        depth: theme.colors.border.hairline,
        face: { borderColor: theme.colors.border.hairline },
        ink: theme.colors.text.faint,
      };
}

const styles = StyleSheet.create({
  body: {
    flexGrow: 1,
    paddingBottom: theme.spacing.xxl,
    paddingHorizontal: theme.spacing.xl,
    paddingTop: theme.spacing.sm,
  },
  choice: {
    flex: 1,
  },
  choiceFace: {
    backgroundColor: theme.colors.surface.default,
    borderRadius: theme.radii.large,
    borderWidth: 2,
    paddingVertical: theme.spacing.xxl,
  },
  choices: {
    flexDirection: 'row',
    gap: theme.spacing.md + 1,
    marginTop: theme.spacing.xxl + 2,
  },
  statement: {
    marginTop: theme.spacing.lg,
  },
});
