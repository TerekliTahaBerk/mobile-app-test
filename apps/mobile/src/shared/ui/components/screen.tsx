import type { ReactNode } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { theme } from '@/shared/ui/theme/tokens';

type ScreenProps = {
  children: ReactNode;
  contentContainerStyle?: StyleProp<ViewStyle>;
  keyboardAvoiding?: boolean;
  scroll?: boolean;
  testID?: string;
};

export function Screen({
  children,
  contentContainerStyle,
  keyboardAvoiding = false,
  scroll = false,
  testID,
}: ScreenProps) {
  return (
    <SafeAreaView edges={['top', 'right', 'bottom', 'left']} style={styles.safeArea} testID={testID}>
      <KeyboardAvoidingView
        behavior={keyboardAvoiding && Platform.OS === 'ios' ? 'padding' : undefined}
        enabled={keyboardAvoiding}
        style={styles.keyboardArea}
      >
        {scroll ? (
          <ScrollView
            contentContainerStyle={[styles.contentBase, styles.scrollContent, contentContainerStyle]}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            style={styles.scrollView}
          >
            {children}
          </ScrollView>
        ) : (
          <View style={[styles.contentBase, styles.staticContent, contentContainerStyle]}>{children}</View>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  contentBase: {
    alignSelf: 'center',
    maxWidth: 720,
    paddingHorizontal: theme.spacing.xl,
    width: '100%',
  },
  keyboardArea: {
    flex: 1,
  },
  safeArea: {
    backgroundColor: theme.colors.background.app,
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: theme.spacing.xxl,
    paddingTop: theme.spacing.lg,
  },
  scrollView: {
    flex: 1,
  },
  staticContent: {
    flex: 1,
    paddingBottom: theme.spacing.xl,
    paddingTop: theme.spacing.lg,
  },
});
