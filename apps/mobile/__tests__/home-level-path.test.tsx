import { fireEvent, render, screen } from '@testing-library/react-native';

import { HomeScreen } from '@/modules/home/ui/home-screen';

describe('home level path', () => {
  it('presents the unit, the current level, and locked levels without relying on colour', async () => {
    await render(<HomeScreen onOpenQuests={jest.fn()} onStartLevel={jest.fn()} />);

    // Curriculum context, not a dashboard header.
    expect(screen.getByText('BÖLÜM 2, ÜNİTE 3 · TARİH')).toBeTruthy();
    expect(screen.getByText('Osmanlı’da yenileşme')).toBeTruthy();

    // The current level is identifiable and says so in words.
    expect(screen.getByLabelText(/Tanzimat Fermanı\. Şimdi\./)).toBeTruthy();

    // Locked levels state their status and are not actionable.
    const locked = screen.getByLabelText(/Islahat Fermanı\. Kilitli\./);
    expect(locked.props.accessibilityState).toMatchObject({ disabled: true });

    // İz is the habit marker, never an English "streak".
    expect(screen.getByLabelText('13 günlük iz')).toBeTruthy();
    expect(screen.queryByText(/streak/i)).toBeNull();
  });

  it('opens the level detail panel from the current node and starts the lesson', async () => {
    const onStartLevel = jest.fn();

    await render(<HomeScreen onOpenQuests={jest.fn()} onStartLevel={onStartLevel} />);

    expect(screen.queryByTestId('level-detail-panel')).toBeNull();

    await fireEvent.press(screen.getByTestId('path-node-node-tanzimat-fermani'));

    expect(screen.getByTestId('level-detail-panel')).toBeTruthy();
    expect(screen.getByText('Ders 2 / 5 · +20 XP')).toBeTruthy();

    await fireEvent.press(screen.getByTestId('level-detail-cta'));

    expect(onStartLevel).toHaveBeenCalledTimes(1);
  });

  it('closes the detail panel when the same node is tapped again', async () => {
    await render(<HomeScreen onOpenQuests={jest.fn()} onStartLevel={jest.fn()} />);

    await fireEvent.press(screen.getByTestId('path-node-node-tanzimat-fermani'));
    await fireEvent.press(screen.getByTestId('path-node-node-tanzimat-fermani'));

    expect(screen.queryByTestId('level-detail-panel')).toBeNull();
  });

  it('routes the quests tab and leaves unfinished tabs disabled', async () => {
    const onOpenQuests = jest.fn();

    await render(<HomeScreen onOpenQuests={onOpenQuests} onStartLevel={jest.fn()} />);

    await fireEvent.press(screen.getByTestId('tab-gorev'));
    expect(onOpenQuests).toHaveBeenCalledTimes(1);

    expect(screen.getByTestId('tab-lig').props.accessibilityState).toMatchObject({
      disabled: true,
    });
    expect(screen.getByTestId('tab-yol').props.accessibilityState).toMatchObject({
      selected: true,
    });
  });
});
