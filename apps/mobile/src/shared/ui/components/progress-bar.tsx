import { StyleSheet, View } from 'react-native';

import { theme } from '@/shared/ui/theme/tokens';

type ProgressBarProps = {
  accessibilityLabel: string;
  fillColor?: string | undefined;
  /**
   * A lighter segment drawn immediately after the fill, showing what the
   * session just added. Used by the completion screen's unit meter.
   */
  gainValue?: number | undefined;
  gainColor?: string | undefined;
  height?: number | undefined;
  trackColor?: string | undefined;
  value: number;
};

/**
 * Displays normalized progress. `value` is clamped to the inclusive 0–1 range.
 * Pair the bar with visible text so progress is never communicated by colour
 * alone.
 */
export function ProgressBar({
  accessibilityLabel,
  fillColor = theme.colors.progress.fill,
  gainColor = theme.colors.progress.gain,
  gainValue = 0,
  height = 7,
  trackColor = theme.colors.progress.track,
  value,
}: ProgressBarProps) {
  const normalizedValue = Math.min(1, Math.max(0, value));
  const percentage = Math.round(normalizedValue * 100);
  const gainPercentage = Math.round(Math.min(1 - normalizedValue, Math.max(0, gainValue)) * 100);

  return (
    <View
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="progressbar"
      accessibilityValue={{
        max: 100,
        min: 0,
        now: percentage + gainPercentage,
        text: `%${percentage + gainPercentage}`,
      }}
      style={[styles.track, { backgroundColor: trackColor, height }]}
    >
      <View style={[styles.fill, { backgroundColor: fillColor, width: `${percentage}%` }]} />
      {gainPercentage > 0 ? (
        <View style={[styles.fill, { backgroundColor: gainColor, width: `${gainPercentage}%` }]} />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  fill: {
    height: '100%',
  },
  track: {
    borderRadius: theme.radii.pill,
    flexDirection: 'row',
    overflow: 'hidden',
    width: '100%',
  },
});
