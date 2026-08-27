import { useRouter } from 'expo-router';

import { QuestsScreen } from '@/modules/quests/ui/quests-screen';

export default function QuestsRoute() {
  const router = useRouter();
  const backToPath = () => router.replace('/');

  return <QuestsScreen onClaim={backToPath} onClose={backToPath} />;
}
