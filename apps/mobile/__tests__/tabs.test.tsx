import { fireEvent, render, screen } from '@testing-library/react-native';

import { homePreviewData } from '@/modules/home/model/home-view-model';
import { HomeScreen } from '@/modules/home/ui/home-screen';
import { learnPreviewData } from '@/modules/learn/model/learn-view-model';
import { LearnScreen } from '@/modules/learn/ui/learn-screen';
import { leaguePreviewData } from '@/modules/league/model/league-view-model';
import { LeaguePendingScreen } from '@/modules/league/ui/league-pending-screen';
import { LeagueScreen } from '@/modules/league/ui/league-screen';
import { ProfileScreen } from '@/modules/profile/ui/profile-screen';
import { evaluateBadges } from '@/modules/progress/domain/badge-policy';

describe('Ana Sayfa', () => {
  function renderHome(overrides: Partial<Parameters<typeof HomeScreen>[0]> = {}) {
    return render(
      <HomeScreen
        onContinue={jest.fn()}
        onOpenLeague={jest.fn()}
        onSelectTab={jest.fn()}
        onStartDailyPlan={jest.fn()}
        viewModel={homePreviewData}
        {...overrides}
      />,
    );
  }

  it('leads with who the learner is and what they were doing', async () => {
    await renderHome();

    expect(screen.getByText('Merhaba, Ege')).toBeTruthy();
    expect(screen.getByText('Bugün 12 soru')).toBeTruthy();
    expect(screen.getByText('Level 8')).toBeTruthy();
    expect(screen.getByText('850 / 1.000 XP')).toBeTruthy();
  });

  it('speaks both counters instead of leaving them to their icons', async () => {
    await renderHome();

    expect(screen.getByLabelText('12 günlük seri')).toBeTruthy();
    expect(screen.getByLabelText('5 can')).toBeTruthy();
  });

  it('explains what today is made of before asking for it', async () => {
    const onStartDailyPlan = jest.fn();

    await renderHome({ onStartDailyPlan });

    expect(screen.getByText('4 farklı konudan karışık')).toBeTruthy();
    expect(screen.getByText('zayıf konu sorusu')).toBeTruthy();
    expect(screen.getByText('zamanı gelen tekrar')).toBeTruthy();

    await fireEvent.press(screen.getByTestId('home-daily-plan'));

    expect(onStartDailyPlan).toHaveBeenCalledTimes(1);
  });

  it('keeps today visible but makes the unfinished round the first action', async () => {
    const onContinue = jest.fn();
    const viewModel = {
      ...homePreviewData,
      continueCard: {
        ...homePreviewData.continueCard!,
        action: { kind: 'resume' as const, sessionId: 'active-session' },
      },
    };

    await renderHome({ onContinue, viewModel });
    await fireEvent.press(screen.getByTestId('home-continue'));

    expect(onContinue).toHaveBeenCalledWith(viewModel.continueCard);
    expect(screen.getByTestId('home-daily-plan').props.accessibilityState).toMatchObject({
      disabled: true,
    });
  });

  it('shows no primary action when there is neither a plan nor a round', async () => {
    await renderHome({
      viewModel: { ...homePreviewData, continueCard: null, dailyPlan: null },
    });

    expect(screen.queryByTestId('home-continue')).toBeNull();
    expect(screen.queryByTestId('home-daily-plan')).toBeNull();
  });

  it('keeps subject discovery in Öğren instead of duplicating it', async () => {
    await renderHome();

    expect(screen.queryByText('Dersler')).toBeNull();
    expect(screen.queryByTestId('subject-tyt.history')).toBeNull();
    expect(screen.getByText('Bugünkü ilerleme')).toBeTruthy();
    expect(screen.getByText('Tekrar zamanı')).toBeTruthy();
  });

  it('keeps the weekly league reachable after the study plan', async () => {
    const onOpenLeague = jest.fn();

    await renderHome({ onOpenLeague });
    expect(screen.getByText('Haftalık XP sıralaması')).toBeTruthy();

    await fireEvent.press(screen.getByTestId('home-league-row'));
    expect(onOpenLeague).toHaveBeenCalledTimes(1);
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
  it('keeps the app shell available while real standings are pending', async () => {
    await render(<LeaguePendingScreen onSelectTab={jest.fn()} />);

    expect(screen.getByText('Lig hazırlanıyor')).toBeTruthy();
    expect(screen.getByTestId('tab-lig').props.accessibilityState).toMatchObject({
      selected: true,
    });
  });

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
    avatarId: 'initial' as const,
    badges: evaluateBadges({
      bestStreak: 12,
      completedUnits: 1,
      correctAnswers: 386,
      highestSubjectLevel: 5,
      lessonsCompleted: 48,
      perfectRounds: 0,
      totalXp: 2840,
    }),
    description: 'TYT Sosyal · 2027',
    displayName: 'Ege',
    initial: 'E',
    level: 8,
    openMistakes: 3,
    stats: [
      { id: 'rounds', label: 'Çalışma', value: '48' },
      { id: 'correct', label: 'Doğru', value: '386' },
      { id: 'streak', label: 'En uzun seri', value: '21' },
    ],
    streak: 12,
    topicPerformance: [
      {
        accuracy: 0.33,
        accuracyLabel: '%33 doğruluk',
        band: 'needsPractice' as const,
        correctAnswers: 1,
        detail: '1 doğru · 2 yanlış',
        id: 'unit.history',
        nextReviewLabel: 'Sonraki tekrar 29 Ağu',
        statusLabel: 'Tekrar gerekli',
        subtopics: [
          {
            accuracy: 0.33,
            accuracyLabel: '%33',
            band: 'needsPractice' as const,
            correctAnswers: 1,
            detail: '1 doğru · 2 yanlış',
            id: 'topic.history',
            nextReviewLabel: 'Sonraki tekrar 29 Ağu',
            statusLabel: 'Tekrar gerekli',
            title: 'Kut ve Töre',
            totalAttempts: 3,
            wrongAnswers: 2,
          },
        ],
        title: 'İlk Türk Devletleri',
        totalAttempts: 3,
        wrongAnswers: 2,
      },
    ],
    totalXp: 2840,
  };

  function renderProfile(overrides: Partial<Parameters<typeof ProfileScreen>[0]> = {}) {
    return render(
      <ProfileScreen
        onOpenLeagueHistory={jest.fn()}
        onOpenMistakeNotebook={jest.fn()}
        onOpenPremium={jest.fn()}
        onOpenSettings={jest.fn()}
        onOpenTopicPerformance={jest.fn()}
        onOpenWeeklyReport={jest.fn()}
        onSelectTab={jest.fn()}
        viewModel={viewModel}
        {...overrides}
      />,
    );
  }

  it('shows the learner’s own local record', async () => {
    await renderProfile();

    expect(screen.getByText('Ege')).toBeTruthy();
    expect(screen.getByText('TYT Sosyal · 2027')).toBeTruthy();
    expect(screen.getByText('2.840 XP')).toBeTruthy();
    expect(screen.getByText('Konu performansın')).toBeTruthy();
    expect(screen.getByText('Tekrar gerekli')).toBeTruthy();
    expect(screen.getByText('1 ana konu izleniyor')).toBeTruthy();
  });

  it('keeps unearned badges visible and says they are unearned', async () => {
    await renderProfile();

    expect(screen.getByLabelText('İlk Çalışma')).toBeTruthy();
    expect(screen.getByLabelText('30 Gün, henüz kazanılmadı')).toBeTruthy();
  });

  it('opens the detailed topic-performance feature', async () => {
    const onOpenTopicPerformance = jest.fn();

    await renderProfile({ onOpenTopicPerformance });
    await fireEvent.press(screen.getByTestId('profile-topic-performance'));

    expect(onOpenTopicPerformance).toHaveBeenCalledTimes(1);
  });

  it('routes each menu row to its own destination', async () => {
    const onOpenMistakeNotebook = jest.fn();
    const onOpenPremium = jest.fn();
    const onOpenSettings = jest.fn();

    await renderProfile({ onOpenMistakeNotebook, onOpenPremium, onOpenSettings });

    await fireEvent.press(screen.getByTestId('profile-menu-Yanlış Defterim'));
    await fireEvent.press(screen.getByTestId('profile-menu-Premium'));
    await fireEvent.press(screen.getByTestId('profile-menu-Ayarlar'));

    expect(onOpenMistakeNotebook).toHaveBeenCalledTimes(1);
    expect(onOpenPremium).toHaveBeenCalledTimes(1);
    expect(onOpenSettings).toHaveBeenCalledTimes(1);
  });

  it('carries the open-mistake count into the notebook entry', async () => {
    await renderProfile();

    expect(screen.getByText('3')).toBeTruthy();
  });
});
