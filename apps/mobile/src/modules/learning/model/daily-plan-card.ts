import type { DailyPlan, DailyPlanPartKind } from '@/modules/learning/domain/daily-plan';

/** One explained line of today's plan: "5 zayıf konu sorusu". */
export type DailyPlanLine = {
  count: number;
  kind: DailyPlanPartKind;
  label: string;
};

/**
 * Today's plan as any screen states it. The breakdown is the point: a learner
 * should be able to see what the day is made of before they agree to it.
 */
export type DailyPlanCard = {
  actionLabel: string;
  /** "4 farklı konudan karışık" */
  detail: string;
  /** "Bugün 12 soru" */
  headline: string;
  lines: readonly DailyPlanLine[];
};

const PART_LABELS: Readonly<Record<DailyPlanPartKind, string>> = {
  newMaterial: 'yeni konu sorusu',
  refresh: 'güçlü konu kontrolü',
  review: 'zamanı gelen tekrar',
  weakTopic: 'zayıf konu sorusu',
};

/**
 * States the day as what it is made of. The counts are the plan's own, never
 * the intended quota, so a short day reads as short rather than as complete.
 */
export function buildDailyPlanCard(plan: DailyPlan): DailyPlanCard | null {
  if (plan.exercises.length === 0) {
    return null;
  }

  return {
    actionLabel: 'Başla',
    detail: plan.topicCount <= 1 ? 'Tek konudan' : `${plan.topicCount} farklı konudan karışık`,
    headline: `Bugün ${plan.exercises.length} soru`,
    lines: plan.parts.map((part) => ({
      count: part.exercises.length,
      kind: part.kind,
      label: PART_LABELS[part.kind],
    })),
  };
}
