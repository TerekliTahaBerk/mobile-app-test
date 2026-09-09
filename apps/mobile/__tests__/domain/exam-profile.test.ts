import {
  examProgramKey,
  isMilestoneOneExamProfile,
  parseExamProfile,
  type ExamProfile,
  type KpssExamProfile,
  type LgsExamProfile,
  type YksExamProfile,
} from '@/modules/learner/domain/exam-profile';
import {
  examProfileFromLegacy,
  type LegacyLearnerProfile,
} from '@/modules/learner/domain/learner-profile';

describe('multi-exam profile', () => {
  it('distinguishes all YKS programs in the common contract', () => {
    const profiles = [
      { family: 'yks', grade: 'grade12', program: 'tyt', targetYear: 2027 },
      {
        family: 'yks',
        grade: 'grade12',
        program: 'ayt',
        targetYear: 2027,
        track: 'quantitative',
      },
      {
        family: 'yks',
        grade: 'graduate',
        language: 'en',
        program: 'ydt',
        targetYear: 2027,
      },
    ] satisfies readonly YksExamProfile[];

    expect(profiles.map(examProgramKey)).toEqual(['yks:tyt', 'yks:ayt', 'yks:ydt']);
  });

  it('represents LGS with its valid grade context', () => {
    const profile: LgsExamProfile = {
      family: 'lgs',
      grade: 'grade8',
      program: 'lgs',
      targetYear: 2027,
    };

    expect(examProgramKey(profile)).toBe('lgs:lgs');
  });

  it('extends KPSS through data-driven programs and variants', () => {
    const profile: KpssExamProfile = {
      family: 'kpss',
      program: 'general-talent-general-culture',
      targetYear: 2028,
      variants: [
        { dimension: 'educationLevel', value: 'lisans' },
        { dimension: 'module', value: 'generalCulture' },
      ],
    };

    const commonProfile: ExamProfile = profile;
    expect(examProgramKey(commonProfile)).toBe('kpss:general-talent-general-culture');
    expect(profile.variants).toContainEqual({ dimension: 'educationLevel', value: 'lisans' });
  });

  it('keeps production capability limited to YKS TYT', () => {
    const profiles: readonly ExamProfile[] = [
      { family: 'yks', grade: 'grade12', program: 'tyt', targetYear: 2027 },
      {
        family: 'yks',
        grade: 'grade12',
        program: 'ayt',
        targetYear: 2027,
        track: 'verbal',
      },
      { family: 'lgs', grade: 'grade8', program: 'lgs', targetYear: 2027 },
      { family: 'kpss', program: 'lisans', targetYear: 2027, variants: [] },
    ];

    expect(profiles.filter(isMilestoneOneExamProfile).map(examProgramKey)).toEqual(['yks:tyt']);
  });

  it('validates persisted open identifiers and family-specific requirements', () => {
    expect(
      parseExamProfile({
        family: 'kpss',
        program: 'general-culture',
        targetYear: 2028,
        variants: [{ dimension: 'educationLevel', value: 'lisans' }],
      }),
    ).toEqual({
      family: 'kpss',
      program: 'general-culture',
      targetYear: 2028,
      variants: [{ dimension: 'educationLevel', value: 'lisans' }],
    });
    expect(
      parseExamProfile({ family: 'kpss', program: '../unsafe', targetYear: 2028, variants: [] }),
    ).toBeNull();
    expect(
      parseExamProfile({ family: 'yks', grade: 'grade12', program: 'ayt', targetYear: 2028 }),
    ).toBeNull();
    expect(
      parseExamProfile({
        family: 'yks',
        grade: 'grade12',
        language: 'not a tag',
        program: 'ydt',
        targetYear: 2028,
      }),
    ).toBeNull();
  });

  it('projects the persisted YKS profile and flags ambiguous LGS rows for migration', () => {
    const legacyYks: LegacyLearnerProfile = {
      avatarId: 'initial',
      completedAtIso: '2026-08-28T09:00:00.000Z',
      dailyGoal: 3,
      displayName: 'Ege',
      exam: 'yks',
      grade: 'grade12',
      remindersEnabled: false,
      startingPoint: 'scratch',
      targetYear: 2027,
      track: 'quantitative',
      weeklyReportDay: 0,
    };

    expect(examProfileFromLegacy(legacyYks)).toEqual({
      examProfile: {
        family: 'yks',
        grade: 'grade12',
        program: 'tyt',
        targetYear: 2027,
        track: 'quantitative',
      },
      status: 'compatible',
    });
    expect(examProfileFromLegacy({ ...legacyYks, exam: 'lgs' })).toEqual({
      examFamily: 'lgs',
      reason: 'legacyLgsGrade',
      status: 'migrationRequired',
    });
  });
});
