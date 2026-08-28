import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

import { AppText } from '@/shared/ui/components/app-text';
import { CheckIcon } from '@/shared/ui/components/icons';
import { TactilePressable } from '@/shared/ui/components/tactile-pressable';
import { theme } from '@/shared/ui/theme/tokens';

export type AnswerCardState = 'correct' | 'idle' | 'muted' | 'selected' | 'wrong';

type AnswerCardProps = {
  label: string;
  onPress: () => void;
  /** Locked once the answer has been checked. */
  readOnly?: boolean;
  state: AnswerCardState;
  testID?: string | undefined;
};

/**
 * One choice in a multiple-choice or true/false exercise. Correctness is shown
 * by fill, outline *and* a check mark, so it never rests on colour alone.
 */
export function AnswerCard({ label, onPress, readOnly = false, state, testID }: AnswerCardProps) {
  const tone = toneStyles[state];

  const face = (
    <View style={[styles.face, tone.face]}>
      <AppText color={tone.labelColor} style={styles.label} variant="bodyL">
        {label}
      </AppText>
      {state === 'correct' || state === 'selected' ? (
        <Mark inverted={state === 'correct'} />
      ) : null}
    </View>
  );

  if (readOnly) {
    return (
      <View accessibilityLabel={`${label}. ${describe(state)}`} accessibilityRole="text">
        {face}
      </View>
    );
  }

  return (
    <TactilePressable
      accessibilityLabel={label}
      accessibilityRole="radio"
      accessibilityState={{ selected: state === 'selected' }}
      depth={theme.depth.cardBorder}
      depthColor={tone.depth}
      onPress={onPress}
      testID={testID}
    >
      {face}
    </TactilePressable>
  );
}

function Mark({ inverted }: { inverted: boolean }): ReactNode {
  return (
    <View
      style={[
        styles.mark,
        inverted
          ? { backgroundColor: theme.colors.surface.default }
          : { backgroundColor: theme.colors.action.primary },
      ]}
    >
      <CheckIcon
        color={inverted ? theme.colors.action.primary : theme.colors.text.inverse}
        size={13}
      />
    </View>
  );
}

function describe(state: AnswerCardState): string {
  switch (state) {
    case 'correct':
      return 'doğru cevap';
    case 'wrong':
      return 'senin cevabın, yanlış';
    case 'selected':
      return 'seçili';
    default:
      return '';
  }
}

const styles = StyleSheet.create({
  face: {
    alignItems: 'center',
    backgroundColor: theme.colors.surface.default,
    borderRadius: theme.radii.large,
    borderWidth: 2,
    flexDirection: 'row',
    gap: theme.spacing.md,
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.lg + 4,
    paddingVertical: 17,
  },
  label: {
    flex: 1,
  },
  mark: {
    alignItems: 'center',
    borderRadius: theme.radii.pill,
    height: 26,
    justifyContent: 'center',
    width: 26,
  },
});

const toneStyles = {
  correct: {
    depth: theme.colors.action.primaryDepth,
    face: {
      backgroundColor: theme.colors.action.primary,
      borderColor: theme.colors.action.primary,
    },
    labelColor: 'inverse',
  },
  idle: {
    depth: theme.colors.border.subtle,
    face: { borderColor: theme.colors.border.subtle },
    labelColor: 'primary',
  },
  muted: {
    depth: theme.colors.border.hairline,
    face: { borderColor: theme.colors.border.hairline },
    labelColor: 'faint',
  },
  selected: {
    depth: theme.colors.action.primaryDepth,
    face: {
      backgroundColor: theme.colors.surface.soft,
      borderColor: theme.colors.action.primary,
    },
    labelColor: 'success',
  },
  wrong: {
    depth: theme.colors.status.dangerInk,
    face: {
      backgroundColor: theme.colors.status.dangerSoft,
      borderColor: theme.colors.status.danger,
    },
    labelColor: 'danger',
  },
} as const;
