import { useRouter } from 'expo-router';
import { useState } from 'react';

import { homePreviewData, type HomeViewModel } from '@/modules/home/model/home-view-model';
import { HomeScreen, type ExamFilter } from '@/modules/home/ui/home-screen';
import { useHearts } from '@/modules/hearts/application/hearts-store';
import { useLessonSession } from '@/modules/learning/application/lesson-session-store';
import { buildHomeViewModel } from '@/modules/home/model/build-home-view-model';
import { useProgressDashboard } from '@/modules/progress/application/use-progress-dashboard';
import { APP_MODE } from '@/shared/config/app-config';
import { useTabNavigation } from '@/shared/navigation/use-tab-navigation';
import { MessageScreen } from '@/shared/ui/feedback/message-screen';

export default function IndexRoute() {
  return APP_MODE === 'designPreview' ? <PreviewHomeRoute /> : <DurableHomeRoute />;
}

function PreviewHomeRoute() {
  return <HomeShell viewModel={homePreviewData} />;
}

function DurableHomeRoute() {
  const dashboard = useProgressDashboard();
  const hearts = useHearts();

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

  return <HomeShell viewModel={buildHomeViewModel(dashboard.data, hearts.hearts)} />;
}

function HomeShell({ viewModel }: { viewModel: HomeViewModel }) {
  const router = useRouter();
  const { begin, beginReview, resume } = useLessonSession();
  const onSelectTab = useTabNavigation('anasayfa');
  const [exam, setExam] = useState<ExamFilter>('tyt');
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
      exam={exam}
      onChangeExam={setExam}
      onContinue={(card) => {
        const open = async () => {
          if (card.action.kind === 'lesson') {
            begin(card.action.lessonId, card.action.pathNodeId);
          } else if (card.action.kind === 'review') {
            beginReview(card.action.skillId);
          } else if (!(await resume(card.action.sessionId))) {
            throw new Error('Etkin çalışma artık bulunamıyor.');
          }
          router.push('/lesson');
        };

        void open().catch((cause: unknown) => {
          setActionError(cause instanceof Error ? cause : new Error(String(cause)));
        });
      }}
      onOpenLeague={() => router.replace('/lig')}
      onOpenSubject={(subjectId) => router.push(`/ogren/${subjectId}`)}
      onSelectTab={onSelectTab}
      showExamToggle={APP_MODE === 'designPreview'}
      viewModel={viewModel}
    />
  );
}
