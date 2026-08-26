import { StyleSheet, View } from 'react-native';

import { AppText, type AppTextColor } from '@/shared/ui/components/app-text';
import { TactilePressable } from '@/shared/ui/components/tactile-pressable';
import { theme } from '@/shared/ui/theme/tokens';

export type AnswerTone = 'correct' | 'idle' | 'selected' | 'wrong';

type AnswerCardProps = {
  disabled?: boolean;
  /** The A/B/C/D key chip. Omitted for cards that carry only a label. */
  marker?: string | undefined;
  label: string;
  onPress: () => void;
  /** Spoken state so choice feedback is never colour-only. */
  stateLabel?: string | undefined;
  testID?: string | undefined;
  tone?: AnswerTone;
};

/**
 * A selectable answer. Its border and surface carry the state, and a spoken
 * state label carries the same information for screen-reader users.
 */
export function AnswerCard({
  disabled = false,
  label,
  marker,
  onPress,
  stateLabel,
  testID,
  tone = 'idle',
}: AnswerCardProps) {
  const visual = tones[tone];

  return (
    <TactilePressable
      accessibilityLabel={
        [marker ? `Seçenek ${marker}` : null, label, stateLabel].filter(Boolean).join('. ')
      }
      accessibilityRole="button"
      accessibilityState={{ disabled, selected: tone !== 'idle' }}
      depth={0}
      depthColor="transparent"
      disabled={disabled}
      faceStyle={[
        styles.face,
        { backgroundColor: visual.surface, borderColor: visual.border },
      ]}
      onPress={onPress}
      testID={testID}
    >
      <View style={styles.row}>
        {marker === undefined ? null : (
          <View style={[styles.marker, { borderColor: visual.border }]}>
            <AppText color={visual.markerColor} variant="labelS">
              {marker}
            </AppText>
          </View>
        )}
        <AppText color="body" style={styles.label} variant="bodyM">
          {label}
        </AppText>
      </View>
    </TactilePressable>
  );
}

type AnswerVisual = {
  border: string;
  markerColor: AppTextColor;
  surface: string;
};

const tones: Record<AnswerTone, AnswerVisual> = {
  correct: {
    border: theme.colors.status.success,
    markerColor: 'success',
    surface: theme.colors.status.successSoft,
  },
  idle: {
    border: theme.colors.border.subtle,
    markerColor: 'muted',
    surface: theme.colors.surface.default,
  },
  selected: {
    border: theme.colors.action.primary,
    markerColor: 'accent',
    surface: theme.colors.action.primaryTint,
  },
  wrong: {
    border: theme.colors.status.dangerBorder,
    markerColor: 'danger',
    surface: theme.colors.status.dangerSoft,
  },
};

const styles = StyleSheet.create({
  face: {
    borderBottomWidth: theme.depth.cardBorder,
    borderWidth: 2,
    minHeight: theme.hitTarget + 20,
    padding: theme.spacing.lg,
  },
  label: {
    flex: 1,
  },
  marker: {
    alignItems: 'center',
    borderRadius: theme.radii.xs,
    borderWidth: 2,
    height: 30,
    justifyContent: 'center',
    width: 30,
  },
  row: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: theme.spacing.md + 2,
  },
});
