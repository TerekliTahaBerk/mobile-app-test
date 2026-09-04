import { render, screen } from '@testing-library/react-native';

import { renderWithSession } from './support/render-with-session';

import CanlarRoute from '@/app/canlar';
import LeagueRoute from '@/app/lig';
import PremiumRoute from '@/app/premium';
import { homePreviewData } from '@/modules/home/model/home-view-model';
import { HomeScreen } from '@/modules/home/ui/home-screen';
import { APP_MODE } from '@/shared/config/app-config';

jest.mock('expo-router', () => {
  const React = jest.requireActual<typeof import('react')>('react');
  const { View } = jest.requireActual<typeof import('react-native')>('react-native');

  return {
    Redirect: ({ href }: { href: string }) =>
      React.createElement(View, { testID: `redirect-${href === '/' ? 'home' : href}` }),
    useRouter: () => ({
      back: jest.fn(),
      canGoBack: () => true,
      replace: jest.fn(),
    }),
  };
});

describe('build-mode route gates', () => {
  it('keeps the hearts economy preview-only at its deep-link boundary', async () => {
    await renderWithSession(<CanlarRoute />);
    expect(
      screen.getByTestId(APP_MODE === 'productionPilot' ? 'hearts-disabled' : 'hearts-empty-screen'),
    ).toBeTruthy();
  });

  it('keeps Premium preview-only at its deep-link boundary', async () => {
    await render(<PremiumRoute />);
    if (APP_MODE === 'productionPilot') {
      expect(screen.getByTestId('redirect-home')).toBeTruthy();
      expect(screen.queryByTestId('premium-disabled')).toBeNull();
      expect(screen.queryByTestId('premium-screen')).toBeNull();
    } else {
      expect(screen.getByTestId('premium-screen')).toBeTruthy();
    }
  });

  it('never exposes fictional league data through a production deep link', async () => {
    await render(<LeagueRoute />);
    if (APP_MODE === 'productionPilot') {
      expect(screen.getByTestId('redirect-home')).toBeTruthy();
      expect(screen.queryByTestId('league-pending')).toBeNull();
      expect(screen.queryByTestId('league-screen')).toBeNull();
    } else {
      expect(screen.getByTestId('league-screen')).toBeTruthy();
    }
  });

  it('shows league navigation only in design preview', async () => {
    await render(
      <HomeScreen
        onContinue={jest.fn()}
        onOpenLeague={APP_MODE === 'designPreview' ? jest.fn() : undefined}
        onSelectTab={jest.fn()}
        onStartDailyPlan={jest.fn()}
        viewModel={homePreviewData}
      />,
    );

    if (APP_MODE === 'productionPilot') {
      expect(screen.queryByTestId('tab-lig')).toBeNull();
      expect(screen.queryByTestId('home-league-row')).toBeNull();
    } else {
      expect(screen.getByTestId('tab-lig')).toBeTruthy();
      expect(screen.getByTestId('home-league-row')).toBeTruthy();
    }
  });
});
