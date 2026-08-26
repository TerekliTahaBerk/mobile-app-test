import { StyleSheet, View } from 'react-native';

import { theme } from '@/shared/ui/theme/tokens';

export type TraceMarkSize = 'lg' | 'md' | 'sm' | 'xs';

type TraceMarkProps = {
  size?: TraceMarkSize;
};

/**
 * The İz mark: a short trailing stroke that fades as it recedes. It stands in
 * for the habit the learner is building and replaces any generic flame or
 * "streak" iconography.
 *
 * Always decorative — the surrounding copy carries the meaning.
 */
export function TraceMark({ size = 'sm' }: TraceMarkProps) {
  const { gap, height, widths } = sizes[size];

  return (
    <View importantForAccessibility="no-hide-descendants" style={[styles.row, { gap }]}>
      {widths.map((width, index) => (
        <View
          key={`${size}-${index}`}
          style={{
            backgroundColor: tones[index] ?? theme.colors.trace.faint,
            borderRadius: theme.radii.xs,
            height,
            width,
          }}
        />
      ))}
    </View>
  );
}

const tones = [
  theme.colors.trace.strong,
  theme.colors.trace.mid,
  theme.colors.trace.soft,
  theme.colors.trace.faint,
];

const sizes = {
  lg: { gap: 8, height: 8, widths: [44, 30, 16] },
  md: { gap: 7, height: 6, widths: [28, 19, 11] },
  sm: { gap: 4, height: 6, widths: [14, 9, 5] },
  xs: { gap: 2, height: 5, widths: [11, 7, 4] },
} as const satisfies Record<TraceMarkSize, { gap: number; height: number; widths: readonly number[] }>;

const styles = StyleSheet.create({
  row: {
    alignItems: 'center',
    flexDirection: 'row',
  },
});
