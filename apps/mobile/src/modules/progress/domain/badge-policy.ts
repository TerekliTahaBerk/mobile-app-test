/**
 * Badges (rozetler), v1.
 *
 * Badges are derived from the learner's own record, never stored: a badge is
 * simply a named threshold over local stats, so it can never drift out of
 * agreement with what actually happened. Rendering an unearned badge as locked
 * is deliberate — the set is the same for everyone, and the shape of what is
 * still ahead is part of what makes it worth chasing.
 */

export type BadgeId =
  | 'firstLesson'
  | 'firstUnit'
  | 'hundredCorrect'
  | 'longStreak'
  | 'perfectRound'
  | 'streakWeek'
  | 'subjectLevelFive'
  | 'xpFiveThousand';

export type BadgeStats = {
  bestStreak: number;
  completedUnits: number;
  correctAnswers: number;
  highestSubjectLevel: number;
  lessonsCompleted: number;
  perfectRounds: number;
  totalXp: number;
};

export type Badge = {
  earned: boolean;
  id: BadgeId;
  /** Short caption under the tile. */
  label: string;
};

type BadgeDefinition = {
  id: BadgeId;
  label: string;
  earned: (stats: BadgeStats) => boolean;
};

const DEFINITIONS: readonly BadgeDefinition[] = [
  { id: 'firstLesson', label: 'İlk Çalışma', earned: (s) => s.lessonsCompleted >= 1 },
  { id: 'streakWeek', label: '7 Gün', earned: (s) => s.bestStreak >= 7 },
  { id: 'hundredCorrect', label: '100 Doğru', earned: (s) => s.correctAnswers >= 100 },
  { id: 'firstUnit', label: 'İlk Ünite', earned: (s) => s.completedUnits >= 1 },
  { id: 'subjectLevelFive', label: 'Ders Lv 5', earned: (s) => s.highestSubjectLevel >= 5 },
  { id: 'longStreak', label: '30 Gün', earned: (s) => s.bestStreak >= 30 },
  { id: 'xpFiveThousand', label: '5.000 XP', earned: (s) => s.totalXp >= 5000 },
  { id: 'perfectRound', label: 'Kusursuz', earned: (s) => s.perfectRounds >= 1 },
];

/** Earned badges first, each group in its defined order. */
export function evaluateBadges(stats: BadgeStats): readonly Badge[] {
  const badges = DEFINITIONS.map((definition) => ({
    earned: definition.earned(stats),
    id: definition.id,
    label: definition.label,
  }));

  return [...badges.filter((badge) => badge.earned), ...badges.filter((badge) => !badge.earned)];
}

export function countEarned(badges: readonly Badge[]): number {
  return badges.filter((badge) => badge.earned).length;
}
