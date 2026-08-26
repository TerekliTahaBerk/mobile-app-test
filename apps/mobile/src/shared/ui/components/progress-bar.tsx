import { StyleSheet, View } from 'react-native';

import { theme } from '@/shared/ui/theme/tokens';

type ProgressBarProps = {
  accessibilityLabel: string;
  value: number;
};

/**
 * Displays normalized progress. `value` is clamped to the inclusive 0–1 range.
 * Pair the bar with visible text so progress is never communicated by color alone.
 */
export function ProgressBar({ accessibilityLabel, value }: ProgressBarProps) {
  const normalizedValue = Math.min(1, Math.max(0, value));
  const percentage = Math.round(normalizedValue * 100);

  return (
    <View
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="progressbar"
      accessibilityValue={{ max: 100, min: 0, now: percentage, text: `${percentage}%` }}
      style={styles.track}
    >
      <View style={[styles.fill, { width: `${percentage}%` }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  fill: {
    backgroundColor: theme.colors.progress.fill,
    borderRadius: theme.radii.pill,
    height: '100%',
  },
  track: {
    backgroundColor: theme.colors.progress.track,
    borderRadius: theme.radii.pill,
    height: 10,
    overflow: 'hidden',
    width: '100%',
  },
});
