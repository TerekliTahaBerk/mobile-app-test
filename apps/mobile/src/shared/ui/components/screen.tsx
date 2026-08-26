import type { ReactNode } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { theme } from '@/shared/ui/theme/tokens';

export type ScreenBackground = 'app' | 'flashcard' | 'lesson';

type ScreenProps = {
  background?: ScreenBackground;
  children: ReactNode;
  /**
   * Screens that own a fixed bottom action region opt out of the bottom safe
   * inset here and consume it inside `BottomAction` instead.
   */
  includeBottomInset?: boolean;
  style?: StyleProp<ViewStyle>;
  testID?: string;
};

/**
 * Owns safe areas and the page background. Screens keep their own horizontal
 * rhythm so each composition can match the imported design exactly.
 */
export function Screen({
  background = 'app',
  children,
  includeBottomInset = true,
  style,
  testID,
}: ScreenProps) {
  return (
    <SafeAreaView
      edges={includeBottomInset ? ['top', 'right', 'bottom', 'left'] : ['top', 'right', 'left']}
      style={[styles.safeArea, backgroundStyles[background], style]}
      testID={testID}
    >
      <View style={styles.content}>{children}</View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
});

const backgroundStyles = StyleSheet.create({
  app: { backgroundColor: theme.colors.background.app },
  flashcard: { backgroundColor: theme.colors.background.flashcard },
  lesson: { backgroundColor: theme.colors.background.lesson },
});
