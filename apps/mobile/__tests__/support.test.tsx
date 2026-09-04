import { fireEvent, render, screen } from '@testing-library/react-native';

import { SupportScreen } from '@/modules/legal/ui/support-screen';

describe('support', () => {
  it('publishes contact, local-progress, reset, reminder, and offline guidance', async () => {
    const onBack = jest.fn();
    await render(<SupportScreen onBack={onBack} />);

    expect(screen.getByTestId('support-screen')).toBeTruthy();
    expect(screen.getByText('Bize ulaş')).toBeTruthy();
    expect(screen.getByText('İlerlemem nerede?')).toBeTruthy();
    expect(screen.getByText('İlerlemeyi sıfırla')).toBeTruthy();
    expect(screen.getByText('Bildirimler çalışmıyor')).toBeTruthy();
    expect(screen.getByText('Çevrimdışı kullanım')).toBeTruthy();
    expect(screen.getByText(/terekli@tahaberk.com/)).toBeTruthy();

    await fireEvent.press(screen.getByTestId('support-back'));
    expect(onBack).toHaveBeenCalledTimes(1);
  });
});
