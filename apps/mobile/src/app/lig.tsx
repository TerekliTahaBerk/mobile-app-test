import { Redirect } from 'expo-router';

import { ProfileScreen } from '@/modules/profile/ui/profile-screen';
import { FEATURES } from '@/shared/config/app-config';
import { useTabNavigation } from '@/shared/navigation/use-tab-navigation';

export default function LigRoute() {
  const onSelectTab = useTabNavigation('lig');

  // The league has no backend; a pilot build must not surface invented rankings.
  if (!FEATURES.league) {
    return <Redirect href="/" />;
  }

  return <ProfileScreen activeTab="lig" initialTab="league" onSelectTab={onSelectTab} />;
}
