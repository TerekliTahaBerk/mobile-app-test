import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

import { Cizgi } from '@/shared/ui/cizgi/cizgi';
import type { CizgiMood } from '@/shared/ui/cizgi/cizgi-assets';
import { theme } from '@/shared/ui/theme/tokens';

type CizgiSpeechProps = {
  children: ReactNode;
  mood: CizgiMood;
  width?: number;
};

/**
 * ÇİZGİ addressing the learner: the pose on the left, an outlined bubble with
 * a pointing tail on the right. Used by onboarding and the exercise screens.
 */
export function CizgiSpeech({ children, mood, width = 78 }: CizgiSpeechProps) {
  return (
    <View style={styles.row}>
      <Cizgi mood={mood} style={styles.character} width={width} />
      <View style={styles.bubble}>
        <View importantForAccessibility="no-hide-descendants" style={styles.tail} />
        {children}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  bubble: {
    backgroundColor: theme.colors.surface.default,
    borderColor: theme.colors.border.subtle,
    borderRadius: theme.radii.medium + 2,
    borderWidth: 2,
    flex: 1,
    marginTop: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.lg,
  },
  character: {
    flexShrink: 0,
  },
  row: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  tail: {
    backgroundColor: theme.colors.surface.default,
    borderBottomWidth: 2,
    borderColor: theme.colors.border.subtle,
    borderLeftWidth: 2,
    height: 14,
    left: -9,
    position: 'absolute',
    top: 20,
    transform: [{ rotate: '45deg' }],
    width: 14,
  },
});
