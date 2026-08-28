import { fireEvent, render, screen } from '@testing-library/react-native';

import { renderWithSession } from './support/render-with-session';

import CanlarRoute from '@/app/canlar';
import IndexRoute from '@/app/index';
import LigRoute from '@/app/lig';
import LearnRoute from '@/app/ogren/index';
import NotFoundRoute from '@/app/+not-found';
import PremiumRoute from '@/app/premium';

const mockBack = jest.fn();
const mockCanGoBack = jest.fn(() => true);
const mockDismissTo = jest.fn();
const mockPush = jest.fn();
const mockReplace = jest.fn();

jest.mock('expo-router', () => ({
  Redirect: () => null,
  useFocusEffect: jest.fn(),
  useLocalSearchParams: () => ({ subjectId: 'tyt.history' }),
  useRouter: () => ({
    back: mockBack,
    canGoBack: mockCanGoBack,
    dismissTo: mockDismissTo,
    push: mockPush,
    replace: mockReplace,
  }),
}));

beforeEach(() => {
  mockBack.mockClear();
  mockDismissTo.mockClear();
  mockPush.mockClear();
  mockReplace.mockClear();
});

describe('shell tabs', () => {
  it('swaps sections rather than stacking them', async () => {
    await renderWithSession(<IndexRoute />);

    await fireEvent.press(screen.getByTestId('tab-ogren'));
    await fireEvent.press(screen.getByTestId('tab-profil'));

    expect(mockReplace.mock.calls.map(([route]) => route)).toEqual(['/ogren', '/profil']);
  });

  it('does not re-navigate when the active tab is tapped', async () => {
    await renderWithSession(<IndexRoute />);

    await fireEvent.press(screen.getByTestId('tab-anasayfa'));

    expect(mockReplace).not.toHaveBeenCalled();
  });

  it('keeps all four tabs present on every shell screen', async () => {
    await renderWithSession(<LearnRoute />);

    for (const tab of ['anasayfa', 'ogren', 'lig', 'profil']) {
      expect(screen.getByTestId(`tab-${tab}`)).toBeTruthy();
    }
  });
});

describe('routes', () => {
  it('opens a subject path from the home tab', async () => {
    await renderWithSession(<IndexRoute />);

    await fireEvent.press(screen.getByTestId('subject-tyt.history'));

    expect(mockPush).toHaveBeenCalledWith('/ogren/tyt.history');
  });

  it('starts the round the continue card names', async () => {
    await renderWithSession(<IndexRoute />);

    await fireEvent.press(screen.getByTestId('home-continue'));

    expect(mockPush).toHaveBeenCalledWith('/lesson');
  });

  it('sends the out-of-hearts screen to Premium rather than to an ad', async () => {
    await renderWithSession(<CanlarRoute />);

    await fireEvent.press(screen.getByTestId('hearts-premium'));

    expect(mockReplace).toHaveBeenCalledWith('/premium');
  });

  it('dismisses the premium sheet back where the learner came from', async () => {
    await render(<PremiumRoute />);

    await fireEvent.press(screen.getByTestId('premium-dismiss'));

    expect(mockBack).toHaveBeenCalledTimes(1);
  });

  it('gives a stale deep link a way back', async () => {
    await render(<NotFoundRoute />);

    expect(screen.getByTestId('not-found-screen')).toBeTruthy();

    await fireEvent.press(screen.getByTestId('message-action'));

    expect(mockReplace).toHaveBeenCalledWith('/');
  });
});

describe('league gate', () => {
  it('keeps the tab in place while the leaderboard does not exist', async () => {
    await render(<LigRoute />);

    // In a design-preview test build the league renders; in a pilot build the
    // same route explains itself instead of ranking invented people.
    expect(
      screen.queryByTestId('league-screen') ?? screen.getByTestId('league-pending'),
    ).toBeTruthy();
  });
});
