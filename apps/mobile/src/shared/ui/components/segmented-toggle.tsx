import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/shared/ui/components/app-text';
import { theme } from '@/shared/ui/theme/tokens';

export type SegmentedOption<TValue extends string> = {
  label: string;
  value: TValue;
};

type SegmentedToggleProps<TValue extends string> = {
  accessibilityLabel: string;
  onChange: (value: TValue) => void;
  options: readonly SegmentedOption<TValue>[];
  value: TValue;
};

/**
 * The pill-track switch used for the TYT / AYT exam split: a soft brand track
 * with a single raised white segment marking the current choice.
 */
export function SegmentedToggle<TValue extends string>({
  accessibilityLabel,
  onChange,
  options,
  value,
}: SegmentedToggleProps<TValue>) {
  return (
    <View accessibilityLabel={accessibilityLabel} accessibilityRole="tablist" style={styles.track}>
      {options.map((option) => {
        const isActive = option.value === value;

        return (
          <Pressable
            accessibilityLabel={option.label}
            accessibilityRole="tab"
            accessibilityState={{ selected: isActive }}
            key={option.value}
            onPress={() => onChange(option.value)}
            style={[styles.segment, isActive ? styles.segmentActive : null]}
            testID={`segment-${option.value}`}
          >
            <AppText align="center" color={isActive ? 'primary' : 'secondary'} variant="labelM">
              {option.label}
            </AppText>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  segment: {
    borderRadius: theme.radii.pill,
    flex: 1,
    justifyContent: 'center',
    minHeight: theme.hitTarget,
    paddingVertical: theme.spacing.md,
  },
  segmentActive: {
    ...theme.elevation.card,
    backgroundColor: theme.colors.surface.default,
  },
  track: {
    backgroundColor: theme.colors.surface.soft,
    borderRadius: theme.radii.pill,
    flexDirection: 'row',
    padding: theme.spacing.xs,
  },
});
