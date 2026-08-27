import { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import type { MatchingExercise as MatchingDefinition } from '@/modules/curriculum/domain/content-types';
import type { ExerciseViewProps } from '@/modules/learning/ui/exercise-view';
import { AppButton } from '@/shared/ui/components/app-button';
import { AppText } from '@/shared/ui/components/app-text';
import { BottomAction } from '@/shared/ui/components/bottom-action';
import { SubjectTag } from '@/shared/ui/components/subject-tag';
import { TactilePressable } from '@/shared/ui/components/tactile-pressable';
import { Shake } from '@/shared/ui/motion/motion';
import { theme } from '@/shared/ui/theme/tokens';

type MatchTone = 'idle' | 'paired' | 'selected' | 'wrong';

/**
 * Design screen 06. Pick a term on the left, then its meaning on the right.
 * Pairing is resolved locally so a wrong tap can shake and clear without
 * spending an attempt; the finished board is what the engine evaluates.
 */
export function MatchingExercise({
  evaluation,
  exercise,
  onContinue,
  onSubmit,
  subject,
}: ExerciseViewProps<MatchingDefinition>) {
  const [pairedIds, setPairedIds] = useState<readonly string[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [wrongId, setWrongId] = useState<string | null>(null);
  const [wrongAttempts, setWrongAttempts] = useState(0);

  /** Sorted so the right column never sits pre-aligned with the left. */
  const rightLabels = useMemo(
    () => exercise.pairs.map((pair) => pair.right).slice().sort((a, b) => a.localeCompare(b, 'tr')),
    [exercise.pairs],
  );

  const checked = evaluation !== null;
  const pairedLabels = exercise.pairs
    .filter((pair) => pairedIds.includes(pair.id))
    .map((pair) => pair.right);
  const allMatched = pairedIds.length === exercise.pairs.length;
  const progress = `${pairedIds.length}/${exercise.pairs.length} eşleşti · ${exercise.subtitle}`;

  const pickRight = (label: string) => {
    if (selectedId === null || pairedLabels.includes(label)) {
      return;
    }

    const selected = exercise.pairs.find((pair) => pair.id === selectedId);
    if (selected?.right === label) {
      setPairedIds((ids) => [...ids, selected.id]);
      setSelectedId(null);
      setWrongId(null);
      return;
    }

    setWrongId(selectedId);
    setWrongAttempts((count) => count + 1);
    setSelectedId(null);
  };

  const reshuffle = () => {
    setPairedIds([]);
    setSelectedId(null);
    setWrongId(null);
    setWrongAttempts(0);
  };

  return (
    <>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        style={styles.scroll}
      >
        <SubjectTag label={exercise.tag} subject={subject} />

        <View style={styles.heading}>
          <AppText accessibilityRole="header" variant="headingM">
            {exercise.title}
          </AppText>
          <AppText accessibilityLiveRegion="polite" color="muted" variant="bodyS">
            {progress}
          </AppText>
        </View>

        <View style={styles.board}>
          <View style={styles.column}>
            {exercise.pairs.map((pair) => {
              const paired = pairedIds.includes(pair.id);
              const tone: MatchTone = paired
                ? 'paired'
                : wrongId === pair.id
                  ? 'wrong'
                  : selectedId === pair.id
                    ? 'selected'
                    : 'idle';

              return (
                <Shake key={pair.id} trigger={tone === 'wrong' ? wrongAttempts : 0}>
                  <MatchTile
                    disabled={paired || checked}
                    label={pair.left}
                    onPress={() => {
                      setSelectedId(pair.id);
                      setWrongId(null);
                    }}
                    stateLabel={matchStateLabels[tone]}
                    testID={`match-left-${pair.id}`}
                    tone={tone}
                  />
                </Shake>
              );
            })}
          </View>

          <View style={styles.column}>
            {rightLabels.map((label) => {
              const paired = pairedLabels.includes(label);

              return (
                <MatchTile
                  compact
                  disabled={paired || checked}
                  key={label}
                  label={label}
                  onPress={() => pickRight(label)}
                  stateLabel={paired ? matchStateLabels.paired : undefined}
                  testID={`match-right-${label}`}
                  tone={paired ? 'paired' : 'idle'}
                />
              );
            })}
          </View>
        </View>
      </ScrollView>

      <BottomAction surfaceColor={checked ? theme.colors.status.successSurface : undefined}>
        {checked ? (
          <View accessible accessibilityLiveRegion="polite" style={styles.doneRow}>
            <View style={styles.doneBadge}>
              <AppText color="inverse" variant="labelM">
                ✓
              </AppText>
            </View>
            <AppText color="success" variant="headingS">
              Dördü dörtlük!
            </AppText>
          </View>
        ) : null}

        <AppButton
          disabled={!allMatched && !checked}
          label={checked ? 'DEVAM ET' : 'KONTROL ET'}
          onPress={() => {
            if (checked) {
              onContinue();
              return;
            }
            onSubmit({
              kind: 'matching',
              pairs: Object.fromEntries(
                exercise.pairs
                  .filter((pair) => pairedIds.includes(pair.id))
                  .map((pair) => [pair.id, pair.right]),
              ),
            });
          }}
          testID="matching-action"
          variant={checked ? 'success' : 'primary'}
        />

        {allMatched || checked ? null : (
          <AppButton
            label="TEKRAR KARIŞTIR"
            onPress={reshuffle}
            testID="matching-reshuffle"
            variant="ghost"
          />
        )}
      </BottomAction>
    </>
  );
}

type MatchTileProps = {
  compact?: boolean;
  disabled: boolean;
  label: string;
  onPress: () => void;
  stateLabel?: string | undefined;
  testID: string;
  tone: MatchTone;
};

function MatchTile({
  compact = false,
  disabled,
  label,
  onPress,
  stateLabel,
  testID,
  tone,
}: MatchTileProps) {
  const visual = tileTones[tone];

  return (
    <TactilePressable
      accessibilityLabel={[label, stateLabel].filter(Boolean).join('. ')}
      accessibilityRole="button"
      accessibilityState={{ disabled, selected: tone === 'selected' }}
      depth={0}
      depthColor="transparent"
      disabled={disabled}
      faceStyle={[
        styles.tileFace,
        compact && styles.tileFaceCompact,
        { backgroundColor: visual.surface, borderColor: visual.border },
      ]}
      onPress={onPress}
      testID={testID}
    >
      <AppText align={compact ? 'center' : 'left'} style={{ color: visual.text }} variant="labelS">
        {label}
      </AppText>
    </TactilePressable>
  );
}

const matchStateLabels: Record<MatchTone, string | undefined> = {
  idle: undefined,
  paired: 'Eşleşti',
  selected: 'Seçili',
  wrong: 'Eşleşmedi',
};

const tileTones: Record<MatchTone, { border: string; surface: string; text: string }> = {
  idle: {
    border: theme.colors.border.subtle,
    surface: theme.colors.surface.default,
    text: theme.colors.text.body,
  },
  paired: {
    border: theme.colors.subject.history.primary,
    surface: theme.colors.subject.history.soft,
    text: theme.colors.subject.history.ink,
  },
  selected: {
    border: theme.colors.action.primary,
    surface: theme.colors.action.primaryTint,
    text: theme.colors.text.body,
  },
  wrong: {
    border: theme.colors.status.dangerBorder,
    surface: theme.colors.status.dangerSoft,
    text: theme.colors.text.body,
  },
};

const styles = StyleSheet.create({
  board: {
    flexDirection: 'row',
    gap: theme.spacing.xl + 1,
  },
  column: {
    flex: 1,
    gap: theme.spacing.md + 2,
  },
  content: {
    gap: theme.spacing.lg,
    paddingBottom: theme.spacing.xl,
    paddingHorizontal: theme.spacing.xl,
  },
  doneBadge: {
    alignItems: 'center',
    backgroundColor: theme.colors.status.success,
    borderRadius: theme.radii.pill,
    height: 34,
    justifyContent: 'center',
    width: 34,
  },
  doneRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: theme.spacing.md - 1,
  },
  heading: {
    gap: theme.spacing.xs + 2,
  },
  scroll: {
    flex: 1,
  },
  tileFace: {
    borderBottomWidth: theme.depth.cardBorder,
    borderWidth: 2,
    justifyContent: 'center',
    minHeight: 66,
    paddingHorizontal: theme.spacing.md + 1,
  },
  tileFaceCompact: {
    alignItems: 'center',
  },
});
