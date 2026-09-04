/**
 * What the learner told us during onboarding.
 *
 * This is preference data, not identity: there is no account, no email, and no
 * device identifier here. The display name exists because the league shows it,
 * and it is the learner's own choice of what to be called — see
 * docs/SECURITY.md.
 */

export type ExamTarget = 'lgs' | 'yks';

/** The YKS track. `undecided` is a real answer, not a missing one. */
export type StudyTrack = 'equalWeight' | 'quantitative' | 'undecided' | 'verbal';

export type GradeLevel = 'grade10' | 'grade11' | 'grade12' | 'grade9' | 'graduate';

export type ReferralSource =
  | 'appStore'
  | 'friend'
  | 'other'
  | 'school'
  | 'social'
  | 'youtube';

/** Rounds per day. The design offers a calm, a regular and an exam pace. */
export type DailyGoal = 1 | 3 | 6;

export type ReminderTime = '17:00' | '20:00' | '22:00';

export type StartingPoint = 'placement' | 'scratch';

/** Which weekday closes the learner's reporting week. 0 = Pazar. */
export type WeeklyReportDay = 0 | 1 | 2 | 3 | 4 | 5 | 6;

export const DISPLAY_NAME_MAX_LENGTH = 20;

export const AVATAR_IDS = ['initial', 'dino', 'sky', 'violet'] as const;

export type AvatarId = (typeof AVATAR_IDS)[number];

export type LearnerProfile = {
  avatarId: AvatarId;
  completedAtIso: string;
  dailyGoal: DailyGoal;
  displayName: string;
  exam: ExamTarget;
  grade: GradeLevel;
  readonly referralSource?: ReferralSource;
  readonly reminderTime?: ReminderTime;
  remindersEnabled: boolean;
  startingPoint: StartingPoint;
  /** The day the weekly report closes on. */
  weeklyReportDay: WeeklyReportDay;
  /** Absent for LGS, where there is no track to choose. */
  readonly track?: StudyTrack;
  /** Calendar year of the exam being prepared for. */
  targetYear: number;
};

/**
 * The in-progress answers, before the last step is confirmed.
 *
 * Every field accepts an explicit `undefined` because answers can be cleared
 * as well as set — choosing LGS drops a track the learner had already picked.
 */
export type OnboardingDraft = {
  readonly avatarId?: AvatarId | undefined;
  readonly dailyGoal?: DailyGoal | undefined;
  readonly displayName?: string | undefined;
  readonly exam?: ExamTarget | undefined;
  readonly grade?: GradeLevel | undefined;
  readonly referralSource?: ReferralSource | undefined;
  readonly reminderTime?: ReminderTime | undefined;
  readonly remindersEnabled?: boolean | undefined;
  readonly startingPoint?: StartingPoint | undefined;
  readonly targetYear?: number | undefined;
  readonly track?: StudyTrack | undefined;
};

export class IncompleteProfileError extends Error {
  constructor(field: string) {
    super(`Onboarding tamamlanmadı: "${field}" yanıtı eksik.`);
    this.name = 'IncompleteProfileError';
  }
}

/**
 * Turns a finished draft into a profile, or explains what is still missing.
 * The track is only required when the exam has one.
 */
export function completeOnboarding(
  draft: OnboardingDraft,
  completedAtIso: string,
): LearnerProfile {
  const exam = required(draft.exam, 'exam');
  const displayName = normalizeDisplayName(required(draft.displayName, 'displayName'));
  if (displayName.length === 0) {
    throw new IncompleteProfileError('displayName');
  }

  return {
    avatarId: draft.avatarId ?? 'initial',
    completedAtIso,
    dailyGoal: draft.dailyGoal ?? 3,
    displayName,
    exam,
    grade: required(draft.grade, 'grade'),
    ...(draft.referralSource === undefined ? {} : { referralSource: draft.referralSource }),
    ...(draft.reminderTime === undefined ? {} : { reminderTime: draft.reminderTime }),
    remindersEnabled: draft.remindersEnabled ?? false,
    startingPoint: draft.startingPoint ?? 'scratch',
    weeklyReportDay: 0,
    targetYear: required(draft.targetYear, 'targetYear'),
    ...(exam === 'lgs' ? {} : { track: draft.track ?? 'undecided' }),
  };
}

/** Trims and caps the name to what the league row can show. */
export function normalizeDisplayName(value: string): string {
  return value.replace(/\s+/gu, ' ').trim().slice(0, DISPLAY_NAME_MAX_LENGTH);
}

/** The single-character fallback avatar, e.g. "Ege" → "E". */
export function initialFor(displayName: string): string {
  return [...normalizeDisplayName(displayName)][0]?.toLocaleUpperCase('tr-TR') ?? '?';
}

/** The curriculum scope the profile actually receives in the current pilot. */
export function describeProfile(profile: LearnerProfile): string {
  return profile.exam === 'yks' ? `TYT Sosyal · ${profile.targetYear}` : 'LGS';
}

export const TRACK_LABELS: Record<StudyTrack, string> = {
  equalWeight: 'Eşit Ağırlık',
  quantitative: 'Sayısal',
  undecided: 'Henüz belli değil',
  verbal: 'Sözel',
};

export const GRADE_LABELS: Record<GradeLevel, string> = {
  grade9: '9. sınıf',
  grade10: '10. sınıf',
  grade11: '11. sınıf',
  grade12: '12. sınıf',
  graduate: 'Mezun',
};

function required<TValue>(value: TValue | undefined, field: string): TValue {
  if (value === undefined) {
    throw new IncompleteProfileError(field);
  }

  return value;
}
