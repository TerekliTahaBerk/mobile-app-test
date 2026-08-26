import { useRouter } from 'expo-router';

import { LessonIntroScreen } from '@/modules/learning/ui/lesson-intro-screen';

export default function LessonIntroRoute() {
  const router = useRouter();

  return (
    <LessonIntroScreen onBack={() => router.back()} onContinue={() => router.replace('/lesson')} />
  );
}
