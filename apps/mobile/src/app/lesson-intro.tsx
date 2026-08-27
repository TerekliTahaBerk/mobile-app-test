import { useLocalSearchParams, useRouter } from 'expo-router';

import { LessonIntroScreen } from '@/modules/learning/ui/lesson-intro-screen';

export default function LessonIntroRoute() {
  const router = useRouter();
  const { lessonId } = useLocalSearchParams<{ lessonId: string }>();

  return (
    <LessonIntroScreen
      lessonId={lessonId}
      onBack={() => router.back()}
      onContinue={() => router.replace('/lesson')}
    />
  );
}
