import { fireEvent, render, screen } from '@testing-library/react-native';

import { OnboardingScreen } from '@/modules/onboarding/ui/onboarding-screen';

async function renderOnboarding(onFinish = jest.fn()) {
  await render(<OnboardingScreen currentYear={2026} onFinish={onFinish} />);
  await fireEvent.press(screen.getByTestId('onboarding-start'));

  return onFinish;
}

describe('onboarding', () => {
  it('opens on the welcome screen with no account form', async () => {
    await render(<OnboardingScreen currentYear={2026} onFinish={jest.fn()} />);

    expect(screen.getByText(/Soru çöz, seriyi/)).toBeTruthy();
    expect(screen.queryByLabelText(/şifre/i)).toBeNull();
    expect(screen.queryByLabelText(/e-posta/i)).toBeNull();
  });

  it('holds each step until it has been answered', async () => {
    await renderOnboarding();

    expect(screen.getByTestId('onboarding-next').props.accessibilityState).toMatchObject({
      disabled: true,
    });

    await fireEvent.press(screen.getByTestId('onboarding-exam-yks'));

    expect(screen.getByTestId('onboarding-next').props.accessibilityState).toMatchObject({
      disabled: false,
    });
  });

  it('drops the track question when the exam has no track', async () => {
    await renderOnboarding();

    await fireEvent.press(screen.getByTestId('onboarding-exam-lgs'));
    await fireEvent.press(screen.getByTestId('onboarding-next'));

    expect(screen.getByTestId('onboarding-grade')).toBeTruthy();
  });

  it('walks the whole YKS flow and hands back a complete profile', async () => {
    const onFinish = await renderOnboarding();

    await fireEvent.press(screen.getByTestId('onboarding-exam-yks'));
    await fireEvent.press(screen.getByTestId('onboarding-next'));

    await fireEvent.press(screen.getByTestId('onboarding-track-quantitative'));
    await fireEvent.press(screen.getByTestId('onboarding-next'));

    await fireEvent.press(screen.getByTestId('onboarding-grade-grade12'));
    await fireEvent.press(screen.getByTestId('onboarding-year-2027'));
    await fireEvent.press(screen.getByTestId('onboarding-next'));

    await fireEvent.changeText(screen.getByTestId('onboarding-name'), 'Ege');
    await fireEvent.press(screen.getByTestId('onboarding-next'));

    // The two optional steps can be passed without an answer.
    await fireEvent.press(screen.getByTestId('onboarding-skip'));
    await fireEvent.press(screen.getByTestId('onboarding-skip'));

    await fireEvent.press(screen.getByTestId('onboarding-goal-3'));
    await fireEvent.press(screen.getByTestId('onboarding-next'));

    expect(screen.getByText('Hazırsın, Ege.')).toBeTruthy();
    expect(screen.getByText('YKS · Sayısal · 2027 · günde 3 tur')).toBeTruthy();

    await fireEvent.press(screen.getByTestId('onboarding-finish'));

    expect(onFinish).toHaveBeenCalledTimes(1);
    expect(onFinish.mock.calls[0]?.[0]).toMatchObject({
      dailyGoal: 3,
      displayName: 'Ege',
      exam: 'yks',
      targetYear: 2027,
      track: 'quantitative',
    });
  });

  it('goes back to the previous answer without losing it', async () => {
    await renderOnboarding();

    await fireEvent.press(screen.getByTestId('onboarding-exam-yks'));
    await fireEvent.press(screen.getByTestId('onboarding-next'));
    await fireEvent.press(screen.getByTestId('onboarding-back'));

    expect(
      screen.getByTestId('onboarding-exam-yks').props.accessibilityState,
    ).toMatchObject({ selected: true });
  });
});
