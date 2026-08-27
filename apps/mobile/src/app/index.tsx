import { useRouter } from 'expo-router';

import { KURULTAY_PATH_NODE_ID } from '@/modules/curriculum/content/tyt-social-draft-bundle';
import { buildDurableHomeViewModel } from '@/modules/home/model/home-view-model';
import { HomeScreen } from '@/modules/home/ui/home-screen';
import { useLessonSession } from '@/modules/learning/application/lesson-session-store';
import { useProgressDashboard } from '@/modules/progress/application/use-progress-dashboard';
import { APP_MODE } from '@/shared/config/app-config';
import { useTabNavigation } from '@/shared/navigation/use-tab-navigation';
import { MessageScreen } from '@/shared/ui/feedback/message-screen';

export default function IndexRoute() {
  return APP_MODE === 'designPreview' ? <PreviewIndexRoute /> : <DurableIndexRoute />;
}

function PreviewIndexRoute() {
  const router = useRouter();
  const { begin } = useLessonSession();

  return (
    <HomeScreen
      onSelectTab={useTabNavigation('yol')}
      onStartLevel={(lessonId, pathNodeId) => {
        begin(lessonId, pathNodeId);
        router.push({ params: { lessonId }, pathname: '/lesson-intro' });
      }}
    />
  );
}

function DurableIndexRoute() {
  const router = useRouter();
  const { begin, beginReview, resume } = useLessonSession();
  const dashboard = useProgressDashboard();
  const onSelectTab = useTabNavigation('yol');

  if (dashboard.status === 'loading') {
    return (
      <MessageScreen
        body="XP, İz ve ders durumun okunuyor."
        heading="Yolun hazırlanıyor"
        mood="thinking"
        testID="home-loading"
      />
    );
  }

  if (dashboard.status === 'failed') {
    return (
      <MessageScreen
        action={{ label: 'TEKRAR DENE', onPress: dashboard.refresh }}
        body="İlerlemen okunamadı. Kayıtların silinmedi."
        detail={__DEV__ ? dashboard.error.message : undefined}
        heading="Yol açılamadı"
        mood="sad"
        testID="home-failed"
      />
    );
  }

  const home = buildDurableHomeViewModel({
    iz: dashboard.data.iz.current,
    progress: dashboard.data.pathProgress.get(KURULTAY_PATH_NODE_ID) ?? null,
    recommendation: dashboard.data.recommendation,
    totalXp: dashboard.data.totalXp,
  });

  return (
    <HomeScreen
      onSelectTab={onSelectTab}
      onStartLevel={async (lessonId, pathNodeId) => {
        const recommendation = dashboard.data.recommendation;
        if (recommendation.kind === 'mistake' || recommendation.kind === 'review') {
          beginReview(recommendation.skillId);
          router.push('/lesson');
          return;
        }

        if (recommendation.kind === 'resume') {
          if (await resume(recommendation.sessionId)) {
            router.push('/lesson');
          } else {
            dashboard.refresh();
          }
          return;
        }

        begin(lessonId, pathNodeId);
        router.push({ params: { lessonId }, pathname: '/lesson-intro' });
      }}
      viewModel={home}
    />
  );
}
