import {
  createNotificationScheduler,
  REMINDER_CHANNEL_ID,
} from '@/shared/notifications/notifications';

const mockGetPermissionsAsync = jest.fn();
const mockRequestPermissionsAsync = jest.fn();
const mockCancelAllScheduledNotificationsAsync = jest.fn();
const mockScheduleNotificationAsync = jest.fn();
const mockSetNotificationChannelAsync = jest.fn();
const deviceScheduler = createNotificationScheduler({
  cancelAllScheduledNotificationsAsync: mockCancelAllScheduledNotificationsAsync,
  getPermissionsAsync: mockGetPermissionsAsync,
  requestPermissionsAsync: mockRequestPermissionsAsync,
  scheduleNotificationAsync: mockScheduleNotificationAsync,
  setNotificationChannelAsync: mockSetNotificationChannelAsync,
});

describe('notification adapter', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('reads permission without opening the OS prompt', async () => {
    mockGetPermissionsAsync.mockResolvedValue({ canAskAgain: true, granted: false });

    await expect(deviceScheduler.getPermissionStatus()).resolves.toBe('undetermined');
    expect(mockRequestPermissionsAsync).not.toHaveBeenCalled();
  });

  it('requests permission only through the explicit request method', async () => {
    mockGetPermissionsAsync.mockResolvedValue({ canAskAgain: true, granted: false });
    mockRequestPermissionsAsync.mockResolvedValue({ canAskAgain: false, granted: false });

    await expect(deviceScheduler.requestPermission()).resolves.toBe('denied');
    expect(mockRequestPermissionsAsync).toHaveBeenCalledTimes(1);
  });

  it('does not ask the OS again after a final denial', async () => {
    mockGetPermissionsAsync.mockResolvedValue({ canAskAgain: false, granted: false });

    await expect(deviceScheduler.requestPermission()).resolves.toBe('denied');
    expect(mockRequestPermissionsAsync).not.toHaveBeenCalled();
  });

  it('cancels safely without creating a channel when the plan is empty', async () => {
    await deviceScheduler.reconcile([]);

    expect(mockCancelAllScheduledNotificationsAsync).toHaveBeenCalledTimes(1);
    expect(mockSetNotificationChannelAsync).not.toHaveBeenCalled();
    expect(mockScheduleNotificationAsync).not.toHaveBeenCalled();
  });

  it('creates the Android channel and assigns it to scheduled reminders', async () => {
    await deviceScheduler.reconcile([
      {
        body: 'Kısa bir tur yeter.',
        hour: 20,
        id: 'streak:2099-09-04',
        localDate: '2099-09-04',
        minute: 0,
        title: 'Serini koru',
      },
    ]);

    expect(mockSetNotificationChannelAsync).toHaveBeenCalledWith(
      REMINDER_CHANNEL_ID,
      expect.objectContaining({ name: 'Çalışma hatırlatmaları' }),
    );
    expect(mockScheduleNotificationAsync).toHaveBeenCalledWith(
      expect.objectContaining({
        identifier: 'streak:2099-09-04',
        trigger: expect.objectContaining({ channelId: REMINDER_CHANNEL_ID }),
      }),
    );
  });
});
