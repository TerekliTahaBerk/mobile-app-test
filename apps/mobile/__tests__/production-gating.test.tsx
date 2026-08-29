import { render, screen } from '@testing-library/react-native';

import { renderWithSession } from './support/render-with-session';

import CanlarRoute from '@/app/canlar';
import LeagueRoute from '@/app/lig';
import PremiumRoute from '@/app/premium';
import { homePreviewData } from '@/modules/home/model/home-view-model';
import { HomeScreen } from '@/modules/home/ui/home-screen';
import { APP_MODE } from '@/shared/config/app-config';

jest.mock('expo-router', () => ({
  useRouter: () => ({
    back: jest.fn(),
    canGoBack: () => true,
    replace: jest.fn(),
  }),
}));

describe('build-mode route gates', () => {
  it('keeps the hearts economy preview-only at its deep-link boundary', async () => {
    await renderWithSession(<CanlarRoute />);
    expect(
      screen.getByTestId(APP_MODE === 'productionPilot' ? 'hearts-disabled' : 'hearts-empty-screen'),
    ).toBeTruthy();
  });

  it('keeps Premium preview-only at its deep-link boundary', async () => {
    await render(<PremiumRoute />);
    expect(
      screen.getByTestId(APP_MODE === 'productionPilot' ? 'premium-disabled' : 'premium-screen'),
    ).toBeTruthy();
  });

  it('never exposes fictional league data through a production deep link', async () => {
    await render(<LeagueRoute />);
    expect(
      screen.getByTestId(APP_MODE === 'productionPilot' ? 'league-pending' : 'league-screen'),
    ).toBeTruthy();
  });

  it('keeps the league destination stable without exposing fictional standings', async () => {
    await render(
      <HomeScreen
        onContinue={jest.fn()}
        onOpenLeague={jest.fn()}
        onSelectTab={jest.fn()}
        onStartDailyPlan={jest.fn()}
        viewModel={homePreviewData}
      />,
    );

    expect(screen.getByTestId('tab-lig')).toBeTruthy();
    expect(screen.getByTestId('home-league-row')).toBeTruthy();
  });
});
