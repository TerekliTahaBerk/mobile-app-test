import { StyleSheet, View } from 'react-native';

import { AppText } from '@/shared/ui/components/app-text';
import { theme } from '@/shared/ui/theme/tokens';

type EyebrowPillProps = {
  ink?: string | undefined;
  label: string;
  surface?: string | undefined;
  /** The design sets these labels in uppercase with wide tracking. */
  uppercase?: boolean;
};

/** The small status pill above a unit title or an exercise stem. */
export function EyebrowPill({
  ink = theme.colors.status.successInk,
  label,
  surface = theme.colors.surface.soft,
  uppercase = true,
}: EyebrowPillProps) {
  return (
    <View style={[styles.pill, { backgroundColor: surface }]}>
      <AppText
        style={[styles.label, { color: ink }, uppercase ? styles.uppercase : null]}
        variant="eyebrow"
      >
        {label}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  label: {
    includeFontPadding: false,
  },
  pill: {
    alignSelf: 'flex-start',
    borderRadius: theme.radii.pill,
    paddingHorizontal: 13,
    paddingVertical: theme.spacing.xs + 2,
  },
  uppercase: {
    textTransform: 'uppercase',
  },
});
