import { useRouter } from 'expo-router';
import { useState } from 'react';

import { homePreviewData, type HomeViewModel } from '@/modules/home/model/home-view-model';
import { HomeScreen } from '@/modules/home/ui/home-screen';
import { useHearts } from '@/modules/hearts/application/hearts-store';
import { useLessonSession } from '@/modules/learning/application/lesson-session-store';
import type { DailyPlan } from '@/modules/learning/domain/daily-plan';
import { buildHomeViewModel } from '@/modules/home/model/build-home-view-model';
import { useProgressDashboard } from '@/modules/progress/application/use-progress-dashboard';
import { useReminders } from '@/modules/reminders/application/use-reminders';
import { APP_MODE, FEATURES } from '@/shared/config/app-config';
import { useTabNavigation } from '@/shared/navigation/use-tab-navigation';
import { MessageScreen } from '@/shared/ui/feedback/message-screen';

export default function IndexRoute() {
  return APP_MODE === 'designPreview' ? <PreviewHomeRoute /> : <DurableHomeRoute />;
}

function PreviewHomeRoute() {
  // The design preview has no durable record to plan from, so the plan card is
  // reviewable but opens the fixture's own lesson rather than a real day.
  return <HomeShell plan={null} viewModel={homePreviewData} />;
}

function DurableHomeRoute() {
  const dashboard = useProgressDashboard();
  const hearts = useHearts();

  // Home is where the dashboard is already read, so reminders re-arm on every
  // app open without a second pass over storage.
  useReminders(dashboard.status === 'ready' ? dashboard.data : null);

  if (dashboard.status === 'loading') {
    return (
      <MessageScreen
        body="XP, seri ve ders durumun okunuyor."
        heading="Hazırlanıyor"
        testID="home-loading"
        tone="muted"
      />
    );
  }

  if (dashboard.status === 'failed') {
    return (
      <MessageScreen
        action={{ label: 'Tekrar dene', onPress: dashboard.refresh }}
        body="İlerlemen okunamadı. Kayıtların silinmedi."
        detail={__DEV__ ? dashboard.error.message : undefined}
        heading="Ana sayfa açılamadı"
        testID="home-failed"
        tone="dimmed"
      />
    );
  }

  return (
    <HomeShell
      plan={dashboard.data.dailyPlan}
      viewModel={buildHomeViewModel(dashboard.data, hearts.hearts)}
    />
  );
}

function HomeShell({ plan, viewModel }: { plan: DailyPlan | null; viewModel: HomeViewModel }) {
  const router = useRouter();
  const { begin, beginDailyPlan, resume } = useLessonSession();
  const onSelectTab = useTabNavigation('anasayfa');
  const [actionError, setActionError] = useState<Error | null>(null);

  if (actionError !== null) {
    return (
      <MessageScreen
        action={{ label: 'Tekrar dene', onPress: () => setActionError(null) }}
        body="Çalışma hazırlanamadı. Kayıtların silinmedi; tekrar deneyebilirsin."
        detail={__DEV__ ? actionError.message : undefined}
        heading="Çalışma açılamadı"
        testID="home-action-failed"
        tone="dimmed"
      />
    );
  }

  return (
    <HomeScreen
      onContinue={(card) => {
        const open = async () => {
          if (card.action.kind === 'lesson') {
            begin(card.action.lessonId, card.action.pathNodeId);
          } else if (!(await resume(card.action.sessionId))) {
            throw new Error('Etkin çalışma artık bulunamıyor.');
          }
          router.push('/lesson');
        };

        void open().catch((cause: unknown) => {
          setActionError(cause instanceof Error ? cause : new Error(String(cause)));
        });
      }}
      onOpenLeague={FEATURES.league ? () => router.replace('/lig') : undefined}
      onSelectTab={onSelectTab}
      onStartDailyPlan={() => {
        try {
          if (plan === null) {
            const preview = viewModel.continueCard?.action;
            if (preview?.kind !== 'lesson') {
              return;
            }
            begin(preview.lessonId, preview.pathNodeId);
          } else {
            beginDailyPlan(plan);
          }
          router.push('/lesson');
        } catch (cause: unknown) {
          setActionError(cause instanceof Error ? cause : new Error(String(cause)));
        }
      }}
      viewModel={viewModel}
    />
  );
}
