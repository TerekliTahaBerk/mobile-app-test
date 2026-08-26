import { useRouter } from 'expo-router';

import { IzCelebrationScreen } from '@/modules/iz/ui/iz-celebration-screen';

export default function IzRoute() {
  const router = useRouter();

  return <IzCelebrationScreen onContinue={() => router.dismissTo('/')} />;
}
