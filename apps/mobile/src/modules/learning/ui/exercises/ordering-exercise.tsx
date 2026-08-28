import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import type { OrderingExercise as Exercise } from '@/modules/curriculum/domain/content-types';
import type { ExerciseViewProps } from '@/modules/learning/ui/exercise-view';
import { AppButton } from '@/shared/ui/components/app-button';
import { AppText } from '@/shared/ui/components/app-text';
import { BottomAction } from '@/shared/ui/components/bottom-action';
import { DragHandleIcon } from '@/shared/ui/components/icons';
import { theme } from '@/shared/ui/theme/tokens';

/**
 * Chronological ordering. The design draws this as a drag, but tapping to place
 * and tapping to take back is the same interaction without the precision cost —
 * it works one-handed, it works with a screen reader, and nothing can be
 * dropped into a place the learner did not mean.
 */
export function OrderingExercise({ evaluation, exercise, onSubmit }: ExerciseViewProps<Exercise>) {
  const [placed, setPlaced] = useState<readonly string[]>([]);
  const checked = evaluation !== null;

  const labelOf = (id: string) => exercise.items.find((item) => item.id === id)?.label ?? '';
  const remaining = exercise.items.filter((item) => !placed.includes(item.id));
  const isComplete = placed.length === exercise.items.length;

  return (
    <>
      <View style={styles.body}>
        <AppText accessibilityRole="header" variant="question">
          {exercise.prompt}
        </AppText>
        <AppText color="secondary" style={styles.hint} variant="proseS">
          Sırayla dokun; son eklediğini geri almak için ona dokun.
        </AppText>

        <View style={styles.slots}>
          {exercise.items.map((_item, index) => {
            const id = placed[index];
            const isNext = index === placed.length;

            if (id === undefined) {
              return (
                <View key={`slot-${index}`} style={[styles.slot, styles.slotEmpty]}>
                  <View style={styles.slotIndexEmpty}>
                    <AppText color="muted" variant="labelS">
                      {index + 1}
                    </AppText>
                  </View>
                  <AppText color="muted" style={styles.slotLabel} variant="bodyS">
                    {isNext ? 'buraya yerleştir' : 'boş'}
                  </AppText>
                </View>
              );
            }

            return (
              <Pressable
                accessibilityLabel={`${index + 1}. sıra: ${labelOf(id)}`}
                accessibilityRole="button"
                disabled={checked || index !== placed.length - 1}
                key={`slot-${index}`}
                onPress={() => setPlaced((current) => current.slice(0, -1))}
                style={[styles.slot, styles.slotFilled]}
              >
                <View style={styles.slotIndex}>
                  <AppText color="inverse" variant="labelS">
                    {index + 1}
                  </AppText>
                </View>
                <AppText color="success" style={styles.slotLabel} variant="bodyL">
                  {labelOf(id)}
                </AppText>
                <DragHandleIcon />
              </Pressable>
            );
          })}
        </View>

        {remaining.length === 0 ? null : (
          <>
            <AppText color="muted" style={styles.bankLabel} variant="eyebrow">
              SEÇENEKLER
            </AppText>
            <View style={styles.bank}>
              {remaining.map((item) => (
                <Pressable
                  accessibilityLabel={item.label}
                  accessibilityRole="button"
                  disabled={checked}
                  key={item.id}
                  onPress={() => setPlaced((current) => [...current, item.id])}
                  style={styles.chip}
                  testID={`order-item-${item.id}`}
                >
                  <AppText variant="bodyL">{item.label}</AppText>
                </Pressable>
              ))}
            </View>
          </>
        )}
      </View>

      {checked ? null : (
        <BottomAction>
          <AppButton
            disabled={!isComplete}
            label="Kontrol Et"
            onPress={() => onSubmit({ itemIds: placed, kind: 'ordering' })}
            testID="check-answer"
          />
        </BottomAction>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  bank: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm + 2,
    marginTop: theme.spacing.md + 1,
  },
  bankLabel: {
    marginTop: theme.spacing.xxl,
  },
  body: {
    flex: 1,
    paddingHorizontal: theme.spacing.xl,
    paddingTop: theme.spacing.sm,
  },
  chip: {
    backgroundColor: theme.colors.surface.default,
    borderBottomWidth: theme.depth.cardBorder,
    borderColor: theme.colors.border.subtle,
    borderRadius: theme.radii.medium,
    borderWidth: 2,
    paddingHorizontal: theme.spacing.lg + 2,
    paddingVertical: theme.spacing.lg,
  },
  hint: {
    marginTop: 5,
  },
  slot: {
    alignItems: 'center',
    borderRadius: theme.radii.large,
    borderWidth: 2,
    flexDirection: 'row',
    gap: theme.spacing.lg,
    padding: theme.spacing.md + 5,
  },
  slotEmpty: {
    backgroundColor: theme.colors.surface.recessedSoft,
    borderColor: theme.colors.border.dashed,
    borderStyle: 'dashed',
  },
  slotFilled: {
    backgroundColor: theme.colors.surface.soft,
    borderColor: theme.colors.action.primary,
  },
  slotIndex: {
    alignItems: 'center',
    backgroundColor: theme.colors.action.primary,
    borderRadius: theme.radii.pill,
    height: 30,
    justifyContent: 'center',
    width: 30,
  },
  slotIndexEmpty: {
    alignItems: 'center',
    borderColor: theme.colors.border.dashed,
    borderRadius: theme.radii.pill,
    borderWidth: 2,
    height: 30,
    justifyContent: 'center',
    width: 30,
  },
  slotLabel: {
    flex: 1,
  },
  slots: {
    gap: theme.spacing.md + 1,
    marginTop: theme.spacing.xxl + 2,
  },
});
