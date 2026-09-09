/**
 * Exam-specific learner context.
 *
 * This contract deliberately models exam identity separately from curriculum
 * content IDs and from persistence schemas. It is serializable domain data and
 * must remain free of UI, Expo and storage concerns.
 */

export type ExamFamily = 'kpss' | 'lgs' | 'yks';

export type YksProgram = 'ayt' | 'tyt' | 'ydt';

export type LgsProgram = 'lgs';

/** Stable identifier supplied by a future KPSS program catalogue. */
export type KpssProgramId = string;

export type YksGradeLevel = 'grade10' | 'grade11' | 'grade12' | 'grade9' | 'graduate';

/** `undecided` is a real learner choice, not a missing value. */
export type YksStudyTrack = 'equalWeight' | 'quantitative' | 'undecided' | 'verbal';

/** BCP 47 language tag, for example `en`, `de` or `ar`. */
export type LanguageCode = string;

type ExamProfileBase<TFamily extends ExamFamily, TProgram extends string> = {
  readonly family: TFamily;
  readonly program: TProgram;
  /** Calendar year of the exam being prepared for. */
  readonly targetYear: number;
};

type YksExamProfileBase<TProgram extends YksProgram> = ExamProfileBase<'yks', TProgram> & {
  readonly grade: YksGradeLevel;
};

export type YksExamProfile =
  | (YksExamProfileBase<'tyt'> & {
      /** May describe the learner's longer-term direction while studying TYT. */
      readonly track?: YksStudyTrack;
    })
  | (YksExamProfileBase<'ayt'> & {
      readonly track: YksStudyTrack;
    })
  | (YksExamProfileBase<'ydt'> & {
      readonly language: LanguageCode;
    });

export type LgsExamProfile = ExamProfileBase<'lgs', LgsProgram> & {
  readonly grade: 'grade8';
};

/**
 * A KPSS variant is an open dimension/value pair rather than a growing enum.
 * Examples include `{ dimension: 'educationLevel', value: 'lisans' }` and
 * `{ dimension: 'module', value: 'generalAbility' }`.
 */
export type KpssVariant = {
  readonly dimension: string;
  readonly value: string;
};

/**
 * KPSS program IDs are stable domain identifiers supplied by a future program
 * catalogue. New education levels or modules do not require changing this
 * union or the learner-profile schema.
 */
export type KpssExamProfile = ExamProfileBase<'kpss', KpssProgramId> & {
  readonly variants: readonly KpssVariant[];
};

/** The common learner-facing contract for every supported exam family. */
export type ExamProfile = KpssExamProfile | LgsExamProfile | YksExamProfile;

/** Stable key for capability lookup; variant eligibility is evaluated separately. */
export function examProgramKey(profile: ExamProfile): string {
  return `${profile.family}:${profile.program}`;
}

/** Production remains intentionally limited to the Milestone 1 TYT pilot. */
export function isMilestoneOneExamProfile(profile: ExamProfile): profile is YksExamProfile & {
  readonly program: 'tyt';
} {
  return profile.family === 'yks' && profile.program === 'tyt';
}
