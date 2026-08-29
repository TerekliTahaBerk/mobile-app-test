import { useRouter } from 'expo-router';

import { buildProfileViewModel } from '@/modules/profile/model/build-profile-view-model';
import { ProfileScreen } from '@/modules/profile/ui/profile-screen';
import { useProgressDashboard } from '@/modules/progress/application/use-progress-dashboard';
import { FEATURES } from '@/shared/config/app-config';
import { useTabNavigation } from '@/shared/navigation/use-tab-navigation';
import { MessageScreen } from '@/shared/ui/feedback/message-screen';

export default function ProfileRoute() {
  const dashboard = useProgressDashboard();
  const onSelectTab = useTabNavigation('profil');
  const router = useRouter();

  if (dashboard.status === 'loading') {
    return (
      <MessageScreen
        body="Bu cihazdaki çalışma kayıtların okunuyor."
        heading="Profilin hazırlanıyor"
        testID="profile-loading"
        tone="muted"
      />
    );
  }

  if (dashboard.status === 'failed') {
    return (
      <MessageScreen
        action={{ label: 'Tekrar dene', onPress: dashboard.refresh }}
        body="Yerel ilerleme kayıtların okunamadı."
        heading="Profil açılamadı"
        testID="profile-failed"
        tone="dimmed"
      />
    );
  }

  return (
    <ProfileScreen
      onOpenLeagueHistory={FEATURES.league ? () => onSelectTab('lig') : undefined}
      onOpenMistakeNotebook={() => router.push('/yanlis-defteri')}
      onOpenPremium={FEATURES.plus ? () => router.push('/premium') : undefined}
      onOpenSettings={() => router.push('/ayarlar')}
      onOpenTopicPerformance={() => router.push('/konu-performansi')}
      onOpenWeeklyReport={() => router.push('/haftalik-rapor')}
      onSelectTab={onSelectTab}
      viewModel={buildProfileViewModel(dashboard.data)}
    />
  );
}
