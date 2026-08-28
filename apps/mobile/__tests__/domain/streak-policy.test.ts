import {
  buildStreakWeek,
  computeStreak,
  isStreakMilestone,
} from '@/modules/progress/domain/streak-policy';

describe('daily streak', () => {
  it('counts today-only and yesterday-only activity', () => {
    expect(computeStreak(['2026-08-27'], '2026-08-27')).toEqual({
      current: 1,
      todayQualified: true,
    });
    expect(computeStreak(['2026-08-26'], '2026-08-27')).toEqual({
      current: 1,
      todayQualified: false,
    });
  });

  it('counts consecutive qualifying days ending today', () => {
    expect(computeStreak(['2026-08-25', '2026-08-26', '2026-08-27'], '2026-08-27')).toEqual({
      current: 3,
      todayQualified: true,
    });
  });

  it('keeps the run alive on a day that has not been studied yet', () => {
    // The grace rule: yesterday qualified, today is still open. Breaking the
    // run at midnight would punish the learner for the clock.
    expect(computeStreak(['2026-08-25', '2026-08-26'], '2026-08-27')).toEqual({
      current: 2,
      todayQualified: false,
    });
  });

  it('breaks once a full day has been missed', () => {
    expect(computeStreak(['2026-08-24', '2026-08-25'], '2026-08-27')).toEqual({
      current: 0,
      todayQualified: false,
    });
  });

  it('starts at zero with no history', () => {
    expect(computeStreak([], '2026-08-27')).toEqual({ current: 0, todayQualified: false });
  });

  it('counts across a month boundary', () => {
    expect(computeStreak(['2026-07-31', '2026-08-01'], '2026-08-01').current).toBe(2);
  });

  it('counts five days across a year boundary', () => {
    expect(
      computeStreak(
        ['2025-12-29', '2025-12-30', '2025-12-31', '2026-01-01', '2026-01-02'],
        '2026-01-02',
      ).current,
    ).toBe(5);
  });

  it('marks today pending until it qualifies', () => {
    const week = buildStreakWeek(['2026-08-26'], '2026-08-27');
    const today = week.find((day) => day.date === '2026-08-27');
    const yesterday = week.find((day) => day.date === '2026-08-26');
    const tomorrow = week.find((day) => day.date === '2026-08-28');

    expect(today?.state).toBe('pending');
    expect(yesterday?.state).toBe('qualified');
    expect(tomorrow?.state).toBe('future');
  });

  it('labels each day of the strip so it can be read without a calendar', () => {
    const week = buildStreakWeek(['2026-08-27'], '2026-08-27');

    // 2026-08-27 is a Thursday.
    expect(week.find((day) => day.date === '2026-08-27')?.label).toBe('Pe');
    expect(week.map((day) => day.label)).toHaveLength(7);
  });
});

describe('streak milestones', () => {
  it('celebrates only the milestones the product actually marks', () => {
    expect(isStreakMilestone(12)).toBe(true);
    expect(isStreakMilestone(11)).toBe(false);
    expect(isStreakMilestone(0)).toBe(false);
  });
});
