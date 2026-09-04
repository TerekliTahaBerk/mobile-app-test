import {
  completeOnboarding,
  describeProfile,
  initialFor,
  normalizeDisplayName,
  IncompleteProfileError,
  type OnboardingDraft,
} from '@/modules/learner/domain/learner-profile';

const COMPLETE: OnboardingDraft = {
  dailyGoal: 3,
  displayName: 'Ege',
  exam: 'yks',
  grade: 'grade12',
  referralSource: 'social',
  remindersEnabled: true,
  reminderTime: '20:00',
  startingPoint: 'placement',
  targetYear: 2027,
  track: 'quantitative',
};

describe('learner profile', () => {
  it('builds a profile from a finished draft', () => {
    const profile = completeOnboarding(COMPLETE, '2026-08-28T09:00:00.000Z');

    expect(profile).toMatchObject({
      displayName: 'Ege',
      exam: 'yks',
      targetYear: 2027,
      track: 'quantitative',
    });
    expect(describeProfile(profile)).toBe('TYT Sosyal · 2027');
  });

  it('names the missing answer rather than producing a half profile', () => {
    const { grade: _dropped, ...withoutGrade } = COMPLETE;

    expect(() => completeOnboarding(withoutGrade, '2026-08-28T09:00:00.000Z')).toThrow(
      IncompleteProfileError,
    );
  });

  it('rejects a name that is only whitespace', () => {
    expect(() =>
      completeOnboarding({ ...COMPLETE, displayName: '   ' }, '2026-08-28T09:00:00.000Z'),
    ).toThrow(IncompleteProfileError);
  });

  it('carries no track for an exam that has none', () => {
    const profile = completeOnboarding(
      { ...COMPLETE, exam: 'lgs', grade: 'grade9' },
      '2026-08-28T09:00:00.000Z',
    );

    expect(profile.track).toBeUndefined();
    expect(describeProfile(profile)).toBe('LGS');
  });

  it('normalizes and caps the display name the league will show', () => {
    expect(normalizeDisplayName('  Ege   Can  ')).toBe('Ege Can');
    expect(normalizeDisplayName('x'.repeat(40))).toHaveLength(20);
  });

  it('takes the initial with Turkish casing', () => {
    expect(initialFor('ilker')).toBe('İ');
    expect(initialFor('')).toBe('?');
  });
});
