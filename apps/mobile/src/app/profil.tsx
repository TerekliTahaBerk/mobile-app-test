import { ProfileScreen } from '@/modules/profile/ui/profile-screen';
import { useTabNavigation } from '@/shared/navigation/use-tab-navigation';

export default function ProfilRoute() {
  return (
    <ProfileScreen
      activeTab="profil"
      initialTab="profile"
      onSelectTab={useTabNavigation('profil')}
    />
  );
}
