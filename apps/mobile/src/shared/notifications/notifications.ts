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
  /** True when the learner has granted permission, false when they declined. */
  ensurePermission: () => Promise<boolean>;
  /** Replaces everything this app scheduled with exactly these reminders. */
  reconcile: (reminders: readonly PlannedReminder[]) => Promise<void>;
};

/** Does nothing and says so. Used where scheduling is not wanted. */
export const noopScheduler: NotificationScheduler = {
  ensurePermission: async () => false,
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

export const deviceScheduler: NotificationScheduler = {
  ensurePermission: async () => {
    const current = await Notifications.getPermissionsAsync();
    if (current.granted) {
      return true;
    }
    // Asking again after a refusal is how an app becomes something people mute.
    if (!current.canAskAgain) {
      return false;
    }

    return (await Notifications.requestPermissionsAsync()).granted;
  },

  reconcile: async (reminders) => {
    await Notifications.cancelAllScheduledNotificationsAsync();
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

      await Notifications.scheduleNotificationAsync({
        content: { body: reminder.body, title: reminder.title },
        identifier: reminder.id,
        trigger: { date: at, type: Notifications.SchedulableTriggerInputTypes.DATE },
      });
    }
  },
};
