import { leaguePreviewData } from '@/modules/league/model/league-view-model';
import { LeagueScreen } from '@/modules/league/ui/league-screen';
import { FEATURES } from '@/shared/config/app-config';
import { useTabNavigation } from '@/shared/navigation/use-tab-navigation';
import { MessageScreen } from '@/shared/ui/feedback/message-screen';

export default function LeagueRoute() {
  const onSelectTab = useTabNavigation('lig');

  // The league needs a real leaderboard service. Until one exists the tab stays
  // in place — removing it would rearrange the app — but it must not rank the
  // learner against people who do not exist.
  if (!FEATURES.league) {
    return (
      <MessageScreen
        body="Haftalık lig hazırlanıyor. Açıldığında XP'n seni buraya taşıyacak."
        heading="Lig yakında"
        secondaryAction={{ label: 'Ana Sayfa', onPress: () => onSelectTab('anasayfa') }}
        testID="league-pending"
        tone="muted"
      />
    );
  }

  return <LeagueScreen onSelectTab={onSelectTab} viewModel={leaguePreviewData} />;
}
