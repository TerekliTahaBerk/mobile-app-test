import { ProfileScreen } from '@/modules/profile/ui/profile-screen';
import { useProgressDashboard } from '@/modules/progress/application/use-progress-dashboard';
import { APP_MODE } from '@/shared/config/app-config';
import { useTabNavigation } from '@/shared/navigation/use-tab-navigation';
import { MessageScreen } from '@/shared/ui/feedback/message-screen';

export default function ProfilRoute() {
  return APP_MODE === 'designPreview' ? <PreviewProfileRoute /> : <DurableProfileRoute />;
}

function PreviewProfileRoute() {
  return (
    <ProfileScreen
      activeTab="profil"
      initialTab="profile"
      onSelectTab={useTabNavigation('profil')}
    />
  );
}

function DurableProfileRoute() {
  const dashboard = useProgressDashboard();
  const onSelectTab = useTabNavigation('profil');

  if (dashboard.status === 'loading') {
    return (
      <MessageScreen
        body="Bu cihazdaki çalışma kayıtların okunuyor."
        heading="Profilin hazırlanıyor"
        mood="thinking"
      />
    );
  }

  if (dashboard.status === 'failed') {
    return (
      <MessageScreen
        action={{ label: 'TEKRAR DENE', onPress: dashboard.refresh }}
        body="Yerel ilerleme kayıtların okunamadı."
        heading="Profil açılamadı"
        mood="sad"
      />
    );
  }

  return (
    <ProfileScreen
      activeTab="profil"
      initialTab="profile"
      localStats={{
        completedLevels: dashboard.data.completedRealLevels,
        iz: dashboard.data.iz.current,
        lessonsCompleted: dashboard.data.completedSessions.lessons,
        reviewsCompleted: dashboard.data.completedSessions.reviews,
        totalXp: dashboard.data.totalXp,
      }}
      onSelectTab={onSelectTab}
    />
  );
}
