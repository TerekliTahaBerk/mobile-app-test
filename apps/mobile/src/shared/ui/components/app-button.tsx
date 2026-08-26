import { Pressable, StyleSheet, Text } from 'react-native';

import { colors, radii, spacing, typography } from '@/shared/ui/theme/tokens';

type AppButtonProps = {
  accessibilityHint?: string;
  label: string;
  onPress: () => void;
};

export function AppButton({ accessibilityHint, label, onPress }: AppButtonProps) {
  return (
    <Pressable
      accessibilityHint={accessibilityHint}
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}
    >
      <Text style={styles.label}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    backgroundColor: colors.actionPrimary,
    borderRadius: radii.md,
    justifyContent: 'center',
    minHeight: 48,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  buttonPressed: {
    backgroundColor: colors.actionPrimaryPressed,
  },
  label: {
    color: colors.actionOnPrimary,
    fontSize: typography.body,
    fontWeight: '700',
  },
});

