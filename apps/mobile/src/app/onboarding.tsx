import { useRouter } from 'expo-router';

import { useLearnerProfile } from '@/modules/learner/application/learner-profile-store';
import { useLessonSession } from '@/modules/learning/application/lesson-session-store';
import { OnboardingScreen } from '@/modules/onboarding/ui/onboarding-screen';
import { trackEvent } from '@/shared/observability/observability';
import { FEATURES } from '@/shared/config/app-config';

export default function OnboardingRoute() {
  const router = useRouter();
  const profileStore = useLearnerProfile();
  const { beginPlacement } = useLessonSession();

  return (
    <OnboardingScreen
      currentYear={new Date().getFullYear()}
      showLgsOption={FEATURES.lgs}
      onFinish={async (profile) => {
        await profileStore.save(profile);
        trackEvent('onboarding_completed', { exam: 'yks' });

        if (profile.startingPoint !== 'placement') {
          router.replace('/');
          return;
        }

        try {
          await beginPlacement();
          router.replace({ pathname: '/lesson', params: { returnTo: 'placement' } });
        } catch {
          // A diagnostic that cannot be assembled must not trap a new learner on
          // onboarding; the path is still there to start from the beginning.
          router.replace('/');
        }
      }}
    />
  );
}
