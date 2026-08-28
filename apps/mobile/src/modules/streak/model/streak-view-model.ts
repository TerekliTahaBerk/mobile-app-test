import type { StreakDay } from '@/modules/progress/domain/streak-policy';

export type StreakMilestoneViewModel = {
  /** "İki haftaya iki gün kaldı." */
  encouragement: string;
  /** "Yeni rozet: 7 Gün Seri", or null when nothing new was earned. */
  newBadge: string | null;
  /** League movement, or null when the league has nothing to report. */
  leagueMove: { detail: string; title: string } | null;
  streak: number;
  week: readonly StreakDay[];
};
