import { type Href, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';

import { useLearnerProfile } from '@/modules/learner/application/learner-profile-store';
import type { ReminderTime } from '@/modules/learner/domain/learner-profile';
import { ReminderSettingsScreen } from '@/modules/reminders/ui/reminder-settings-screen';
import { ResetProgressConfirmSheet } from '@/modules/reminders/ui/reset-progress-confirm-sheet';
import { useRepositories } from '@/modules/progress/application/progress-store';
import {
  deviceScheduler,
  type NotificationPermissionStatus,
} from '@/shared/notifications/notifications';
import { MessageScreen } from '@/shared/ui/feedback/message-screen';

export default function SettingsRoute() {
  const router = useRouter();
  const store = useLearnerProfile();
  const repositories = useRepositories();
  const [permissionStatus, setPermissionStatus] =
    useState<NotificationPermissionStatus>('undetermined');
  const [permissionRequestFailed, setPermissionRequestFailed] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [confirmation, setConfirmation] = useState('');
  const [showReset, setShowReset] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const profile = store.status === 'ready' ? store.profile : null;
  const goBack = () => (router.canGoBack() ? router.back() : router.replace('/profil'));

  // Permission can be revoked from the phone at any time. This is deliberately
  // a read-only check: opening Settings must never display the OS prompt.
  useEffect(() => {
    void deviceScheduler
      .getPermissionStatus()
      .then(setPermissionStatus)
      .catch(() => setPermissionStatus('denied'));
  }, []);

  if (profile === null) {
    return (
      <MessageScreen
        action={{ label: 'Geri dön', onPress: goBack }}
        body="Ayarlar açılmadan önce profilin okunmalı."
        heading="Ayarlar hazır değil"
        testID="settings-pending"
        tone="muted"
      />
    );
  }

  if (error !== null) {
    return (
      <MessageScreen
        action={{ label: 'Tekrar dene', onPress: () => setError(null) }}
        body="Ayar kaydedilemedi. Mevcut tercihin değişmedi."
        detail={__DEV__ ? error.message : undefined}
        heading="Kaydedilemedi"
        testID="settings-failed"
        tone="dimmed"
      />
    );
  }

  const save = (changes: { remindersEnabled?: boolean; reminderTime?: ReminderTime }) => {
    void store
      .save({ ...profile, ...changes })
      .catch((cause: unknown) =>
        setError(cause instanceof Error ? cause : new Error(String(cause))),
      );
  };

  return (
    <>
      <ReminderSettingsScreen
      avatarId={profile.avatarId}
      currentYear={new Date().getFullYear()}
      dailyGoal={profile.dailyGoal}
      displayName={profile.displayName}
      enabled={profile.remindersEnabled}
      onBack={goBack}
      onChangeTime={(reminderTime) => save({ reminderTime })}
      onToggle={(remindersEnabled) => {
        if (!remindersEnabled) {
          setPermissionRequestFailed(false);
          save({ remindersEnabled: false });
          return;
        }

        void deviceScheduler
          .requestPermission()
          .then((status) => {
            setPermissionStatus(status);
            setPermissionRequestFailed(status !== 'granted');
            save({ remindersEnabled: status === 'granted' });
          })
          .catch(() => {
            setPermissionStatus('denied');
            setPermissionRequestFailed(true);
          });
      }}
      onRequestReset={() => {
        setConfirmation('');
        setShowReset(true);
      }}
      onOpenPrivacy={() => router.push('/gizlilik' as Href)}
      onSaveProfile={(preferences) =>
        store.save({ ...profile, ...preferences }).catch((cause: unknown) => {
          setError(cause instanceof Error ? cause : new Error(String(cause)));
        })
      }
      permissionStatus={permissionStatus}
      showPermissionWarning={profile.remindersEnabled || permissionRequestFailed}
      time={profile.reminderTime ?? '20:00'}
      targetYear={profile.targetYear}
      />
      <ResetProgressConfirmSheet
        confirmation={confirmation}
        isResetting={isResetting}
        onCancel={() => {
          setConfirmation('');
          setShowReset(false);
        }}
        onChangeConfirmation={setConfirmation}
        onConfirm={() => {
          setIsResetting(true);
          void deviceScheduler
            .reconcile([])
            .then(() => repositories.learnerData.reset())
            .then(() => {
              setShowReset(false);
              store.refresh();
            })
            .catch((cause: unknown) => {
              setIsResetting(false);
              setError(cause instanceof Error ? cause : new Error(String(cause)));
            });
        }}
        visible={showReset}
      />
    </>
  );
}
