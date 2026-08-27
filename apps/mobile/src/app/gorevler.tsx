import { Redirect, useRouter } from 'expo-router';

import { QuestsScreen } from '@/modules/quests/ui/quests-screen';
import { FEATURES } from '@/shared/config/app-config';

export default function QuestsRoute() {
  const router = useRouter();
  const backToPath = () => router.replace('/');

  if (!FEATURES.quests) {
    return <Redirect href="/" />;
  }

  return <QuestsScreen onClaim={backToPath} onClose={backToPath} />;
}
