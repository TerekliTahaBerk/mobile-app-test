import { fireEvent, render, screen } from '@testing-library/react-native';

import { ReminderSettingsScreen } from '@/modules/reminders/ui/reminder-settings-screen';
import { ResetProgressConfirmSheet } from '@/modules/reminders/ui/reset-progress-confirm-sheet';

function renderSettings(overrides: Partial<Parameters<typeof ReminderSettingsScreen>[0]> = {}) {
  return render(
    <ReminderSettingsScreen
      avatarId="initial"
      currentYear={2026}
      dailyGoal={3}
      displayName="Ege"
      enabled
      onBack={jest.fn()}
      onChangeTime={jest.fn()}
      onRequestReset={jest.fn()}
      onSaveProfile={jest.fn()}
      onToggle={jest.fn()}
      permissionStatus="granted"
      showPermissionWarning
      time="20:00"
      targetYear={2027}
      {...overrides}
    />,
  );
}

describe('reminder settings', () => {
  it('lets the learner switch the reminder off', async () => {
    const onToggle = jest.fn();

    await renderSettings({ onToggle });
    await fireEvent.press(screen.getByTestId('reminder-toggle'));

    expect(onToggle).toHaveBeenCalledWith(false);
  });

  it('edits and saves core profile preferences without resetting progress', async () => {
    const onSaveProfile = jest.fn();
    await renderSettings({ onSaveProfile });

    await fireEvent.changeText(screen.getByTestId('settings-display-name'), '  Ege Can  ');
    await fireEvent.press(screen.getByTestId('settings-avatar-dino'));
    await fireEvent.press(screen.getByTestId('settings-goal-6'));
    await fireEvent.press(screen.getByTestId('settings-year-2028'));
    await fireEvent.press(screen.getByTestId('settings-profile-save'));

    expect(onSaveProfile).toHaveBeenCalledWith({
      avatarId: 'dino',
      dailyGoal: 6,
      displayName: 'Ege Can',
      targetYear: 2028,
    });
    expect(screen.getByText(/çalışma kayıtlarını sıfırlamaz/)).toBeTruthy();
  });

  it('offers the hour only while the reminder is on', async () => {
    const onChangeTime = jest.fn();

    await renderSettings({ onChangeTime });
    await fireEvent.press(screen.getByTestId('reminder-time-17:00'));

    expect(onChangeTime).toHaveBeenCalledWith('17:00');

    await renderSettings({ enabled: false });
    expect(screen.queryByTestId('reminder-time-17:00')).toBeNull();
  });

  it('says so when the phone will not deliver what the switch promises', async () => {
    await renderSettings({ permissionStatus: 'denied' });

    expect(screen.getByTestId('reminder-permission-warning')).toBeTruthy();
  });

  it('keeps quiet about permission while the reminder is off', async () => {
    await renderSettings({
      enabled: false,
      permissionStatus: 'denied',
      showPermissionWarning: false,
    });

    expect(screen.queryByTestId('reminder-permission-warning')).toBeNull();
  });

  it('states that nothing leaves the device', async () => {
    await renderSettings();

    expect(screen.getByText('Hatırlatmalar cihazından çıkmaz')).toBeTruthy();
    expect(screen.getByText('Verilerin yalnızca bu cihazda')).toBeTruthy();
    expect(screen.getByText(/Cloud yedekleme yoktur/)).toBeTruthy();
  });

  it('requires a separate destructive confirmation flow', async () => {
    const onRequestReset = jest.fn();
    await renderSettings({ onRequestReset });

    await fireEvent.press(screen.getByTestId('reset-progress-open'));
    expect(onRequestReset).toHaveBeenCalledTimes(1);
  });
});

describe('reset progress confirmation', () => {
  it('does not allow a single tap or an incomplete confirmation to erase data', async () => {
    const onConfirm = jest.fn();
    const onChangeConfirmation = jest.fn();
    const view = await render(
      <ResetProgressConfirmSheet
        confirmation=""
        isResetting={false}
        onCancel={jest.fn()}
        onChangeConfirmation={onChangeConfirmation}
        onConfirm={onConfirm}
        visible
      />,
    );

    const confirm = screen.getByTestId('reset-progress-confirm');
    expect(confirm).toBeDisabled();
    await fireEvent.press(confirm);
    expect(onConfirm).not.toHaveBeenCalled();

    await fireEvent.changeText(screen.getByTestId('reset-progress-confirmation-input'), 'SIFIR');
    expect(onChangeConfirmation).toHaveBeenCalledWith('SIFIR');

    await view.rerender(
      <ResetProgressConfirmSheet
        confirmation="SIFIRLA"
        isResetting={false}
        onCancel={jest.fn()}
        onChangeConfirmation={onChangeConfirmation}
        onConfirm={onConfirm}
        visible
      />,
    );
    await fireEvent.press(screen.getByTestId('reset-progress-confirm'));
    expect(onConfirm).toHaveBeenCalledTimes(1);
  });
});
