import { useRouter } from 'expo-router';
import { useState } from 'react';

import { useLessonSession } from '@/modules/learning/application/lesson-session-store';
import { buildMistakeNotebookViewModel } from '@/modules/profile/model/build-mistake-notebook-view-model';
import { MistakeNotebookScreen } from '@/modules/profile/ui/mistake-notebook-screen';
import { useProgressDashboard } from '@/modules/progress/application/use-progress-dashboard';
import { MessageScreen } from '@/shared/ui/feedback/message-screen';

export default function MistakeNotebookRoute() {
  const dashboard = useProgressDashboard();
  const router = useRouter();
  const { beginTopicPractice } = useLessonSession();
  const [actionError, setActionError] = useState<Error | null>(null);
  const goBack = () => (router.canGoBack() ? router.back() : router.replace('/profil'));

  if (dashboard.status === 'loading') {
    return (
      <MessageScreen
        body="Yanlış kayıtların ve verdiğin cevaplar okunuyor."
        heading="Defterin hazırlanıyor"
        testID="mistake-notebook-loading"
        tone="muted"
      />
    );
  }

  if (dashboard.status === 'failed') {
    return (
      <MessageScreen
        action={{ label: 'Tekrar dene', onPress: dashboard.refresh }}
        body="Bu cihazdaki yanlış kayıtların okunamadı."
        heading="Yanlış defteri açılamadı"
        testID="mistake-notebook-failed"
        tone="dimmed"
      />
    );
  }

  if (actionError !== null) {
    return (
      <MessageScreen
        action={{ label: 'Tekrar dene', onPress: () => setActionError(null) }}
        body="Bu konu için benzer soru hazırlanamadı. Kayıtların değişmedi."
        detail={__DEV__ ? actionError.message : undefined}
        heading="Çalışma açılamadı"
        testID="mistake-practice-failed"
        tone="dimmed"
      />
    );
  }

  return (
    <MistakeNotebookScreen
      onBack={goBack}
      onStartPractice={(subtopicId) => {
        void beginTopicPractice(subtopicId)
          .then(() => router.push('/lesson'))
          .catch((cause: unknown) => {
            setActionError(cause instanceof Error ? cause : new Error(String(cause)));
          });
      }}
      viewModel={buildMistakeNotebookViewModel(dashboard.data.mistakeNotebook)}
    />
  );
}
