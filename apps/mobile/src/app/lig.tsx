import { ProfileScreen } from '@/modules/profile/ui/profile-screen';
import { useTabNavigation } from '@/shared/navigation/use-tab-navigation';

export default function LigRoute() {
  return (
    <ProfileScreen activeTab="lig" initialTab="league" onSelectTab={useTabNavigation('lig')} />
  );
}
