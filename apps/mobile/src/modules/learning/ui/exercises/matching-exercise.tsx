import { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import type { MatchingPreview } from '@/modules/learning/model/lesson-preview-data';
import { AppButton } from '@/shared/ui/components/app-button';
import { AppText } from '@/shared/ui/components/app-text';
import { BottomAction } from '@/shared/ui/components/bottom-action';
import { SubjectTag } from '@/shared/ui/components/subject-tag';
import { TactilePressable } from '@/shared/ui/components/tactile-pressable';
import { theme } from '@/shared/ui/theme/tokens';

type MatchingExerciseProps = {
  exercise: MatchingPreview;
  onAdvance: () => void;
};

type MatchTone = 'idle' | 'paired' | 'selected' | 'wrong';

/**
 * Design screen 06. Pick an event on the left, then its year on the right.
 * A wrong pairing simply clears; matching is a low-stakes drill, so it costs
 * nothing.
 */
export function MatchingExercise({ exercise, onAdvance }: MatchingExerciseProps) {
  const [selectedLeftId, setSelectedLeftId] = useState<string | null>(null);
  const [pairedLeftIds, setPairedLeftIds] = useState<readonly string[]>([]);
  const [wrongLeftId, setWrongLeftId] = useState<string | null>(null);

  const pairedRightIds = exercise.left
    .filter((item) => pairedLeftIds.includes(item.id))
    .map((item) => item.matchId);
  const allMatched = pairedLeftIds.length === exercise.left.length;
  const progress = `${pairedLeftIds.length}/${exercise.left.length} eşleşti · ${exercise.subtitle}`;

  const pickRight = (rightId: string) => {
    if (selectedLeftId === null || pairedRightIds.includes(rightId)) {
      return;
    }

    const selected = exercise.left.find((item) => item.id === selectedLeftId);
    if (selected?.matchId === rightId) {
      setPairedLeftIds((ids) => [...ids, selected.id]);
      setSelectedLeftId(null);
      setWrongLeftId(null);
      return;
    }

    setWrongLeftId(selectedLeftId);
    setSelectedLeftId(null);
  };

  const reshuffle = () => {
    setPairedLeftIds([]);
    setSelectedLeftId(null);
    setWrongLeftId(null);
  };

  return (
    <>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        style={styles.scroll}
      >
        <SubjectTag label={exercise.tag} subject={exercise.subject} />

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
            {exercise.left.map((item) => {
              const paired = pairedLeftIds.includes(item.id);
              const tone: MatchTone = paired
                ? 'paired'
                : wrongLeftId === item.id
                  ? 'wrong'
                  : selectedLeftId === item.id
                    ? 'selected'
                    : 'idle';

              return (
                <MatchTile
                  disabled={paired}
                  key={item.id}
                  label={item.label}
                  onPress={() => {
                    setSelectedLeftId(item.id);
                    setWrongLeftId(null);
                  }}
                  stateLabel={matchStateLabels[tone]}
                  testID={`match-left-${item.id}`}
                  tone={tone}
                />
              );
            })}
          </View>

          <View style={styles.column}>
            {exercise.right.map((item) => {
              const paired = pairedRightIds.includes(item.id);

              return (
                <MatchTile
                  compact
                  disabled={paired}
                  key={item.id}
                  label={item.label}
                  onPress={() => pickRight(item.id)}
                  stateLabel={paired ? matchStateLabels.paired : undefined}
                  testID={`match-right-${item.id}`}
                  tone={paired ? 'paired' : 'idle'}
                />
              );
            })}
          </View>
        </View>
      </ScrollView>

      <BottomAction surfaceColor={allMatched ? theme.colors.status.successSurface : undefined}>
        {allMatched ? (
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
          label={allMatched ? 'DEVAM ET' : 'TEKRAR KARIŞTIR'}
          onPress={() => {
            if (allMatched) {
              reshuffle();
              onAdvance();
              return;
            }
            reshuffle();
          }}
          testID="matching-action"
          variant={allMatched ? 'success' : 'primary'}
        />
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
      <AppText
        align={compact ? 'center' : 'left'}
        style={{ color: visual.text }}
        variant={compact ? 'headingM' : 'labelS'}
      >
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
