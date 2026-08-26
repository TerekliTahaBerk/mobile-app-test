import { useRouter } from 'expo-router';

import { LessonCompleteScreen } from '@/modules/learning/ui/lesson-complete-screen';

export default function LessonCompleteRoute() {
  const router = useRouter();

  return <LessonCompleteScreen onCollect={() => router.replace('/iz')} />;
}
