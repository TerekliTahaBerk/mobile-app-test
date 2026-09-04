import { fireEvent, render, screen } from '@testing-library/react-native';

import { ReminderSettingsScreen } from '@/modules/reminders/ui/reminder-settings-screen';

function renderSettings(overrides: Partial<Parameters<typeof ReminderSettingsScreen>[0]> = {}) {
  return render(
    <ReminderSettingsScreen
      enabled
      onBack={jest.fn()}
      onChangeTime={jest.fn()}
      onToggle={jest.fn()}
      permissionStatus="granted"
      showPermissionWarning
      time="20:00"
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
  });
});
