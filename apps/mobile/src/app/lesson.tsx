import { useRouter } from 'expo-router';

import { useHearts } from '@/modules/hearts/application/hearts-store';
import { lessonCompletionParams } from '@/modules/learning/application/lesson-navigation';
import { useLessonSession } from '@/modules/learning/application/lesson-session-store';
import { LessonScreen } from '@/modules/learning/ui/lesson-screen';
import { MessageScreen } from '@/shared/ui/feedback/message-screen';

export default function LessonRoute() {
  const router = useRouter();
  const { lesson, persistenceError, persistenceStatus, retryPersistence } = useLessonSession();
  const hearts = useHearts();

  if (persistenceStatus === 'failed') {
    return (
      <MessageScreen
        action={{ label: 'Tekrar dene', onPress: retryPersistence }}
        body="Çalışmanın son durumu kaydedilemedi. Aynı yerden güvenle tekrar deneyebilirsin."
        detail={__DEV__ ? persistenceError?.message : undefined}
        heading="Çalışma kaydedilemedi"
        testID="lesson-persistence-failed"
        tone="dimmed"
      />
    );
  }

  if (lesson === null) {
    return (
      <MessageScreen
        action={{ label: 'Derslere dön', onPress: () => router.replace('/ogren') }}
        body="Devam edecek etkin bir çalışma bulunamadı."
        heading="Çalışma hazır değil"
        testID="lesson-missing"
        tone="muted"
      />
    );
  }

  return (
    <LessonScreen
      hearts={hearts.unlimited ? null : hearts.hearts}
      onComplete={() =>
        router.replace({
          pathname: '/lesson-complete',
          params: lessonCompletionParams(lesson),
        })
      }
      onExit={() => {
        // Leaving the screen is not abandoning learner state. The active
        // snapshot remains resumable from Home and across an app restart.
        router.dismissTo('/');
      }}
      onWrongAnswer={() => {
        hearts.spend();
        // Reading the balance after the spend is what decides whether the round
        // can continue; the sheet has already shown the explanation by now.
        if (!hearts.unlimited && hearts.hearts !== null && hearts.hearts <= 1) {
          router.replace('/canlar');
        }
      }}
    />
  );
}
