import { StyleSheet, View, type PressableProps, type StyleProp, type ViewStyle } from 'react-native';

import { AppText, type AppTextColor } from '@/shared/ui/components/app-text';
import { TactilePressable } from '@/shared/ui/components/tactile-pressable';
import { theme } from '@/shared/ui/theme/tokens';

export type AppButtonVariant = 'danger' | 'ghost' | 'neutral' | 'primary' | 'success';

type AppButtonProps = Omit<PressableProps, 'children' | 'onPress' | 'style'> & {
  fullWidth?: boolean;
  label: string;
  onPress: NonNullable<PressableProps['onPress']>;
  style?: StyleProp<ViewStyle>;
  variant?: AppButtonVariant;
};

/**
 * The screen-driving action of the design: a wide, tactile, thumb-reachable
 * control with a compressed pressed state. `ghost` is the quiet text action
 * used for "Çıkışı onayla" and "İzi paylaş".
 */
export function AppButton({
  accessibilityLabel,
  accessibilityState,
  disabled = false,
  fullWidth = true,
  label,
  onPress,
  style,
  testID,
  variant = 'primary',
  ...pressableProps
}: AppButtonProps) {
  const isDisabled = disabled === true;
  const tone = isDisabled ? toneStyles.disabled : toneStyles[variant];
  const labelColor: AppTextColor = isDisabled ? 'disabled' : tone.labelColor;

  const sharedProps = {
    accessibilityLabel: accessibilityLabel ?? label,
    accessibilityRole: 'button' as const,
    accessibilityState: { ...accessibilityState, disabled: isDisabled },
    disabled: isDisabled,
    onPress,
    testID,
    ...pressableProps,
  };

  if (variant === 'ghost' && !isDisabled) {
    return (
      <TactilePressable
        {...sharedProps}
        depth={0}
        depthColor="transparent"
        faceStyle={styles.ghostFace}
        style={[fullWidth && styles.fullWidth, style]}
      >
        <AppText align="center" color="faint" variant="labelM">
          {label}
        </AppText>
      </TactilePressable>
    );
  }

  return (
    <TactilePressable
      {...sharedProps}
      depthColor={tone.depth}
      faceStyle={[styles.face, { backgroundColor: tone.face }]}
      style={[fullWidth && styles.fullWidth, style]}
    >
      <View style={styles.labelRow}>
        <AppText align="center" color={labelColor} variant="labelL">
          {label}
        </AppText>
      </View>
    </TactilePressable>
  );
}

const styles = StyleSheet.create({
  face: {
    minHeight: 56,
    paddingHorizontal: theme.spacing.xl,
    paddingVertical: theme.spacing.xl,
  },
  fullWidth: {
    width: '100%',
  },
  ghostFace: {
    minHeight: theme.hitTarget,
    justifyContent: 'center',
    paddingVertical: theme.spacing.lg,
  },
  labelRow: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});

const toneStyles = {
  danger: {
    depth: theme.colors.action.dangerDepth,
    face: theme.colors.action.danger,
    labelColor: 'inverse',
  },
  disabled: {
    depth: theme.colors.action.disabledDepth,
    face: theme.colors.action.disabled,
    labelColor: 'disabled',
  },
  ghost: {
    depth: theme.colors.action.neutralDepth,
    face: theme.colors.action.neutral,
    labelColor: 'muted',
  },
  neutral: {
    depth: theme.colors.action.neutralDepth,
    face: theme.colors.action.neutral,
    labelColor: 'muted',
  },
  primary: {
    depth: theme.colors.action.primaryDepth,
    face: theme.colors.action.primary,
    labelColor: 'inverse',
  },
  success: {
    depth: theme.colors.action.successDepth,
    face: theme.colors.action.success,
    labelColor: 'inverse',
  },
} as const satisfies Record<AppButtonVariant | 'disabled', { depth: string; face: string; labelColor: AppTextColor }>;
