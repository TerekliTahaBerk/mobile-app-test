import {
  applicableSteps,
  canAdvance,
  isSkippable,
  targetYearChoices,
  ONBOARDING_STEPS,
} from '@/modules/onboarding/model/onboarding-steps';

describe('onboarding flow shape', () => {
  it('drops the track question for an exam that has no track', () => {
    expect(applicableSteps({ exam: 'yks' })).toEqual(ONBOARDING_STEPS);
    expect(applicableSteps({ exam: 'lgs' })).not.toContain('track');
    expect(applicableSteps({ exam: 'lgs' })).toHaveLength(ONBOARDING_STEPS.length - 1);
  });

  it('holds a step until it has been answered', () => {
    expect(canAdvance('exam', {})).toBe(false);
    expect(canAdvance('exam', { exam: 'yks' })).toBe(true);
  });

  it('requires both halves of the grade step', () => {
    expect(canAdvance('grade', { grade: 'grade12' })).toBe(false);
    expect(canAdvance('grade', { grade: 'grade12', targetYear: 2027 })).toBe(true);
  });

  it('does not accept a blank name', () => {
    expect(canAdvance('identity', { displayName: '  ' })).toBe(false);
    expect(canAdvance('identity', { displayName: 'Ege' })).toBe(true);
  });

  it('lets the optional steps be passed without an answer', () => {
    expect(isSkippable('referral')).toBe(true);
    expect(isSkippable('start')).toBe(true);
    expect(isSkippable('exam')).toBe(false);
  });

  it('offers the next three exam years', () => {
    expect(targetYearChoices(2026)).toEqual([2027, 2028, 2029]);
  });
});
