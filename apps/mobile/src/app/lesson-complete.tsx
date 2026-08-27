import { useRouter } from 'expo-router';

import { useLessonSession } from '@/modules/learning/application/lesson-session-store';
import { LessonCompleteScreen } from '@/modules/learning/ui/lesson-complete-screen';

export default function LessonCompleteRoute() {
  const router = useRouter();
  const { discard } = useLessonSession();

  return (
    <LessonCompleteScreen
      onCollect={() => {
        discard();
        router.replace('/iz');
      }}
    />
  );
}
