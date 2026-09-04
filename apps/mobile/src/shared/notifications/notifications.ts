import * as Notifications from 'expo-notifications';

import type { PlannedReminder } from '@/modules/reminders/domain/reminder-policy';

/**
 * The notification seam.
 *
 * Everything here is local: a scheduled notification never leaves the device,
 * there is no push token, and no learner data is sent anywhere — which is what
 * lets an accountless pilot remind someone at all. See docs/SECURITY.md.
 *
 * The adapter is swappable so the domain policy can be tested and the design
 * preview can run without asking anyone for permission.
 */
export type NotificationScheduler = {
  /** Reads the current OS state without ever displaying a system prompt. */
  getPermissionStatus: () => Promise<NotificationPermissionStatus>;
  /** May display the OS prompt; call only from an explicit learner action. */
  requestPermission: () => Promise<NotificationPermissionStatus>;
  /** Replaces everything this app scheduled with exactly these reminders. */
  reconcile: (reminders: readonly PlannedReminder[]) => Promise<void>;
};

export type NotificationPermissionStatus = 'denied' | 'granted' | 'undetermined';

export const REMINDER_CHANNEL_ID = 'reminders';

/** Does nothing and says so. Used where scheduling is not wanted. */
export const noopScheduler: NotificationScheduler = {
  getPermissionStatus: async () => 'denied',
  requestPermission: async () => 'denied',
  reconcile: async () => undefined,
};

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: false,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

type NotificationsApi = Pick<
  typeof Notifications,
  | 'cancelAllScheduledNotificationsAsync'
  | 'getPermissionsAsync'
  | 'requestPermissionsAsync'
  | 'scheduleNotificationAsync'
  | 'setNotificationChannelAsync'
>;

export function createNotificationScheduler(
  notifications: NotificationsApi,
): NotificationScheduler {
  const ensureReminderChannel = async () => {
    await notifications.setNotificationChannelAsync(REMINDER_CHANNEL_ID, {
      description: 'Günlük çalışma ve haftalık rapor hatırlatmaları',
      importance: Notifications.AndroidImportance.DEFAULT,
      name: 'Çalışma hatırlatmaları',
      showBadge: false,
    });
  };

  return {
    getPermissionStatus: async () =>
      permissionStatus(await notifications.getPermissionsAsync()),

    requestPermission: async () => {
      await ensureReminderChannel();
      const current = await notifications.getPermissionsAsync();
      if (current.granted || !current.canAskAgain) {
        return permissionStatus(current);
      }

      return permissionStatus(await notifications.requestPermissionsAsync());
    },

    reconcile: async (reminders) => {
      await notifications.cancelAllScheduledNotificationsAsync();
      if (reminders.length === 0) {
        return;
      }

      await ensureReminderChannel();
      for (const reminder of reminders) {
        const [year, month, day] = reminder.localDate.split('-').map(Number);
        const at = new Date(
          year ?? 1970,
          (month ?? 1) - 1,
          day ?? 1,
          reminder.hour,
          reminder.minute,
        );
        // A time that has already passed today cannot be scheduled; the next
        // reconcile will arm tomorrow's instead of firing this one late.
        if (at.getTime() <= Date.now()) {
          continue;
        }

        await notifications.scheduleNotificationAsync({
          content: { body: reminder.body, title: reminder.title },
          identifier: reminder.id,
          trigger: {
            channelId: REMINDER_CHANNEL_ID,
            date: at,
            type: Notifications.SchedulableTriggerInputTypes.DATE,
          },
        });
      }
    },
  };
}

export const deviceScheduler = createNotificationScheduler(Notifications);

function permissionStatus(
  permissions: Notifications.NotificationPermissionsStatus,
): NotificationPermissionStatus {
  if (permissions.granted) {
    return 'granted';
  }

  return permissions.canAskAgain ? 'undetermined' : 'denied';
}
