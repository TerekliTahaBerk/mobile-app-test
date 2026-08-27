import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { AppErrorBoundary } from '@/shared/ui/feedback/app-error-boundary';
import { SplashGate } from '@/shared/ui/theme/splash-gate';
import { theme } from '@/shared/ui/theme/tokens';
import { AppTypographyProvider } from '@/shared/ui/theme/typography-provider';

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <AppTypographyProvider>
        <SplashGate>
          <AppErrorBoundary>
            <Stack
              screenOptions={{
                contentStyle: { backgroundColor: theme.colors.background.app },
                headerShown: false,
              }}
            />
          </AppErrorBoundary>
        </SplashGate>
        <StatusBar style="dark" />
      </AppTypographyProvider>
    </SafeAreaProvider>
  );
}
