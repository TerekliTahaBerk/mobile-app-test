import '@/shared/observability/bootstrap';

import * as Sentry from '@sentry/react-native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { getContentIndex } from '@/modules/curriculum/content/content-source';
import { HeartsProvider } from '@/modules/hearts/application/hearts-store';
import {
  LearnerEntryGate,
  LearnerProfileProvider,
} from '@/modules/learner/application/learner-profile-store';
import { LessonSessionProvider } from '@/modules/learning/application/lesson-session-store';
import {
  ProgressProvider,
  ProgressStartupGate,
  useRepositories,
} from '@/modules/progress/application/progress-store';
import { LATEST_SCHEMA_VERSION } from '@/modules/progress/infrastructure/migrations';
import { APP_MODE, FEATURES } from '@/shared/config/app-config';
import {
  OBSERVABILITY_ENVIRONMENT,
  OBSERVABILITY_RELEASE,
} from '@/shared/observability/sentry-adapter';
import { recordDiagnostics } from '@/shared/observability/observability';
import { AppErrorBoundary } from '@/shared/ui/feedback/app-error-boundary';
import { SplashGate } from '@/shared/ui/theme/splash-gate';
import { theme } from '@/shared/ui/theme/tokens';
import { AppTypographyProvider } from '@/shared/ui/theme/typography-provider';

function RootLayout() {
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

  useEffect(() => {
    recordDiagnostics({
      appMode: APP_MODE,
      contentVersion: getContentIndex().bundle.contentVersion,
      environment: OBSERVABILITY_ENVIRONMENT,
      release: OBSERVABILITY_RELEASE,
      schemaVersion: LATEST_SCHEMA_VERSION,
    });
  }, []);

  return (
    <LearnerProfileProvider repository={repositories.profile}>
      <LearnerEntryGate>
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
      </LearnerEntryGate>
    </LearnerProfileProvider>
  );
}

export default Sentry.wrap(RootLayout);
