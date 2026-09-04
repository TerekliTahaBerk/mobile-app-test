import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import type { FillBlankExercise as Exercise } from '@/modules/curriculum/domain/content-types';
import type { ExerciseViewProps } from '@/modules/learning/ui/exercise-view';
import { AppButton } from '@/shared/ui/components/app-button';
import { AppText } from '@/shared/ui/components/app-text';
import { BottomAction } from '@/shared/ui/components/bottom-action';
import { theme } from '@/shared/ui/theme/tokens';

/**
 * The word bank. The learner builds the sentence by tapping tokens in order and
 * takes the last one back by tapping it again, so there is no drag target to
 * miss and no way to end up in a state they cannot undo.
 */
export function FillBlankExercise({ evaluation, exercise, onSubmit }: ExerciseViewProps<Exercise>) {
  const [picked, setPicked] = useState<readonly string[]>([]);
  const checked = evaluation !== null;

  const labelOf = (id: string) => exercise.bank.find((token) => token.id === id)?.label ?? '';
  const sentence = picked.map(labelOf).join(' ');

  return (
    <>
      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        <AppText color="muted" variant="mono">
          boşluk doldur
        </AppText>
        <AppText
          accessibilityRole="header"
          color={checked ? 'secondary' : 'primary'}
          style={styles.title}
          variant="questionS"
        >
          {exercise.title}
        </AppText>
        <AppText color="secondary" style={styles.hint} variant="proseS">
          {exercise.hint}
        </AppText>

        <View
          accessibilityLabel={sentence === '' ? 'Cümle boş' : sentence}
          accessibilityRole="text"
          style={styles.answerRow}
        >
          {picked.length === 0 ? (
            <AppText color="faint" variant="bodyL">
              Kelimeleri seç
            </AppText>
          ) : (
            picked.map((id, index) => (
              <Pressable
                accessibilityLabel={`${labelOf(id)} kelimesini geri al`}
                accessibilityRole="button"
                disabled={checked || index !== picked.length - 1}
                key={`${id}-${index}`}
                onPress={() => setPicked((current) => current.slice(0, -1))}
                style={[styles.token, styles.tokenPicked]}
              >
                <AppText color="success" variant="bodyL">
                  {labelOf(id)}
                </AppText>
              </Pressable>
            ))
          )}
        </View>

        <View style={styles.bank}>
          {exercise.bank.map((token) => {
            const used = picked.includes(token.id);

            return (
              <Pressable
                accessibilityLabel={token.label}
                accessibilityRole="button"
                accessibilityState={{ disabled: used || checked }}
                disabled={used || checked}
                key={token.id}
                onPress={() => setPicked((current) => [...current, token.id])}
                style={[styles.token, used ? styles.tokenUsed : null]}
                testID={`token-${token.id}`}
              >
                <AppText color={used ? 'faint' : 'primary'} variant="bodyL">
                  {token.label}
                </AppText>
              </Pressable>
            );
          })}
        </View>
      </ScrollView>

      {checked ? null : (
        <BottomAction>
          <AppButton
            disabled={picked.length === 0}
            label="Kontrol Et"
            onPress={() => onSubmit({ kind: 'fillBlank', tokenIds: picked })}
            testID="check-answer"
          />
        </BottomAction>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  answerRow: {
    alignItems: 'center',
    borderBottomColor: theme.colors.border.subtle,
    borderBottomWidth: 3,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
    marginTop: theme.spacing.xxl,
    minHeight: 62,
    paddingBottom: theme.spacing.md,
  },
  bank: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm + 2,
    marginTop: theme.spacing.xxl,
  },
  body: {
    flexGrow: 1,
    paddingBottom: theme.spacing.xxl,
    paddingHorizontal: theme.spacing.xl,
    paddingTop: theme.spacing.sm,
  },
  hint: {
    marginTop: theme.spacing.xs + 1,
  },
  title: {
    marginTop: theme.spacing.md,
  },
  token: {
    backgroundColor: theme.colors.surface.default,
    borderColor: theme.colors.border.subtle,
    borderBottomWidth: theme.depth.cardBorder,
    borderRadius: theme.radii.small + 2,
    borderWidth: 2,
    paddingHorizontal: theme.spacing.lg + 2,
    paddingVertical: theme.spacing.md + 1,
  },
  tokenPicked: {
    backgroundColor: theme.colors.surface.soft,
    borderColor: theme.colors.action.primary,
  },
  tokenUsed: {
    backgroundColor: theme.colors.surface.recessed,
    borderBottomWidth: 2,
    borderColor: theme.colors.border.hairline,
  },
});
