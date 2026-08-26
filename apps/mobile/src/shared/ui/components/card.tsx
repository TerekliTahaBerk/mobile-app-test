import { StyleSheet, View, type ViewProps } from 'react-native';

import { theme } from '@/shared/ui/theme/tokens';

export type CardVariant = 'default' | 'elevated' | 'outlined';

type CardProps = ViewProps & {
  variant?: CardVariant;
};

export function Card({ style, variant = 'default', ...viewProps }: CardProps) {
  return <View style={[styles.base, variantStyles[variant], style]} {...viewProps} />;
}

const styles = StyleSheet.create({
  base: {
    backgroundColor: theme.colors.surface.default,
    borderRadius: theme.radii.large,
    padding: theme.spacing.lg,
  },
});

const variantStyles = StyleSheet.create({
  default: {
    backgroundColor: theme.colors.surface.default,
  },
  elevated: {
    ...theme.elevation.raised,
    backgroundColor: theme.colors.surface.elevated,
  },
  outlined: {
    borderColor: theme.colors.border.subtle,
    borderWidth: 1,
  },
});

