import { StyleSheet, View } from 'react-native';

import { theme } from '@/shared/ui/theme/tokens';

type StepProgressProps = {
  accessibilityLabel: string;
  /** 1-based index of the step being shown. */
  currentStep: number;
  totalSteps: number;
};

/**
 * The onboarding progress rail: one equal segment per step, filled up to and
 * including the step being answered.
 */
export function StepProgress({
  accessibilityLabel,
  currentStep,
  totalSteps,
}: StepProgressProps) {
  return (
    <View
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="progressbar"
      accessibilityValue={{ max: totalSteps, min: 0, now: currentStep }}
      style={styles.rail}
    >
      {Array.from({ length: totalSteps }, (_unused, index) => (
        <View
          key={index}
          style={[styles.segment, index < currentStep ? styles.segmentDone : null]}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  rail: {
    flexDirection: 'row',
    flex: 1,
    gap: 5,
  },
  segment: {
    backgroundColor: theme.colors.progress.track,
    borderRadius: theme.radii.pill,
    flex: 1,
    height: 8,
  },
  segmentDone: {
    backgroundColor: theme.colors.progress.fill,
  },
});
