import { StyleSheet, View } from 'react-native';

import { theme } from '@/shared/ui/theme/tokens';

type ProgressBarProps = {
  accessibilityLabel: string;
  fillColor?: string | undefined;
  trackColor?: string | undefined;
  value: number;
};

/**
 * Displays normalized progress. `value` is clamped to the inclusive 0–1 range.
 * Pair the bar with visible text so progress is never communicated by color
 * alone. The inner gloss reproduces the design's inset highlight.
 */
export function ProgressBar({
  accessibilityLabel,
  fillColor = theme.colors.progress.fill,
  trackColor = theme.colors.progress.track,
  value,
}: ProgressBarProps) {
  const normalizedValue = Math.min(1, Math.max(0, value));
  const percentage = Math.round(normalizedValue * 100);

  return (
    <View
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="progressbar"
      accessibilityValue={{ max: 100, min: 0, now: percentage, text: `${percentage}%` }}
      style={[styles.track, { backgroundColor: trackColor }]}
    >
      <View style={[styles.fill, { backgroundColor: fillColor, width: `${percentage}%` }]}>
        {percentage > 6 ? <View style={styles.gloss} /> : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  fill: {
    borderRadius: theme.radii.pill,
    height: '100%',
    overflow: 'hidden',
  },
  gloss: {
    backgroundColor: theme.colors.progress.gloss,
    height: 4,
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
  },
  track: {
    borderRadius: theme.radii.pill,
    height: 16,
    overflow: 'hidden',
    width: '100%',
  },
});
