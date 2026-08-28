import { useRouter } from 'expo-router';

import { useLearnerProfile } from '@/modules/learner/application/learner-profile-store';
import { OnboardingScreen } from '@/modules/onboarding/ui/onboarding-screen';
import { trackEvent } from '@/shared/observability/observability';

export default function OnboardingRoute() {
  const router = useRouter();
  const profileStore = useLearnerProfile();

  return (
    <OnboardingScreen
      currentYear={new Date().getFullYear()}
      onFinish={async (profile) => {
        await profileStore.save(profile);
        trackEvent('onboarding_completed', { exam: 'yks' });
        router.replace('/');
      }}
    />
  );
}
