import type {
  DailyGoal,
  GradeLevel,
  OnboardingDraft,
  ReferralSource,
  ReminderTime,
  StartingPoint,
  StudyTrack,
} from '@/modules/learner/domain/learner-profile';

/**
 * The onboarding questionnaire, as data.
 *
 * Keeping the questions here rather than inside the screen means the flow's
 * shape — how many steps there are, which one is skippable, which answer
 * hides a later step — is testable without rendering anything.
 */

export type OnboardingStepId =
  | 'exam'
  | 'goal'
  | 'grade'
  | 'identity'
  | 'referral'
  | 'start'
  | 'track';

/** The seven answered steps, in order. The welcome and summary screens are not steps. */
export const ONBOARDING_STEPS: readonly OnboardingStepId[] = [
  'exam',
  'track',
  'grade',
  'identity',
  'referral',
  'start',
  'goal',
];

/**
 * The steps that actually apply to a draft. LGS has no track to choose, so the
 * rail shrinks rather than showing a step that will be skipped.
 */
export function applicableSteps(draft: OnboardingDraft): readonly OnboardingStepId[] {
  return draft.exam === 'lgs'
    ? ONBOARDING_STEPS.filter((step) => step !== 'track')
    : ONBOARDING_STEPS;
}

/** Whether the learner has answered enough of this step to move on. */
export function canAdvance(step: OnboardingStepId, draft: OnboardingDraft): boolean {
  switch (step) {
    case 'exam':
      return draft.exam !== undefined;
    case 'track':
      return draft.track !== undefined;
    case 'grade':
      return draft.grade !== undefined && draft.targetYear !== undefined;
    case 'identity':
      return (draft.displayName ?? '').trim().length > 0;
    case 'referral':
      return draft.referralSource !== undefined;
    case 'start':
      return draft.startingPoint !== undefined;
    case 'goal':
      return draft.dailyGoal !== undefined;
  }
}

/** Steps a learner may pass without answering. */
export function isSkippable(step: OnboardingStepId): boolean {
  return step === 'referral' || step === 'start';
}

export const TRACK_CHOICES: readonly {
  detail: string;
  label: string;
  value: StudyTrack;
}[] = [
  { detail: 'Matematik · Fizik · Kimya · Biyoloji', label: 'Sayısal', value: 'quantitative' },
  { detail: 'Matematik · Türkçe · Tarih · Coğrafya', label: 'Eşit Ağırlık', value: 'equalWeight' },
  { detail: 'Türkçe · Tarih · Coğrafya · Felsefe', label: 'Sözel', value: 'verbal' },
  { detail: 'TYT dersleriyle başlarız', label: 'Henüz bilmiyorum', value: 'undecided' },
];

export const GRADE_CHOICES: readonly { label: string; value: GradeLevel }[] = [
  { label: '9. sınıf', value: 'grade9' },
  { label: '10. sınıf', value: 'grade10' },
  { label: '11. sınıf', value: 'grade11' },
  { label: '12. sınıf', value: 'grade12' },
  { label: 'Mezun', value: 'graduate' },
];

export const REFERRAL_CHOICES: readonly { label: string; value: ReferralSource }[] = [
  { label: 'Instagram / TikTok', value: 'social' },
  { label: 'Arkadaşım söyledi', value: 'friend' },
  { label: 'YouTube', value: 'youtube' },
  { label: 'Okul / öğretmen', value: 'school' },
  { label: 'App Store', value: 'appStore' },
  { label: 'Başka bir yer', value: 'other' },
];

export const START_CHOICES: readonly {
  detail: string;
  label: string;
  value: StartingPoint;
}[] = [
  { detail: '4 soru · doğru üniteden başla', label: 'Seviyemi ölç', value: 'placement' },
  { detail: 'İlk üniteden ilerle', label: 'Sıfırdan başla', value: 'scratch' },
];

export const GOAL_CHOICES: readonly {
  detail: string;
  label: string;
  popular: boolean;
  value: DailyGoal;
}[] = [
  { detail: '1 tur · ~5 dk', label: 'Sakin', popular: false, value: 1 },
  { detail: '3 tur · ~15 dk', label: 'Düzenli', popular: true, value: 3 },
  { detail: '6 tur · ~30 dk', label: 'Sınav modu', popular: false, value: 6 },
];

export const REMINDER_CHOICES: readonly ReminderTime[] = ['17:00', '20:00', '22:00'];

/** Three exam years starting from the next one the learner could sit. */
export function targetYearChoices(currentYear: number): readonly number[] {
  return [currentYear + 1, currentYear + 2, currentYear + 3];
}
