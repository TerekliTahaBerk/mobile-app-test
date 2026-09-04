import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';

import { testClock } from './support/render-with-session';

import OnboardingRoute from '@/app/onboarding';
import { LearnerProfileProvider } from '@/modules/learner/application/learner-profile-store';
import { LessonSessionProvider } from '@/modules/learning/application/lesson-session-store';
import type { LearnerProfileRepository } from '@/modules/progress/application/repositories';

const mockReplace = jest.fn();

jest.mock('expo-router', () => ({
  Redirect: () => null,
  useFocusEffect: jest.fn(),
  useLocalSearchParams: () => ({}),
  usePathname: () => '/onboarding',
  useRouter: () => ({ canGoBack: () => false, replace: mockReplace }),
}));

const repository: LearnerProfileRepository = {
  read: async () => null,
  write: async () => undefined,
};

function renderOnboardingRoute() {
  return render(
    <LearnerProfileProvider repository={repository}>
      <LessonSessionProvider clock={testClock}>
        <OnboardingRoute />
      </LessonSessionProvider>
    </LearnerProfileProvider>,
  );
}

/** Walks every step, choosing the given starting point on the one that offers it. */
async function completeOnboarding(startingPoint: 'placement' | 'scratch') {
  await fireEvent.press(screen.getByTestId('onboarding-start'));
  await fireEvent.press(screen.getByTestId('onboarding-exam-yks'));
  await fireEvent.press(screen.getByTestId('onboarding-next'));
  await fireEvent.press(screen.getByTestId('onboarding-grade-grade12'));
  await fireEvent.press(screen.getByTestId('onboarding-next'));
  await fireEvent.changeText(screen.getByTestId('onboarding-name'), 'Ege');
  await fireEvent.press(screen.getByTestId('onboarding-next'));
  await fireEvent.press(screen.getByTestId(`onboarding-start-${startingPoint}`));
  await fireEvent.press(screen.getByTestId('onboarding-next'));
  await fireEvent.press(screen.getByTestId('onboarding-goal-3'));
  await fireEvent.press(screen.getByTestId('onboarding-next'));
  await fireEvent.press(screen.getByTestId('onboarding-finish'));
}

beforeEach(() => {
  mockReplace.mockClear();
});

describe('starting diagnostic flow', () => {
  it('opens the diagnostic when the learner asks to be measured', async () => {
    await renderOnboardingRoute();

    await completeOnboarding('placement');

    await waitFor(() =>
      expect(mockReplace).toHaveBeenCalledWith({
        params: { returnTo: 'placement' },
        pathname: '/lesson',
      }),
    );
  });

  it('goes straight to Home when the learner chooses to start from scratch', async () => {
    await renderOnboardingRoute();

    await completeOnboarding('scratch');

    await waitFor(() => expect(mockReplace).toHaveBeenCalledWith('/'));
  });

  it('promises a map rather than a shortcut through the path', async () => {
    await renderOnboardingRoute();

    await fireEvent.press(screen.getByTestId('onboarding-start'));
    await fireEvent.press(screen.getByTestId('onboarding-exam-yks'));
    await fireEvent.press(screen.getByTestId('onboarding-next'));
    await fireEvent.press(screen.getByTestId('onboarding-grade-grade12'));
    await fireEvent.press(screen.getByTestId('onboarding-next'));
    await fireEvent.changeText(screen.getByTestId('onboarding-name'), 'Ege');
    await fireEvent.press(screen.getByTestId('onboarding-next'));

    expect(screen.getByText('Kısa tur · konu haritanı çıkarayım')).toBeTruthy();
    expect(screen.queryByText(/doğru üniteden başla/)).toBeNull();
  });
});
