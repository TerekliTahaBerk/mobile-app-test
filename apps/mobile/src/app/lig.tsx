import { leaguePreviewData } from '@/modules/league/model/league-view-model';
import { LeaguePendingScreen } from '@/modules/league/ui/league-pending-screen';
import { LeagueScreen } from '@/modules/league/ui/league-screen';
import { FEATURES } from '@/shared/config/app-config';
import { useTabNavigation } from '@/shared/navigation/use-tab-navigation';

export default function LeagueRoute() {
  const onSelectTab = useTabNavigation('lig');

  // The league needs a real leaderboard service. Until one exists the tab stays
  // in place — removing it would rearrange the app — but it must not rank the
  // learner against people who do not exist.
  if (!FEATURES.league) {
    return <LeaguePendingScreen onSelectTab={onSelectTab} />;
  }

  return <LeagueScreen onSelectTab={onSelectTab} viewModel={leaguePreviewData} />;
}
