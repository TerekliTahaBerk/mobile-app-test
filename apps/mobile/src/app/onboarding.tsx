import { useRouter } from 'expo-router';

import { OnboardingScreen } from '@/modules/onboarding/ui/onboarding-screen';

export default function OnboardingRoute() {
  const router = useRouter();

  return <OnboardingScreen onFinish={() => router.replace('/')} />;
}
