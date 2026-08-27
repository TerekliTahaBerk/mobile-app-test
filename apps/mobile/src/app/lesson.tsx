import { useRouter } from 'expo-router';

import { useLessonSession } from '@/modules/learning/application/lesson-session-store';
import { LessonScreen } from '@/modules/learning/ui/lesson-screen';
import { MessageScreen } from '@/shared/ui/feedback/message-screen';

export default function LessonRoute() {
  const router = useRouter();
  const { lesson } = useLessonSession();

  if (lesson === null) {
    return (
      <MessageScreen
        action={{ label: 'YOLA DÖN', onPress: () => router.replace('/') }}
        body="Devam edecek etkin bir ders bulunamadı."
        heading="Ders hazır değil"
        mood="thinking"
        testID="lesson-missing"
      />
    );
  }

  return (
    <LessonScreen
      onComplete={() => router.replace('/lesson-complete')}
      onExit={() => router.dismissTo('/')}
    />
  );
}
