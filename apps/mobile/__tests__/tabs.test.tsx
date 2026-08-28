import { fireEvent, render, screen } from '@testing-library/react-native';

import { homePreviewData } from '@/modules/home/model/home-view-model';
import { HomeScreen } from '@/modules/home/ui/home-screen';
import { learnPreviewData } from '@/modules/learn/model/learn-view-model';
import { LearnScreen } from '@/modules/learn/ui/learn-screen';
import { leaguePreviewData } from '@/modules/league/model/league-view-model';
import { LeagueScreen } from '@/modules/league/ui/league-screen';
import { ProfileScreen } from '@/modules/profile/ui/profile-screen';
import { evaluateBadges } from '@/modules/progress/domain/badge-policy';

describe('Ana Sayfa', () => {
  function renderHome(overrides: Partial<Parameters<typeof HomeScreen>[0]> = {}) {
    return render(
      <HomeScreen
        exam="tyt"
        onChangeExam={jest.fn()}
        onContinue={jest.fn()}
        onOpenLeague={jest.fn()}
        onOpenSubject={jest.fn()}
        onSelectTab={jest.fn()}
        viewModel={homePreviewData}
        {...overrides}
      />,
    );
  }

  it('leads with who the learner is and what they were doing', async () => {
    await renderHome();

    expect(screen.getByText('Merhaba, Ege')).toBeTruthy();
    expect(screen.getByText('TYT Tarih')).toBeTruthy();
    expect(screen.getByText('Level 8')).toBeTruthy();
    expect(screen.getByText('850 / 1.000 XP')).toBeTruthy();
  });

  it('speaks both counters instead of leaving them to their icons', async () => {
    await renderHome();

    expect(screen.getByLabelText('12 günlük seri')).toBeTruthy();
    expect(screen.getByLabelText('5 can')).toBeTruthy();
  });

  it('resumes the round the continue card names', async () => {
    const onContinue = jest.fn();

    await renderHome({ onContinue });
    await fireEvent.press(screen.getByTestId('home-continue'));

    expect(onContinue).toHaveBeenCalledWith(homePreviewData.continueCard);
  });

  it('hides the continue card when there is nothing to resume', async () => {
    await renderHome({ viewModel: { ...homePreviewData, continueCard: null } });

    expect(screen.queryByTestId('home-continue')).toBeNull();
  });

  it('opens a subject that has content and refuses one that does not', async () => {
    const onOpenSubject = jest.fn();
    const subjects = [
      homePreviewData.subjects[0]!,
      { ...homePreviewData.subjects[1]!, level: null },
    ];

    await renderHome({ onOpenSubject, viewModel: { ...homePreviewData, subjects } });

    await fireEvent.press(screen.getByTestId('subject-tyt.history'));
    expect(onOpenSubject).toHaveBeenCalledWith('tyt.history');

    const pending = screen.getByTestId('subject-tyt.math');
    expect(pending.props.accessibilityState).toMatchObject({ disabled: true });
    expect(screen.getByLabelText('Matematik, yakında')).toBeTruthy();
  });

  it('shows an unlimited heart count as such', async () => {
    await renderHome({ viewModel: { ...homePreviewData, hearts: null } });

    expect(screen.getByLabelText('Sınırsız can')).toBeTruthy();
  });

  it('marks its own tab selected and routes the rest', async () => {
    const onSelectTab = jest.fn();

    await renderHome({ onSelectTab });

    expect(screen.getByTestId('tab-anasayfa').props.accessibilityState).toMatchObject({
      selected: true,
    });

    await fireEvent.press(screen.getByTestId('tab-ogren'));
    await fireEvent.press(screen.getByTestId('tab-lig'));

    expect(onSelectTab.mock.calls.map(([tab]) => tab)).toEqual(['ogren', 'lig']);
  });
});

describe('Öğren', () => {
  it('lists subjects with their real standing', async () => {
    await render(
      <LearnScreen
        exam="tyt"
        onChangeExam={jest.fn()}
        onOpenSubject={jest.fn()}
        onSelectTab={jest.fn()}
        viewModel={learnPreviewData}
      />,
    );

    expect(screen.getByText('Level 6 · 2 / 8 ünite · 650 XP')).toBeTruthy();
    expect(screen.getByText('Yeni başla · 5 ünite')).toBeTruthy();
  });

  it('does not let a subject without content be opened', async () => {
    const onOpenSubject = jest.fn();

    await render(
      <LearnScreen
        exam="tyt"
        onChangeExam={jest.fn()}
        onOpenSubject={onOpenSubject}
        onSelectTab={jest.fn()}
        viewModel={{
          ...learnPreviewData,
          rows: [
            {
              ...learnPreviewData.rows[0]!,
              detail: 'Yakında · içerik hazırlanıyor',
              locked: true,
            },
          ],
        }}
      />,
    );

    await fireEvent.press(screen.getByTestId('learn-subject-tyt.history'));

    expect(onOpenSubject).not.toHaveBeenCalled();
  });

  it('switches the exam filter', async () => {
    const onChangeExam = jest.fn();

    await render(
      <LearnScreen
        exam="tyt"
        onChangeExam={onChangeExam}
        onOpenSubject={jest.fn()}
        onSelectTab={jest.fn()}
        viewModel={learnPreviewData}
      />,
    );

    await fireEvent.press(screen.getByTestId('segment-ayt'));

    expect(onChangeExam).toHaveBeenCalledWith('ayt');
  });
});

describe('Lig', () => {
  it('ranks every row in words, not by tint alone', async () => {
    await render(<LeagueScreen onSelectTab={jest.fn()} viewModel={leaguePreviewData} />);

    expect(screen.getByText('Zümrüt Lig')).toBeTruthy();
    expect(screen.getByLabelText('1. Deniz, 4820 XP, 18 günlük seri')).toBeTruthy();
    expect(screen.getByLabelText('7. Sen, 2450 XP, 12 günlük seri')).toBeTruthy();
  });

  it('marks the promotion zone once, above the rows it covers', async () => {
    await render(<LeagueScreen onSelectTab={jest.fn()} viewModel={leaguePreviewData} />);

    expect(screen.getAllByText('YÜKSELME BÖLGESİ')).toHaveLength(1);
  });
});

describe('Profil', () => {
  const viewModel = {
    badges: evaluateBadges({
      bestStreak: 12,
      completedUnits: 1,
      correctAnswers: 386,
      highestSubjectLevel: 5,
      lessonsCompleted: 48,
      perfectRounds: 0,
      totalXp: 2840,
    }),
    description: 'YKS · Sayısal',
    displayName: 'Ege',
    initial: 'E',
    level: 8,
    stats: [
      { id: 'rounds', label: 'Çalışma', value: '48' },
      { id: 'correct', label: 'Doğru', value: '386' },
      { id: 'streak', label: 'En uzun seri', value: '21' },
    ],
    streak: 12,
    totalXp: 2840,
  };

  function renderProfile(overrides: Partial<Parameters<typeof ProfileScreen>[0]> = {}) {
    return render(
      <ProfileScreen
        onOpenLeagueHistory={jest.fn()}
        onOpenPremium={jest.fn()}
        onOpenSettings={jest.fn()}
        onSelectTab={jest.fn()}
        premiumActive={false}
        viewModel={viewModel}
        {...overrides}
      />,
    );
  }

  it('shows the learner’s own local record', async () => {
    await renderProfile();

    expect(screen.getByText('Ege')).toBeTruthy();
    expect(screen.getByText('YKS · Sayısal')).toBeTruthy();
    expect(screen.getByText('2.840 XP')).toBeTruthy();
  });

  it('keeps unearned badges visible and says they are unearned', async () => {
    await renderProfile();

    expect(screen.getByLabelText('İlk Çalışma')).toBeTruthy();
    expect(screen.getByLabelText('30 Gün, henüz kazanılmadı')).toBeTruthy();
  });

  it('routes each menu row to its own destination', async () => {
    const onOpenPremium = jest.fn();
    const onOpenSettings = jest.fn();

    await renderProfile({ onOpenPremium, onOpenSettings });

    await fireEvent.press(screen.getByTestId('profile-menu-Premium'));
    await fireEvent.press(screen.getByTestId('profile-menu-Ayarlar'));

    expect(onOpenPremium).toHaveBeenCalledTimes(1);
    expect(onOpenSettings).toHaveBeenCalledTimes(1);
  });
});
