import { StyleSheet, View, type ViewProps } from 'react-native';

import { theme } from '@/shared/ui/theme/tokens';

export type CardVariant = 'outlined' | 'plain' | 'soft' | 'tactile';

type CardProps = ViewProps & {
  /** Overrides the outline colour for state-tinted cards (correct, wrong, selected). */
  borderColor?: string | undefined;
  surfaceColor?: string | undefined;
  variant?: CardVariant;
};

/**
 * The design's card language. Resting content sits in a hairline-outlined
 * white card; anything that reads as touchable gets a two-point outline and a
 * thickened bottom edge that gives it physical weight without a shadow.
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
  outlined: {
    borderColor: theme.colors.border.subtle,
    borderWidth: 1,
  },
  plain: {},
  soft: {
    backgroundColor: theme.colors.surface.soft,
  },
  tactile: {
    borderBottomWidth: theme.depth.cardBorder,
    borderColor: theme.colors.border.subtle,
    borderWidth: 2,
  },
});
