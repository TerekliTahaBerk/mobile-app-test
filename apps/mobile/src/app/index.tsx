import { useRouter } from 'expo-router';

import { HomeScreen } from '@/modules/home/ui/home-screen';
import { useTabNavigation } from '@/shared/navigation/use-tab-navigation';

export default function IndexRoute() {
  const router = useRouter();

  return (
    <HomeScreen
      onSelectTab={useTabNavigation('yol')}
      onStartLevel={() => router.push('/lesson-intro')}
    />
  );
}
