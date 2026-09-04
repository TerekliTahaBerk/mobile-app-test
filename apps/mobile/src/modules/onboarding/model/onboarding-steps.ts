import type {
  DailyGoal,
  GradeLevel,
  OnboardingDraft,
  ReminderTime,
  StartingPoint,
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
  | 'start';

/** Milestone 1 questions, in order. Welcome and summary are not steps. */
export const ONBOARDING_STEPS: readonly OnboardingStepId[] = [
  'exam',
  'grade',
  'identity',
  'start',
  'goal',
];

export function applicableSteps(_draft: OnboardingDraft): readonly OnboardingStepId[] {
  return ONBOARDING_STEPS;
}

/** Whether the learner has answered enough of this step to move on. */
export function canAdvance(step: OnboardingStepId, draft: OnboardingDraft): boolean {
  switch (step) {
    case 'exam':
      return draft.exam !== undefined;
    case 'grade':
      return draft.grade !== undefined;
    case 'identity':
      return (draft.displayName ?? '').trim().length > 0;
    case 'start':
      return draft.startingPoint !== undefined;
    case 'goal':
      return draft.dailyGoal !== undefined;
  }
}

/** Steps a learner may pass without answering. */
export function isSkippable(step: OnboardingStepId): boolean {
  return step === 'start';
}

export const GRADE_CHOICES: readonly { label: string; value: GradeLevel }[] = [
  { label: '9. sınıf', value: 'grade9' },
  { label: '10. sınıf', value: 'grade10' },
  { label: '11. sınıf', value: 'grade11' },
  { label: '12. sınıf', value: 'grade12' },
  { label: 'Mezun', value: 'graduate' },
];

export const START_CHOICES: readonly {
  detail: string;
  label: string;
  value: StartingPoint;
}[] = [
  // The diagnostic measures and plans; it never marks curriculum as done, so
  // the copy promises a map rather than a shortcut through the path.
  { detail: 'Kısa tur · konu haritanı çıkarayım', label: 'Seviyemi ölç', value: 'placement' },
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
