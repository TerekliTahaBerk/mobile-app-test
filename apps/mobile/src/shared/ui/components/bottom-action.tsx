import type { ReactNode } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { theme } from '@/shared/ui/theme/tokens';

type BottomActionProps = {
  children: ReactNode;
  /** Tints the region when feedback is showing (correct / wrong sheets). */
  surfaceColor?: string | undefined;
  style?: StyleProp<ViewStyle>;
};

const MIN_BOTTOM_GAP = theme.spacing.lg;

/**
 * The fixed, thumb-reachable action region every flow screen ends with. It
 * clears the iPhone home indicator without hard-coding a device height.
 */
export function BottomAction({ children, surfaceColor, style }: BottomActionProps) {
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        styles.region,
        { paddingBottom: Math.max(insets.bottom, MIN_BOTTOM_GAP) },
        surfaceColor ? { backgroundColor: surfaceColor } : null,
        style,
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  region: {
    gap: theme.spacing.md,
    paddingHorizontal: theme.spacing.xl,
    paddingTop: theme.spacing.lg,
  },
});
