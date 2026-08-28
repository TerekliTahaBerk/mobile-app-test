import { fireEvent, render, screen } from '@testing-library/react-native';

import { unitPathPreviewData } from '@/modules/learn/model/unit-path-view-model';
import { UnitPathScreen } from '@/modules/learn/ui/unit-path-screen';

function renderPath(overrides: Partial<Parameters<typeof UnitPathScreen>[0]> = {}) {
  return render(
    <UnitPathScreen
      onBack={jest.fn()}
      onSelectStep={jest.fn()}
      onSelectTab={jest.fn()}
      viewModel={unitPathPreviewData}
      {...overrides}
    />,
  );
}

describe('unit path', () => {
  it('stacks the units in order with their own headers', async () => {
    await renderPath();

    expect(screen.getByText('Tarih ve Zaman')).toBeTruthy();
    expect(screen.getByText('İlk ve Orta Çağlarda Türk Dünyası')).toBeTruthy();
    expect(screen.getByText("Orta Çağ'da Dünya")).toBeTruthy();
    expect(screen.getByText('2 / 6 çalışma tamam')).toBeTruthy();
  });

  it('marks the current step as the one obvious place to press', async () => {
    await renderPath();

    expect(screen.getByText('BAŞLA')).toBeTruthy();
    expect(
      screen.getByLabelText('Kronolojik Sırala. 3 soru · 4 dk'),
    ).toBeTruthy();
  });

  it('states a locked step in words rather than by tint alone', async () => {
    await renderPath();

    const locked = screen.getByLabelText('Kut ve Töre, kilitli');
    expect(locked).toBeTruthy();
    expect(screen.queryByTestId('path-node-path.history.first-turkish-states.04')).toBeNull();
  });

  it('opens only the steps the learner can actually start', async () => {
    const onSelectStep = jest.fn();

    await renderPath({ onSelectStep });

    await fireEvent.press(
      screen.getByTestId('path-node-path.history.first-turkish-states.03'),
    );

    expect(onSelectStep).toHaveBeenCalledTimes(1);
    expect(onSelectStep.mock.calls[0]?.[0]).toMatchObject({
      id: 'path.history.first-turkish-states.03',
      lessonId: 'lesson.history.chronology.001',
    });
  });

  it('draws no path for a unit that is still locked', async () => {
    await renderPath();

    expect(screen.getByText('ünite 3 · kilitli')).toBeTruthy();
    expect(screen.getByText('Ünite 2 bitince açılır')).toBeTruthy();
  });

  it('keeps the learn tab selected and routes the others', async () => {
    const onSelectTab = jest.fn();

    await renderPath({ onSelectTab });

    expect(screen.getByTestId('tab-ogren').props.accessibilityState).toMatchObject({
      selected: true,
    });

    await fireEvent.press(screen.getByTestId('tab-lig'));
    await fireEvent.press(screen.getByTestId('tab-profil'));

    expect(onSelectTab.mock.calls.map(([tab]) => tab)).toEqual(['lig', 'profil']);
  });
});
