import { StyleSheet, View, type PressableProps, type StyleProp, type ViewStyle } from 'react-native';

import { AppText, type AppTextColor } from '@/shared/ui/components/app-text';
import { TactilePressable } from '@/shared/ui/components/tactile-pressable';
import { theme } from '@/shared/ui/theme/tokens';

export type AppButtonVariant = 'danger' | 'ghost' | 'inverse' | 'neutral' | 'primary';

type AppButtonProps = Omit<PressableProps, 'children' | 'onPress' | 'style'> & {
  fullWidth?: boolean;
  label: string;
  onPress: NonNullable<PressableProps['onPress']>;
  style?: StyleProp<ViewStyle>;
  variant?: AppButtonVariant;
};

/**
 * The screen-driving action of the design: a wide, thumb-reachable control
 * with a solid 4pt structural edge that compresses when pressed. `ghost` is
 * the quiet text action used for "Şimdilik değil" and "Ana Sayfa".
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
  const labelColor: AppTextColor = isDisabled ? 'muted' : tone.labelColor;

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
        <AppText align="center" color="secondary" variant="labelM">
          {label}
        </AppText>
      </TactilePressable>
    );
  }

  return (
    <TactilePressable
      {...sharedProps}
      depthColor={tone.depth}
      faceStyle={[
        styles.face,
        { backgroundColor: tone.face },
        tone.border === undefined
          ? null
          : { borderColor: tone.border, borderWidth: 2 },
      ]}
      radius={theme.radii.large}
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
    paddingVertical: 17,
  },
  fullWidth: {
    width: '100%',
  },
  ghostFace: {
    justifyContent: 'center',
    minHeight: theme.hitTarget,
    paddingVertical: theme.spacing.lg,
  },
  labelRow: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});

type ButtonTone = {
  border?: string;
  depth: string;
  face: string;
  labelColor: AppTextColor;
};

const toneStyles: Record<AppButtonVariant | 'disabled', ButtonTone> = {
  danger: {
    depth: theme.colors.action.dangerDepth,
    face: theme.colors.action.danger,
    labelColor: 'inverse',
  },
  disabled: {
    depth: theme.colors.action.disabledDepth,
    face: theme.colors.action.disabled,
    labelColor: 'muted',
  },
  ghost: {
    depth: 'transparent',
    face: 'transparent',
    labelColor: 'secondary',
  },
  /** White face on a coloured stage — the welcome screen's "Başla". */
  inverse: {
    depth: theme.colors.action.inverseDepth,
    face: theme.colors.action.inverse,
    labelColor: 'accentStrong',
  },
  /** Outlined face on white — "Pratik Yaparak 1 Can Kazan". */
  neutral: {
    border: theme.colors.border.subtle,
    depth: theme.colors.border.subtle,
    face: theme.colors.surface.default,
    labelColor: 'accentStrong',
  },
  primary: {
    depth: theme.colors.action.primaryDepth,
    face: theme.colors.action.primary,
    labelColor: 'inverse',
  },
};
