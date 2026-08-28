import { fireEvent, render, screen } from '@testing-library/react-native';

import type { PlacementResultViewModel } from '@/modules/onboarding/model/placement-result-view-model';
import { PlacementResultScreen } from '@/modules/onboarding/ui/placement-result-screen';

function viewModelFor(
  overrides: Partial<PlacementResultViewModel> = {},
): PlacementResultViewModel {
  return {
    detail: '13 sorudan 8 doğru · 5 alt konu ölçüldü',
    plan: {
      actionLabel: 'Başla',
      detail: '4 farklı konudan karışık',
      headline: 'Bugün 12 soru',
      lines: [
        { count: 5, kind: 'weakTopic', label: 'zayıf konu sorusu' },
        { count: 2, kind: 'newMaterial', label: 'yeni konu sorusu' },
      ],
    },
    rows: [
      {
        accuracyLabel: '%33',
        band: 'needsPractice',
        id: 'tyt.history.first-turkish-states.states',
        mainTopicTitle: 'İlk ve Orta Çağlarda Türk Dünyası',
        statusLabel: 'Tekrar gerekli',
        title: 'İlk Türk Devletleri',
      },
      {
        accuracyLabel: '%100',
        band: 'strong',
        id: 'tyt.history.time-and-history.measuring-time',
        mainTopicTitle: 'Tarih ve Zaman',
        statusLabel: 'Güçlü',
        title: 'Zamanı Ölçmek',
      },
    ],
    ...overrides,
  };
}

describe('placement result', () => {
  it('opens on a map rather than an empty performance screen', async () => {
    await render(
      <PlacementResultScreen
        onSkipPlan={jest.fn()}
        onStartPlan={jest.fn()}
        viewModel={viewModelFor()}
      />,
    );

    expect(screen.getByText('Başlangıç haritan hazır')).toBeTruthy();
    expect(screen.getByText('13 sorudan 8 doğru · 5 alt konu ölçüldü')).toBeTruthy();
    expect(screen.getByText('İlk Türk Devletleri')).toBeTruthy();
    expect(screen.getByText('Tekrar gerekli')).toBeTruthy();
    expect(screen.getByText('Zamanı Ölçmek')).toBeTruthy();
  });

  it('states the first plan before offering it', async () => {
    const onStartPlan = jest.fn();

    await render(
      <PlacementResultScreen
        onSkipPlan={jest.fn()}
        onStartPlan={onStartPlan}
        viewModel={viewModelFor()}
      />,
    );

    expect(screen.getByText('Bugün 12 soru')).toBeTruthy();
    expect(screen.getByText('5 zayıf konu sorusu')).toBeTruthy();

    await fireEvent.press(screen.getByTestId('placement-start-plan'));

    expect(onStartPlan).toHaveBeenCalledTimes(1);
  });

  it('lets the learner leave without starting the plan', async () => {
    const onSkipPlan = jest.fn();

    await render(
      <PlacementResultScreen
        onSkipPlan={onSkipPlan}
        onStartPlan={jest.fn()}
        viewModel={viewModelFor()}
      />,
    );

    await fireEvent.press(screen.getByTestId('placement-skip-plan'));

    expect(onSkipPlan).toHaveBeenCalledTimes(1);
  });

  it('omits the plan card when nothing could be planned', async () => {
    await render(
      <PlacementResultScreen
        onSkipPlan={jest.fn()}
        onStartPlan={jest.fn()}
        viewModel={viewModelFor({ plan: null })}
      />,
    );

    expect(screen.queryByTestId('placement-plan')).toBeNull();
    expect(screen.getByText('Konu haritan')).toBeTruthy();
  });
});
