import { useRouter } from 'expo-router';

import { useHearts } from '@/modules/hearts/application/hearts-store';
import { useLessonSession } from '@/modules/learning/application/lesson-session-store';
import { LessonScreen } from '@/modules/learning/ui/lesson-screen';
import { MessageScreen } from '@/shared/ui/feedback/message-screen';

export default function LessonRoute() {
  const router = useRouter();
  const { abandon, lesson } = useLessonSession();
  const hearts = useHearts();

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
      onComplete={() => router.replace('/lesson-complete')}
      onExit={() => {
        abandon();
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
