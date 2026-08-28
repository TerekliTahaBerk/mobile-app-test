import { useRouter } from 'expo-router';

import { useProgressDashboard } from '@/modules/progress/application/use-progress-dashboard';
import { StreakMilestoneScreen } from '@/modules/streak/ui/streak-milestone-screen';
import { MessageScreen } from '@/shared/ui/feedback/message-screen';

export default function StreakRoute() {
  const router = useRouter();
  const dashboard = useProgressDashboard();
  const home = () => router.replace('/');

  if (dashboard.status !== 'ready') {
    return (
      <MessageScreen
        action={{ label: 'Ana Sayfa', onPress: home }}
        body="Seri bilgin okunuyor."
        heading="Hazırlanıyor"
        testID="streak-loading"
        tone="muted"
      />
    );
  }

  const streak = dashboard.data.streak.current;

  return (
    <StreakMilestoneScreen
      onContinue={home}
      viewModel={{
        encouragement: encouragementFor(streak),
        leagueMove: null,
        newBadge: streak >= 7 ? `Yeni rozet: ${streak} Gün Seri` : null,
        streak,
        week: dashboard.data.week,
      }}
    />
  );
}

/** Names the next milestone rather than congratulating in the abstract. */
function encouragementFor(streak: number): string {
  const next = [7, 14, 30, 50, 100, 365].find((milestone) => milestone > streak);

  return next === undefined
    ? 'Bu seriyi bozma.'
    : `${next} güne ${next - streak} gün kaldı.`;
}
