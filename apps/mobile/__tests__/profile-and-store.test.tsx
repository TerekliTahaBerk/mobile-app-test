import { fireEvent, render, screen } from '@testing-library/react-native';

import { ProfileScreen } from '@/modules/profile/ui/profile-screen';
import { StoreScreen } from '@/modules/store/ui/store-screen';

describe('profile and league', () => {
  it('opens on the profile segment and shows the learner overview', async () => {
    await render(
      <ProfileScreen activeTab="profil" initialTab="profile" onSelectTab={jest.fn()} />,
    );

    expect(screen.getByText('Elif Yılmaz')).toBeTruthy();
    expect(screen.getByLabelText('Günlük iz: 13')).toBeTruthy();
    expect(screen.getByTestId('profile-tab-profile').props.accessibilityState).toMatchObject({
      selected: true,
    });
  });

  it('switches to the league segment and ranks the learner without colour alone', async () => {
    await render(
      <ProfileScreen activeTab="profil" initialTab="profile" onSelectTab={jest.fn()} />,
    );

    await fireEvent.press(screen.getByTestId('profile-tab-league'));

    expect(screen.getByText('Altın Kalem Ligi')).toBeTruthy();
    // Rank, name and promotion status are all spoken, not implied by tint.
    expect(screen.getByLabelText(/1\. sıra\. Mert Kaya\..*Yükselme bölgesinde/)).toBeTruthy();
    expect(screen.getByLabelText(/4\. sıra\. Elif Yılmaz \(sen\)/)).toBeTruthy();
  });

  it('opens directly on the league segment when routed from the Lig tab', async () => {
    await render(<ProfileScreen activeTab="lig" initialTab="league" onSelectTab={jest.fn()} />);

    expect(screen.getByText('Altın Kalem Ligi')).toBeTruthy();
    expect(screen.getByTestId('tab-lig').props.accessibilityState).toMatchObject({
      selected: true,
    });
  });

  it('shows only real accountless local stats when production data is supplied', async () => {
    await render(
      <ProfileScreen
        activeTab="profil"
        initialTab="profile"
        localStats={{
          completedLevels: 1,
          iz: 2,
          lessonsCompleted: 3,
          reviewsCompleted: 1,
          totalXp: 85,
        }}
        onSelectTab={jest.fn()}
      />,
    );

    expect(screen.getByText('Bu cihazdaki ilerleme')).toBeTruthy();
    expect(screen.getByLabelText('Toplam XP: 85')).toBeTruthy();
    expect(screen.queryByText('Elif Yılmaz')).toBeNull();
    expect(screen.queryByTestId('profile-tab-league')).toBeNull();
  });
});

describe('store', () => {
  it('preselects the yearly plan and drives the CTA from the selection', async () => {
    await render(<StoreScreen onClose={jest.fn()} />);

    expect(screen.getByTestId('store-plan-yearly').props.accessibilityState).toMatchObject({
      selected: true,
    });
    expect(screen.getByText('YILLIK PLANI BAŞLAT')).toBeTruthy();

    await fireEvent.press(screen.getByTestId('store-plan-monthly'));

    expect(screen.getByText('AYLIK PLANI BAŞLAT')).toBeTruthy();
    expect(screen.getByTestId('store-plan-monthly').props.accessibilityState).toMatchObject({
      selected: true,
    });
  });

  it('keeps the purchase action inert — there is no billing integration', async () => {
    await render(<StoreScreen onClose={jest.fn()} />);

    // Pressing must not throw and must not navigate anywhere.
    await fireEvent.press(screen.getByTestId('store-cta'));

    expect(screen.getByTestId('store-screen')).toBeTruthy();
  });
});
