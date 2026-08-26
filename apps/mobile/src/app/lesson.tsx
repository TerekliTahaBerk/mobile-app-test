import { useRouter } from 'expo-router';

import { LessonScreen } from '@/modules/learning/ui/lesson-screen';

export default function LessonRoute() {
  const router = useRouter();

  return (
    <LessonScreen
      onComplete={() => router.replace('/lesson-complete')}
      onExit={() => router.dismissTo('/')}
    />
  );
}
