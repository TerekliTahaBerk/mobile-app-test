import {
  applicableSteps,
  canAdvance,
  isSkippable,
  ONBOARDING_STEPS,
} from '@/modules/onboarding/model/onboarding-steps';

describe('onboarding flow shape', () => {
  it('asks only questions that affect the Milestone 1 experience', () => {
    expect(applicableSteps({ exam: 'yks' })).toEqual(ONBOARDING_STEPS);
    expect(ONBOARDING_STEPS).not.toContain('track');
    expect(ONBOARDING_STEPS).not.toContain('referral');
  });

  it('holds a step until it has been answered', () => {
    expect(canAdvance('exam', {})).toBe(false);
    expect(canAdvance('exam', { exam: 'yks' })).toBe(true);
  });

  it('requires only the grade on the grade step', () => {
    expect(canAdvance('grade', {})).toBe(false);
    expect(canAdvance('grade', { grade: 'grade12' })).toBe(true);
  });

  it('does not accept a blank name', () => {
    expect(canAdvance('identity', { displayName: '  ' })).toBe(false);
    expect(canAdvance('identity', { displayName: 'Ege' })).toBe(true);
  });

  it('lets the optional steps be passed without an answer', () => {
    expect(isSkippable('start')).toBe(true);
    expect(isSkippable('exam')).toBe(false);
  });
});
