import { useLocalSearchParams, useRouter } from 'expo-router';
import { useMemo, useState } from 'react';

import { useLessonSession } from '@/modules/learning/application/lesson-session-store';
import { buildTopicPerformanceViewModel } from '@/modules/profile/model/build-topic-performance-view-model';
import { TopicPerformanceScreen } from '@/modules/profile/ui/topic-performance-screen';
import { useProgressDashboard } from '@/modules/progress/application/use-progress-dashboard';
import type { TopicPerformanceWindow } from '@/modules/progress/domain/topic-performance';
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
  const [window, setWindow] = useState<TopicPerformanceWindow>('all');
  const data = dashboard.status === 'ready' ? dashboard.data : null;
  const viewModel = useMemo(
    () => (data === null ? null : buildTopicPerformanceViewModel(data, window)),
    [data, window],
  );
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

  if (viewModel === null) {
    return (
      <MessageScreen
        body="Cevap geçmişin ana konu ve alt konulara ayrılıyor."
        heading="Performansın hazırlanıyor"
        testID="topic-performance-loading"
        tone="muted"
      />
    );
  }

  // The change summary is always read from the all-time record: a drill just
  // finished is evidence regardless of which window the learner is looking at.
  const recentTopic = dashboard.data.topicPerformance.topics
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
      onChangeWindow={setWindow}
      onStartPractice={(topicId, currentAccuracy) => {
        void beginTopicPractice(topicId, currentAccuracy)
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
      viewModel={viewModel}
    />
  );
}
