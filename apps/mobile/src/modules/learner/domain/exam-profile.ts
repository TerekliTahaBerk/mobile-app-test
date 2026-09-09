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

const YKS_GRADES: readonly YksGradeLevel[] = [
  'grade9',
  'grade10',
  'grade11',
  'grade12',
  'graduate',
];
const YKS_TRACKS: readonly YksStudyTrack[] = [
  'equalWeight',
  'quantitative',
  'undecided',
  'verbal',
];
const OPEN_IDENTIFIER = /^[A-Za-z0-9]+(?:[._-][A-Za-z0-9]+)*$/u;
const LANGUAGE_CODE = /^[A-Za-z]{2,8}(?:-[A-Za-z0-9]{1,8})*$/u;

/**
 * Parses persisted or network-shaped data without trusting its assertions.
 * Open KPSS identifiers are still constrained to stable, portable keys at the
 * boundary; an invalid value never reaches the discriminated domain union.
 */
export function parseExamProfile(value: unknown): ExamProfile | null {
  if (!isRecord(value) || !isTargetYear(value.targetYear)) {
    return null;
  }

  if (value.family === 'yks' && isYksGrade(value.grade)) {
    if (value.program === 'tyt') {
      if (
        (value.track !== undefined && !isYksTrack(value.track)) ||
        value.language !== undefined ||
        value.variants !== undefined
      ) {
        return null;
      }
      return {
        family: 'yks',
        grade: value.grade,
        program: 'tyt',
        targetYear: value.targetYear,
        ...(value.track === undefined ? {} : { track: value.track }),
      };
    }
    if (
      value.program === 'ayt' &&
      isYksTrack(value.track) &&
      value.language === undefined &&
      value.variants === undefined
    ) {
      return {
        family: 'yks',
        grade: value.grade,
        program: 'ayt',
        targetYear: value.targetYear,
        track: value.track,
      };
    }
    if (
      value.program === 'ydt' &&
      typeof value.language === 'string' &&
      LANGUAGE_CODE.test(value.language) &&
      value.track === undefined &&
      value.variants === undefined
    ) {
      return {
        family: 'yks',
        grade: value.grade,
        language: value.language,
        program: 'ydt',
        targetYear: value.targetYear,
      };
    }
    return null;
  }

  if (value.family === 'lgs') {
    return value.program === 'lgs' &&
      value.grade === 'grade8' &&
      value.track === undefined &&
      value.language === undefined &&
      value.variants === undefined
      ? { family: 'lgs', grade: 'grade8', program: 'lgs', targetYear: value.targetYear }
      : null;
  }

  if (
    value.family === 'kpss' &&
    typeof value.program === 'string' &&
    OPEN_IDENTIFIER.test(value.program) &&
    Array.isArray(value.variants) &&
    value.grade === undefined &&
    value.track === undefined &&
    value.language === undefined
  ) {
    const variants: KpssVariant[] = [];
    for (const variant of value.variants) {
      if (
        !isRecord(variant) ||
        typeof variant.dimension !== 'string' ||
        !OPEN_IDENTIFIER.test(variant.dimension) ||
        typeof variant.value !== 'string' ||
        !OPEN_IDENTIFIER.test(variant.value)
      ) {
        return null;
      }
      variants.push({ dimension: variant.dimension, value: variant.value });
    }
    return {
      family: 'kpss',
      program: value.program,
      targetYear: value.targetYear,
      variants,
    };
  }

  return null;
}

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

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isTargetYear(value: unknown): value is number {
  return Number.isInteger(value) && (value as number) >= 2000 && (value as number) <= 3000;
}

function isYksGrade(value: unknown): value is YksGradeLevel {
  return YKS_GRADES.includes(value as YksGradeLevel);
}

function isYksTrack(value: unknown): value is YksStudyTrack {
  return YKS_TRACKS.includes(value as YksStudyTrack);
}
