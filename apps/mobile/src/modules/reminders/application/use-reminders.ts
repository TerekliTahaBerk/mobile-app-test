import { useEffect, useRef } from 'react';

import { buildWeeklyReportViewModel } from '@/modules/profile/model/build-weekly-report-view-model';
import { planReminders } from '@/modules/reminders/domain/reminder-policy';
import type { ProgressDashboard } from '@/modules/progress/application/use-progress-dashboard';
import { deviceScheduler, type NotificationScheduler } from '@/shared/notifications/notifications';
import { trackEvent } from '@/shared/observability/observability';

/**
 * Keeps the device's scheduled reminders equal to what the policy says.
 *
 * It runs where the dashboard is already read rather than on its own timer, so
 * reminders are re-armed whenever the learner opens the app and never cost a
 * second pass over storage. Failure is silent by design: a reminder that could
 * not be scheduled must not break the screen the learner actually opened.
 */
export function useReminders(
  dashboard: ProgressDashboard | null,
  scheduler: NotificationScheduler = deviceScheduler,
): void {
  const lastPlan = useRef<string | null>(null);

  useEffect(() => {
    if (dashboard === null) {
      return;
    }

    const profile = dashboard.profile;
    const reminders = planReminders({
      moment: dashboard.observedAt,
      remindersEnabled: profile?.remindersEnabled === true,
      reminderTime: profile?.reminderTime,
      streak: dashboard.streak.current,
      todayQualified: dashboard.streak.todayQualified,
      weeklyReportBody: buildWeeklyReportViewModel(
        dashboard.weeklyReport,
        profile?.weeklyReportDay ?? 0,
      ).notificationText,
      weeklyReportDay: profile?.weeklyReportDay ?? 0,
    });

    // Rescheduling identical reminders would cancel and re-create notifications
    // the system has already accepted, for no change the learner can see.
    const fingerprint = JSON.stringify(reminders);
    if (fingerprint === lastPlan.current) {
      return;
    }
    lastPlan.current = fingerprint;

    void (async () => {
      if (
        reminders.length > 0 &&
        (await scheduler.getPermissionStatus()) !== 'granted'
      ) {
        // Permission may have been revoked outside the app. Remove any stale
        // requests and never turn a background reconciliation into a prompt.
        await scheduler.reconcile([]);
        return;
      }
      await scheduler.reconcile(reminders);
      trackEvent('reminders_scheduled', { count: reminders.length });
    })().catch(() => undefined);
  }, [dashboard, scheduler]);
}
