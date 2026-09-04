import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import type { MatchingExercise as Exercise } from '@/modules/curriculum/domain/content-types';
import type { ExerciseViewProps } from '@/modules/learning/ui/exercise-view';
import { AppButton } from '@/shared/ui/components/app-button';
import { AppText } from '@/shared/ui/components/app-text';
import { BottomAction } from '@/shared/ui/components/bottom-action';
import { ProgressBar } from '@/shared/ui/components/progress-bar';
import { Shake } from '@/shared/ui/motion/motion';
import { theme } from '@/shared/ui/theme/tokens';

type Tile = {
  key: string;
  /** The pair this tile belongs to. Two tiles share it when they match. */
  pairId: string;
  label: string;
  side: 'left' | 'right';
};

/**
 * Concept matching. The learner picks one tile from each column; a correct
 * pair settles into a resolved state and a wrong one shakes and clears, so a
 * mistake costs a moment rather than a heart.
 */
export function MatchingExercise({ evaluation, exercise, onSubmit }: ExerciseViewProps<Exercise>) {
  const [tiles] = useState<readonly Tile[]>(() => buildTiles(exercise));
  const [resolved, setResolved] = useState<readonly string[]>([]);
  const [selected, setSelected] = useState<Tile | null>(null);
  const [misses, setMisses] = useState(0);
  const checked = evaluation !== null;

  const total = exercise.pairs.length;
  const isComplete = resolved.length === total;

  const choose = (tile: Tile) => {
    if (resolved.includes(tile.pairId)) {
      return;
    }
    if (selected === null) {
      setSelected(tile);
      return;
    }
    if (selected.key === tile.key) {
      setSelected(null);
      return;
    }
    if (selected.side === tile.side) {
      setSelected(tile);
      return;
    }

    if (selected.pairId === tile.pairId) {
      setResolved((current) => [...current, tile.pairId]);
    } else {
      setMisses((count) => count + 1);
    }
    setSelected(null);
  };

  return (
    <>
      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        <AppText accessibilityRole="header" variant="question">
          {exercise.title}
        </AppText>
        <AppText color="secondary" style={styles.subtitle} variant="proseS">
          {exercise.subtitle}
        </AppText>

        <Shake style={styles.grid} trigger={misses}>
          {tiles.map((tile) => {
            const isResolved = resolved.includes(tile.pairId);
            const isSelected = selected?.key === tile.key;

            return (
              <Pressable
                accessibilityLabel={
                  isResolved ? `${tile.label}, eşleşti` : tile.label
                }
                accessibilityRole="button"
                accessibilityState={{ disabled: isResolved, selected: isSelected }}
                disabled={isResolved || checked}
                key={tile.key}
                onPress={() => choose(tile)}
                style={[
                  styles.tile,
                  isResolved ? styles.tileResolved : null,
                  isSelected ? styles.tileSelected : null,
                ]}
                testID={`match-${tile.key}`}
              >
                <AppText
                  align="center"
                  color={isResolved ? 'faint' : isSelected ? 'success' : 'primary'}
                  variant="bodyM"
                >
                  {isResolved ? `${tile.label} ✓` : tile.label}
                </AppText>
              </Pressable>
            );
          })}
        </Shake>

        <View style={styles.meterRow}>
          <View style={styles.meter}>
            <ProgressBar
              accessibilityLabel="Eşleşme ilerlemesi"
              height={6}
              value={total === 0 ? 0 : resolved.length / total}
            />
          </View>
          <AppText color="secondary" variant="mono">
            {resolved.length} / {total} eşleşti
          </AppText>
        </View>
      </ScrollView>

      {checked ? null : (
        <BottomAction>
          <AppButton
            disabled={!isComplete}
            label={isComplete ? 'Kontrol Et' : 'İki kart seç'}
            onPress={() =>
              onSubmit({
                kind: 'matching',
                pairs: Object.fromEntries(
                  exercise.pairs.map((pair) => [pair.id, pair.right]),
                ),
              })
            }
            testID="check-answer"
          />
        </BottomAction>
      )}
    </>
  );
}

/**
 * Interleaves the two columns so a pair never sits side by side, which would
 * give the answer away before the learner has read it.
 */
function buildTiles(exercise: Exercise): readonly Tile[] {
  const lefts = exercise.pairs.map((pair) => ({
    key: `${pair.id}-left`,
    label: pair.left,
    pairId: pair.id,
    side: 'left' as const,
  }));
  const rights = exercise.pairs.map((pair) => ({
    key: `${pair.id}-right`,
    label: pair.right,
    pairId: pair.id,
    side: 'right' as const,
  }));

  const rotated = [...rights.slice(1), ...rights.slice(0, 1)];

  return lefts.flatMap((left, index) => {
    const right = rotated[index];

    return right === undefined ? [left] : [left, right];
  });
}

const styles = StyleSheet.create({
  body: {
    flexGrow: 1,
    paddingBottom: theme.spacing.xxl,
    paddingHorizontal: theme.spacing.xl,
    paddingTop: theme.spacing.sm,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.md + 1,
    marginTop: theme.spacing.xxl,
  },
  meter: {
    flex: 1,
  },
  meterRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: theme.spacing.md - 1,
    marginTop: theme.spacing.xxl,
  },
  subtitle: {
    marginTop: 5,
  },
  tile: {
    alignItems: 'center',
    backgroundColor: theme.colors.surface.default,
    borderBottomWidth: theme.depth.cardBorder,
    borderColor: theme.colors.border.subtle,
    borderRadius: theme.radii.large,
    borderWidth: 2,
    flexBasis: '47%',
    flexGrow: 1,
    justifyContent: 'center',
    minHeight: 64,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.lg + 4,
  },
  tileResolved: {
    backgroundColor: theme.colors.surface.recessedSoft,
    borderBottomWidth: 2,
    borderColor: theme.colors.border.dashed,
    borderStyle: 'dashed',
  },
  tileSelected: {
    backgroundColor: theme.colors.surface.soft,
    borderColor: theme.colors.action.primary,
  },
});
