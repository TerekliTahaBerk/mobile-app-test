import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

import { Dino } from '@/shared/ui/dino/dino';
import { theme } from '@/shared/ui/theme/tokens';

type DinoSpeechProps = {
  children: ReactNode;
  size?: number;
};

/**
 * Dino addressing the learner: the mascot on the left and a soft brand bubble
 * on the right whose bottom-left corner is squared off to point back at him.
 * This is the header of every onboarding step.
 */
export function DinoSpeech({ children, size = 72 }: DinoSpeechProps) {
  return (
    <View style={styles.row}>
      <Dino pose="writing" size={size} style={styles.character} />
      <View style={styles.bubble}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  bubble: {
    backgroundColor: theme.colors.surface.soft,
    borderBottomLeftRadius: theme.radii.xs,
    borderRadius: theme.radii.large + 2,
    flex: 1,
    paddingHorizontal: theme.spacing.lg + 4,
    paddingVertical: theme.spacing.lg + 2,
  },
  character: {
    flexShrink: 0,
  },
  row: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: theme.spacing.lg,
  },
});
