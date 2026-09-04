import { fireEvent, render, screen } from '@testing-library/react-native';

import { PrivacyPolicyScreen } from '@/modules/legal/ui/privacy-policy-screen';

describe('privacy policy', () => {
  it('covers the production data behaviour and remains navigable', async () => {
    const onBack = jest.fn();
    await render(<PrivacyPolicyScreen onBack={onBack} />);

    expect(screen.getByTestId('privacy-policy-screen')).toBeTruthy();
    expect(screen.getByText('Bu cihazda tutulan veriler')).toBeTruthy();
    expect(screen.getByText('Aktarım ve hata raporları')).toBeTruthy();
    expect(screen.getByText('Çocuk ve genç kullanıcılar')).toBeTruthy();
    expect(screen.getByText('Hakların')).toBeTruthy();
    expect(screen.getByText(/Sentry’ye iletilebilir/)).toBeTruthy();

    await fireEvent.press(screen.getByTestId('privacy-policy-back'));
    expect(onBack).toHaveBeenCalledTimes(1);
  });
});
