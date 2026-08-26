import { fireEvent, render, screen } from '@testing-library/react-native';

import IndexScreen from '@/app/index';

const mockPush = jest.fn();

jest.mock('expo-router', () => ({
  useRouter: () => ({ push: mockPush }),
}));

describe('home route', () => {
  beforeEach(() => {
    mockPush.mockClear();
  });

  it('renders the branded path states and requests navigation to the lesson shell', async () => {
    await render(<IndexScreen />);

    expect(screen.getByText('TEKRARLA')).toBeTruthy();
    expect(screen.getByText('12 gün iz')).toBeTruthy();
    expect(screen.getByText('Osmanlı’da Yenileşme')).toBeTruthy();
    expect(screen.getByLabelText(/Kısa tekrar\. Kilitli\./)).toBeTruthy();

    fireEvent.press(screen.getByRole('button', { name: 'Buradan devam et' }));

    expect(mockPush).toHaveBeenCalledWith('/lesson-preview');
  });
});
