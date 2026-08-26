import { useRouter } from 'expo-router';

import { QuestsScreen } from '@/modules/quests/ui/quests-screen';

export default function QuestsRoute() {
  const router = useRouter();

  return <QuestsScreen onClaim={() => router.back()} onClose={() => router.back()} />;
}
