import { useRouter } from 'expo-router';
import { useState } from 'react';

import { useLearnerProfile } from '@/modules/learner/application/learner-profile-store';
import type { WeeklyReportDay } from '@/modules/learner/domain/learner-profile';
import { buildWeeklyReportViewModel } from '@/modules/profile/model/build-weekly-report-view-model';
import { WeeklyReportScreen } from '@/modules/profile/ui/weekly-report-screen';
import { useProgressDashboard } from '@/modules/progress/application/use-progress-dashboard';
import { MessageScreen } from '@/shared/ui/feedback/message-screen';

export default function WeeklyReportRoute() {
  const dashboard = useProgressDashboard();
  const profileStore = useLearnerProfile();
  const router = useRouter();
  const [actionError, setActionError] = useState<Error | null>(null);
  const goBack = () => (router.canGoBack() ? router.back() : router.replace('/profil'));

  if (dashboard.status === 'loading') {
    return (
      <MessageScreen
        body="Haftanın cevapları ve tamamlanan çalışmaların okunuyor."
        heading="Raporun hazırlanıyor"
        testID="weekly-report-loading"
        tone="muted"
      />
    );
  }

  if (dashboard.status === 'failed') {
    return (
      <MessageScreen
        action={{ label: 'Tekrar dene', onPress: dashboard.refresh }}
        body="Bu cihazdaki hafta kayıtların okunamadı."
        heading="Rapor açılamadı"
        testID="weekly-report-failed"
        tone="dimmed"
      />
    );
  }

  if (actionError !== null) {
    return (
      <MessageScreen
        action={{ label: 'Tekrar dene', onPress: () => setActionError(null) }}
        body="Rapor günün kaydedilemedi. Kayıtların değişmedi."
        detail={__DEV__ ? actionError.message : undefined}
        heading="Ayar kaydedilemedi"
        testID="weekly-report-day-failed"
        tone="dimmed"
      />
    );
  }

  const profile = dashboard.data.profile;

  return (
    <WeeklyReportScreen
      onBack={goBack}
      onChangeDay={(day: WeeklyReportDay) => {
        if (profile === null || day === profile.weeklyReportDay) {
          return;
        }
        void profileStore
          .save({ ...profile, weeklyReportDay: day })
          .then(dashboard.refresh)
          .catch((cause: unknown) => {
            setActionError(cause instanceof Error ? cause : new Error(String(cause)));
          });
      }}
      viewModel={buildWeeklyReportViewModel(
        dashboard.data.weeklyReport,
        profile?.weeklyReportDay ?? 0,
      )}
    />
  );
}
