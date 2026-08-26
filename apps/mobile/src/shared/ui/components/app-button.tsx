import { useState } from 'react';
import {
  Pressable,
  StyleSheet,
  View,
  type PressableProps,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

import { AppText, type AppTextColor } from '@/shared/ui/components/app-text';
import { theme } from '@/shared/ui/theme/tokens';

export type AppButtonVariant = 'ghost' | 'primary' | 'secondary';

type AppButtonProps = Omit<PressableProps, 'children' | 'onPress' | 'style'> & {
  fullWidth?: boolean;
  label: string;
  onPress: NonNullable<PressableProps['onPress']>;
  style?: StyleProp<ViewStyle>;
  variant?: AppButtonVariant;
};

export function AppButton({
  accessibilityLabel,
  accessibilityState,
  disabled = false,
  fullWidth = false,
  label,
  onPress,
  onPressIn,
  onPressOut,
  style,
  testID,
  variant = 'primary',
  ...pressableProps
}: AppButtonProps) {
  const [isPressed, setIsPressed] = useState(false);
  const isDisabled = disabled === true;
  const variantStyle = variantStyles[variant];
  const labelColor: AppTextColor = isDisabled ? 'muted' : variantStyle.labelColor;

  return (
    <Pressable
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityRole="button"
      accessibilityState={{ ...accessibilityState, disabled: isDisabled }}
      disabled={isDisabled}
      onPress={onPress}
      onPressIn={(event) => {
        setIsPressed(true);
        onPressIn?.(event);
      }}
      onPressOut={(event) => {
        setIsPressed(false);
        onPressOut?.(event);
      }}
      style={[styles.pressable, fullWidth && styles.fullWidth, style]}
      testID={testID}
      {...pressableProps}
    >
      {() => {
        const hasPrimaryDepth = variant === 'primary' && !isDisabled;

        return (
          <View
            style={[
              styles.frame,
              hasPrimaryDepth ? styles.tactileFrame : styles.standardFrame,
              fullWidth && styles.fullWidth,
            ]}
          >
            {hasPrimaryDepth ? <View style={styles.primaryShadow} /> : null}
            <View
              testID={testID ? `${testID}-face` : undefined}
              style={[
                styles.face,
                variantStyle.face,
                isPressed && !isDisabled && variant !== 'primary' && variantStyle.pressed,
                isPressed && hasPrimaryDepth && styles.primaryPressedFace,
                isDisabled && styles.disabled,
              ]}
            >
              <AppText color={labelColor} variant="labelL">
                {label}
              </AppText>
            </View>
          </View>
        );
      }}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  disabled: {
    backgroundColor: theme.colors.action.disabled,
  },
  face: {
    alignItems: 'center',
    borderRadius: theme.radii.medium,
    justifyContent: 'center',
    minHeight: 48,
    paddingHorizontal: theme.spacing.xl,
    paddingVertical: theme.spacing.md,
    width: '100%',
  },
  frame: {
    position: 'relative',
  },
  fullWidth: {
    width: '100%',
  },
  pressable: {
    borderRadius: theme.radii.medium,
    minHeight: 48,
  },
  primaryPressedFace: {
    transform: [{ translateY: theme.controlDepth.primary }],
  },
  primaryShadow: {
    backgroundColor: theme.colors.action.primaryPressed,
    borderRadius: theme.radii.medium,
    bottom: 0,
    left: 0,
    position: 'absolute',
    right: 0,
    top: theme.controlDepth.primary,
  },
  standardFrame: {
    minHeight: 48,
  },
  tactileFrame: {
    minHeight: 48 + theme.controlDepth.primary,
  },
});

const primaryStyles = StyleSheet.create({
  face: { backgroundColor: theme.colors.action.primary },
  pressed: {},
});

const secondaryStyles = StyleSheet.create({
  face: { backgroundColor: theme.colors.action.secondary },
  pressed: { backgroundColor: theme.colors.action.secondaryPressed },
});

const ghostStyles = StyleSheet.create({
  face: { backgroundColor: theme.colors.action.ghost },
  pressed: { backgroundColor: theme.colors.action.ghostPressed },
});

const variantStyles = {
  ghost: { ...ghostStyles, labelColor: 'accent' },
  primary: { ...primaryStyles, labelColor: 'inverse' },
  secondary: { ...secondaryStyles, labelColor: 'accent' },
} as const;
