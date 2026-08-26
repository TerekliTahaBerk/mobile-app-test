import { fireEvent, render, screen } from '@testing-library/react-native';

import IndexScreen from '@/app/index';

const mockPush = jest.fn();

jest.mock('expo-router', () => ({
  useRouter: () => ({ push: mockPush }),
}));

describe('foundation route', () => {
  it('renders and requests navigation to the second placeholder', async () => {
    await render(<IndexScreen />);

    expect(screen.getByText('Mobil temel hazır')).toBeTruthy();

    fireEvent.press(screen.getByRole('button', { name: 'Yönlendirmeyi dene' }));

    expect(mockPush).toHaveBeenCalledWith('/foundation');
  });
});
