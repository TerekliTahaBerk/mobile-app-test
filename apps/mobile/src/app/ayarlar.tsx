import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';

import { useLearnerProfile } from '@/modules/learner/application/learner-profile-store';
import type { ReminderTime } from '@/modules/learner/domain/learner-profile';
import { ReminderSettingsScreen } from '@/modules/reminders/ui/reminder-settings-screen';
import { deviceScheduler } from '@/shared/notifications/notifications';
import { MessageScreen } from '@/shared/ui/feedback/message-screen';

export default function SettingsRoute() {
  const router = useRouter();
  const store = useLearnerProfile();
  const [permitted, setPermitted] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const profile = store.status === 'ready' ? store.profile : null;
  const goBack = () => (router.canGoBack() ? router.back() : router.replace('/profil'));

  // Permission can be revoked from the phone at any time, so the screen asks
  // the system rather than trusting what the learner once agreed to.
  useEffect(() => {
    void deviceScheduler
      .ensurePermission()
      .then(setPermitted)
      .catch(() => setPermitted(false));
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
    <ReminderSettingsScreen
      enabled={profile.remindersEnabled}
      onBack={goBack}
      onChangeTime={(reminderTime) => save({ reminderTime })}
      onToggle={(remindersEnabled) => save({ remindersEnabled })}
      permitted={permitted}
      time={profile.reminderTime ?? '20:00'}
    />
  );
}
