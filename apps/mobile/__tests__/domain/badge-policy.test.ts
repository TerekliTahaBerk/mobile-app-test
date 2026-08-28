import { countEarned, evaluateBadges } from '@/modules/progress/domain/badge-policy';

const NOTHING = {
  bestStreak: 0,
  completedUnits: 0,
  correctAnswers: 0,
  highestSubjectLevel: 0,
  lessonsCompleted: 0,
  perfectRounds: 0,
  totalXp: 0,
};

describe('badges', () => {
  it('shows the whole set to a learner who has earned none of it', () => {
    const badges = evaluateBadges(NOTHING);

    expect(badges).toHaveLength(8);
    expect(countEarned(badges)).toBe(0);
  });

  it('earns a badge exactly at its threshold', () => {
    expect(
      evaluateBadges({ ...NOTHING, bestStreak: 7 }).find((badge) => badge.id === 'streakWeek'),
    ).toMatchObject({ earned: true });
    expect(
      evaluateBadges({ ...NOTHING, bestStreak: 6 }).find((badge) => badge.id === 'streakWeek'),
    ).toMatchObject({ earned: false });
  });

  it('orders earned badges ahead of the ones still to come', () => {
    const badges = evaluateBadges({ ...NOTHING, lessonsCompleted: 1, totalXp: 5000 });

    expect(badges.slice(0, 2).map((badge) => badge.id)).toEqual([
      'firstLesson',
      'xpFiveThousand',
    ]);
    expect(badges.slice(2).every((badge) => !badge.earned)).toBe(true);
  });
});
