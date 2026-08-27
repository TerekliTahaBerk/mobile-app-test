import { useRouter } from 'expo-router';

import { HomeScreen } from '@/modules/home/ui/home-screen';
import { useLessonSession } from '@/modules/learning/application/lesson-session-store';
import { useTabNavigation } from '@/shared/navigation/use-tab-navigation';

export default function IndexRoute() {
  const router = useRouter();
  const { begin } = useLessonSession();

  return (
    <HomeScreen
      onSelectTab={useTabNavigation('yol')}
      onStartLevel={(lessonId, pathNodeId) => {
        begin(lessonId, pathNodeId);
        router.push({ params: { lessonId }, pathname: '/lesson-intro' });
      }}
    />
  );
}
