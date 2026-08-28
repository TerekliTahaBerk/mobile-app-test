import { useRouter } from 'expo-router';

import { OnboardingScreen } from '@/modules/onboarding/ui/onboarding-screen';
import { useRepositories } from '@/modules/progress/application/progress-store';

export default function OnboardingRoute() {
  const router = useRouter();
  const repositories = useRepositories();

  return (
    <OnboardingScreen
      currentYear={new Date().getFullYear()}
      onFinish={(profile) => {
        // The answers only shape what the learner sees first, so a failed write
        // must not block them from starting.
        void repositories.profile.write(profile).catch(() => {});
        router.replace('/');
      }}
    />
  );
}
