import { buildIzWeek, computeIz } from '@/modules/progress/domain/iz-policy';

describe('İz', () => {
  it('counts consecutive qualifying days ending today', () => {
    expect(computeIz(['2026-08-25', '2026-08-26', '2026-08-27'], '2026-08-27')).toEqual({
      current: 3,
      todayQualified: true,
    });
  });

  it('keeps the run alive on a day that has not been studied yet', () => {
    // The grace rule: yesterday qualified, today is still open. Breaking the
    // run at midnight would punish the learner for the clock.
    expect(computeIz(['2026-08-25', '2026-08-26'], '2026-08-27')).toEqual({
      current: 2,
      todayQualified: false,
    });
  });

  it('breaks once a full day has been missed', () => {
    expect(computeIz(['2026-08-24', '2026-08-25'], '2026-08-27')).toEqual({
      current: 0,
      todayQualified: false,
    });
  });

  it('starts at zero with no history', () => {
    expect(computeIz([], '2026-08-27')).toEqual({ current: 0, todayQualified: false });
  });

  it('counts across a month boundary', () => {
    expect(computeIz(['2026-07-31', '2026-08-01'], '2026-08-01').current).toBe(2);
  });

  it('marks today pending until it qualifies', () => {
    const week = buildIzWeek(['2026-08-26'], '2026-08-27');
    const today = week.find((day) => day.date === '2026-08-27');
    const yesterday = week.find((day) => day.date === '2026-08-26');
    const tomorrow = week.find((day) => day.date === '2026-08-28');

    expect(today?.state).toBe('pending');
    expect(yesterday?.state).toBe('qualified');
    expect(tomorrow?.state).toBe('future');
  });
});
