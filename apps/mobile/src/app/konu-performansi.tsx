import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';

import { useLessonSession } from '@/modules/learning/application/lesson-session-store';
import { buildProfileViewModel } from '@/modules/profile/model/build-profile-view-model';
import { TopicPerformanceScreen } from '@/modules/profile/ui/topic-performance-screen';
import { useProgressDashboard } from '@/modules/progress/application/use-progress-dashboard';
import { MessageScreen } from '@/shared/ui/feedback/message-screen';

export default function TopicPerformanceRoute() {
  const dashboard = useProgressDashboard();
  const router = useRouter();
  const { beginTopicPractice } = useLessonSession();
  const params = useLocalSearchParams<{
    beforeAccuracy?: string;
    topicId?: string;
  }>();
  const [actionError, setActionError] = useState<Error | null>(null);
  const goBack = () => (router.canGoBack() ? router.back() : router.replace('/profil'));

  if (dashboard.status === 'loading') {
    return (
      <MessageScreen
        body="Cevap geçmişin ana konu ve alt konulara ayrılıyor."
        heading="Performansın hazırlanıyor"
        testID="topic-performance-loading"
        tone="muted"
      />
    );
  }

  if (dashboard.status === 'failed') {
    return (
      <MessageScreen
        action={{ label: 'Tekrar dene', onPress: dashboard.refresh }}
        body="Bu cihazdaki cevap kayıtların okunamadı."
        heading="Konu performansı açılamadı"
        testID="topic-performance-failed"
        tone="dimmed"
      />
    );
  }

  if (actionError !== null) {
    return (
      <MessageScreen
        action={{ label: 'Tekrar dene', onPress: () => setActionError(null) }}
        body="Bu alt konu için hedefli çalışma hazırlanamadı. Kayıtların değişmedi."
        detail={__DEV__ ? actionError.message : undefined}
        heading="Çalışma açılamadı"
        testID="topic-practice-failed"
        tone="dimmed"
      />
    );
  }

  const viewModel = buildProfileViewModel(dashboard.data);
  const recentTopic = viewModel.topicPerformance
    .flatMap((topic) => topic.subtopics)
    .find((topic) => topic.id === params.topicId);
  const beforeAccuracy = Number(params.beforeAccuracy);
  const recentResult =
    recentTopic === undefined || !Number.isFinite(beforeAccuracy)
      ? undefined
      : {
          afterAccuracy: recentTopic.accuracy,
          beforeAccuracy,
          topicTitle: recentTopic.title,
        };

  return (
    <TopicPerformanceScreen
      onBack={goBack}
      onStartPractice={(topicId, currentAccuracy) => {
        void beginTopicPractice(topicId)
          .then(() => {
            router.push({
              pathname: '/lesson',
              params: {
                beforeAccuracy: String(currentAccuracy),
                returnTo: 'topicPerformance',
                topicId,
              },
            });
          })
          .catch((cause: unknown) => {
            setActionError(cause instanceof Error ? cause : new Error(String(cause)));
          });
      }}
      recentResult={recentResult}
      topics={viewModel.topicPerformance}
    />
  );
}
