import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';

import { OnboardingScreen } from '@/modules/onboarding/ui/onboarding-screen';

async function renderOnboarding(onFinish = jest.fn()) {
  await render(<OnboardingScreen currentYear={2026} onFinish={onFinish} />);
  await fireEvent.press(screen.getByTestId('onboarding-start'));

  return onFinish;
}

async function reachSummary() {
  await fireEvent.press(screen.getByTestId('onboarding-exam-yks'));
  await fireEvent.press(screen.getByTestId('onboarding-next'));
  await fireEvent.press(screen.getByTestId('onboarding-track-quantitative'));
  await fireEvent.press(screen.getByTestId('onboarding-next'));
  await fireEvent.press(screen.getByTestId('onboarding-grade-grade12'));
  await fireEvent.press(screen.getByTestId('onboarding-year-2027'));
  await fireEvent.press(screen.getByTestId('onboarding-next'));
  await fireEvent.changeText(screen.getByTestId('onboarding-name'), 'Ege');
  await fireEvent.press(screen.getByTestId('onboarding-next'));
  await fireEvent.press(screen.getByTestId('onboarding-skip'));
  await fireEvent.press(screen.getByTestId('onboarding-skip'));
  await fireEvent.press(screen.getByTestId('onboarding-goal-3'));
  await fireEvent.press(screen.getByTestId('onboarding-next'));
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

  it('marks unsupported LGS as unavailable before profile completion', async () => {
    await renderOnboarding();

    await fireEvent.press(screen.getByTestId('onboarding-exam-lgs'));

    expect(screen.getByTestId('onboarding-exam-lgs').props.accessibilityState).toMatchObject({
      disabled: true,
      selected: false,
    });
    expect(screen.getByTestId('onboarding-next').props.accessibilityState).toMatchObject({
      disabled: true,
    });
  });

  it('removes LGS from production onboarding', async () => {
    await render(
      <OnboardingScreen currentYear={2026} onFinish={jest.fn()} showLgsOption={false} />,
    );
    await fireEvent.press(screen.getByTestId('onboarding-start'));

    expect(screen.queryByTestId('onboarding-exam-lgs')).toBeNull();
    expect(screen.queryByText('LGS')).toBeNull();
  });

  it('walks the whole YKS flow and hands back a complete profile', async () => {
    const onFinish = await renderOnboarding();

    await reachSummary();

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

  it('shows a recoverable error and stays put when profile persistence fails', async () => {
    const onFinish = jest.fn().mockRejectedValueOnce(new Error('disk full')).mockResolvedValue(undefined);
    await renderOnboarding(onFinish);
    await reachSummary();

    await fireEvent.press(screen.getByTestId('onboarding-finish'));
    await waitFor(() => expect(screen.getByTestId('onboarding-save-error')).toBeTruthy());
    expect(screen.getByTestId('onboarding-summary')).toBeTruthy();

    await fireEvent.press(screen.getByTestId('onboarding-finish'));
    await waitFor(() => expect(onFinish).toHaveBeenCalledTimes(2));
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
