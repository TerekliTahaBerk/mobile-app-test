import { useRouter } from 'expo-router';
import { useState } from 'react';

import { useLessonSession } from '@/modules/learning/application/lesson-session-store';
import { buildPlacementResultViewModel } from '@/modules/onboarding/model/build-placement-result-view-model';
import { PlacementResultScreen } from '@/modules/onboarding/ui/placement-result-screen';
import { useProgressDashboard } from '@/modules/progress/application/use-progress-dashboard';
import { MessageScreen } from '@/shared/ui/feedback/message-screen';

export default function PlacementResultRoute() {
  const dashboard = useProgressDashboard();
  const router = useRouter();
  const { beginDailyPlan } = useLessonSession();
  const [actionError, setActionError] = useState<Error | null>(null);

  if (dashboard.status === 'loading') {
    return (
      <MessageScreen
        body="Cevapların ana konu ve alt konulara ayrılıyor."
        heading="Haritan çıkarılıyor"
        testID="placement-result-loading"
        tone="muted"
      />
    );
  }

  if (dashboard.status === 'failed') {
    return (
      <MessageScreen
        action={{ label: 'Tekrar dene', onPress: dashboard.refresh }}
        body="Tespit turunun sonucu okunamadı. Cevapların kaydedildi."
        heading="Harita açılamadı"
        testID="placement-result-failed"
        tone="dimmed"
      />
    );
  }

  if (actionError !== null) {
    return (
      <MessageScreen
        action={{ label: 'Ana sayfa', onPress: () => router.replace('/') }}
        body="Bugünün planı açılamadı. Haritan ve cevapların kaydedildi."
        detail={__DEV__ ? actionError.message : undefined}
        heading="Plan açılamadı"
        testID="placement-plan-failed"
        tone="dimmed"
      />
    );
  }

  return (
    <PlacementResultScreen
      onSkipPlan={() => router.replace('/')}
      onStartPlan={() => {
        try {
          beginDailyPlan(dashboard.data.dailyPlan);
          router.replace('/lesson');
        } catch (cause: unknown) {
          setActionError(cause instanceof Error ? cause : new Error(String(cause)));
        }
      }}
      viewModel={buildPlacementResultViewModel(dashboard.data)}
    />
  );
}
