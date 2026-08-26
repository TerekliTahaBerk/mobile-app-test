import { useRouter } from 'expo-router';

import { HomeScreen } from '@/modules/home/ui/home-screen';

export default function IndexRoute() {
  const router = useRouter();

  return (
    <HomeScreen
      onOpenQuests={() => router.push('/gorevler')}
      onStartLevel={() => router.push('/lesson-intro')}
    />
  );
}
