import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { HeartsProvider } from '@/modules/hearts/application/hearts-store';
import { LessonSessionProvider } from '@/modules/learning/application/lesson-session-store';
import {
  ProgressProvider,
  ProgressStartupGate,
  useRepositories,
} from '@/modules/progress/application/progress-store';
import { FEATURES } from '@/shared/config/app-config';
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
            <ProgressProvider>
              <ProgressStartupGate>
                <ReadyApplication />
              </ProgressStartupGate>
            </ProgressProvider>
          </AppErrorBoundary>
        </SplashGate>
        <StatusBar style="dark" />
      </AppTypographyProvider>
    </SafeAreaProvider>
  );
}

function ReadyApplication() {
  const repositories = useRepositories();

  return (
    <LessonSessionProvider repositories={repositories}>
      {/*
        Hearts are off in a production pilot: studying is never blocked while
        the limit has no way for a learner to lift it.
      */}
      <HeartsProvider repository={repositories.hearts} unlimited={!FEATURES.heartsEconomy}>
        <Stack
          screenOptions={{
            contentStyle: { backgroundColor: theme.colors.background.app },
            headerShown: false,
          }}
        />
      </HeartsProvider>
    </LessonSessionProvider>
  );
}
