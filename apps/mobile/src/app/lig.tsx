import { Redirect } from 'expo-router';

import { leaguePreviewData } from '@/modules/league/model/league-view-model';
import { LeagueScreen } from '@/modules/league/ui/league-screen';
import { FEATURES } from '@/shared/config/app-config';
import { useTabNavigation } from '@/shared/navigation/use-tab-navigation';

export default function LeagueRoute() {
  const onSelectTab = useTabNavigation('lig');

  // Stale bookmarks and deep links return to the supported product instead of
  // opening a placeholder for a feature that production does not offer.
  if (!FEATURES.league) {
    return <Redirect href="/" />;
  }

  return <LeagueScreen onSelectTab={onSelectTab} viewModel={leaguePreviewData} />;
}
