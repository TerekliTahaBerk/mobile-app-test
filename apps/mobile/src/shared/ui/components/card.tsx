import { StyleSheet, View, type ViewProps } from 'react-native';

import { theme } from '@/shared/ui/theme/tokens';

export type CardVariant = 'elevated' | 'outlined' | 'plain' | 'tactile';

type CardProps = ViewProps & {
  /** Overrides the outline colour for state-tinted cards (correct, wrong, selected). */
  borderColor?: string | undefined;
  surfaceColor?: string | undefined;
  variant?: CardVariant;
};

/**
 * The design's card language: a two-point outline, a warm surface, and — for
 * anything that reads as touchable — a thickened bottom edge that gives the
 * card physical weight without a shadow.
 */
export function Card({
  borderColor,
  style,
  surfaceColor,
  variant = 'outlined',
  ...viewProps
}: CardProps) {
  return (
    <View
      style={[
        styles.base,
        variantStyles[variant],
        borderColor ? { borderColor } : null,
        surfaceColor ? { backgroundColor: surfaceColor } : null,
        style,
      ]}
      {...viewProps}
    />
  );
}

const styles = StyleSheet.create({
  base: {
    backgroundColor: theme.colors.surface.default,
    borderRadius: theme.radii.large,
    padding: theme.spacing.lg,
  },
});

const variantStyles = StyleSheet.create({
  elevated: {
    ...theme.elevation.raised,
  },
  outlined: {
    borderColor: theme.colors.border.subtle,
    borderWidth: 2,
  },
  plain: {},
  tactile: {
    borderBottomWidth: theme.depth.cardBorder,
    borderColor: theme.colors.border.subtle,
    borderWidth: 2,
  },
});
