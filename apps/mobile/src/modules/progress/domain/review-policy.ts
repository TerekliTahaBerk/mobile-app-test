import type { SkillId } from '@/modules/curriculum/domain/content-types';
import type { ReviewItem } from '@/modules/progress/domain/progress-types';
import type { EvidenceStrength } from '@/modules/progress/domain/mastery-policy';

/**
 * Spaced review, v1.
 *
 * A deterministic ladder, not an algorithm with hidden state. Review due times
 * are *instants*, deliberately unlike İz which counts local calendar days —
 * conflating the two would make scheduling drift with the learner's timezone.
 */

/** Days until the next review, indexed by the stage being completed. */
export const REVIEW_LADDER_DAYS = [1, 3, 7, 14, 30] as const;

export const FINAL_REVIEW_STAGE = REVIEW_LADDER_DAYS.length - 1;

const DAY_MS = 24 * 60 * 60 * 1000;

export function intervalDaysForStage(stage: number): number {
  const clamped = Math.min(Math.max(stage, 0), FINAL_REVIEW_STAGE);

  return REVIEW_LADDER_DAYS[clamped] ?? 1;
}

export type ReviewEvidence = {
  correct: boolean;
  observedAt: number;
  skillId: SkillId;
  strength: EvidenceStrength;
};

export function initialReviewItem(skillId: SkillId, atMs: number): ReviewItem {
  return {
    dueAt: new Date(atMs + intervalDaysForStage(0) * DAY_MS).toISOString(),
    skillId,
    stage: 0,
    updatedAt: new Date(atMs).toISOString(),
  };
}

/**
 * Advances a skill's schedule.
 *
 * - A strong correct answer schedules by the current stage's interval, then
 *   advances the stage, capped at the ladder's end.
 * - A weak correct answer (retry or hint) returns tomorrow without advancing —
 *   the learner got there, but not cleanly.
 * - An incorrect answer drops one stage and returns tomorrow.
 */
export function applyReviewEvidence(
  current: ReviewItem | null,
  evidence: ReviewEvidence,
): ReviewItem {
  const base = current ?? {
    dueAt: new Date(evidence.observedAt).toISOString(),
    skillId: evidence.skillId,
    stage: 0,
    updatedAt: new Date(evidence.observedAt).toISOString(),
  };

  const observedAtIso = new Date(evidence.observedAt).toISOString();
  const schedule = (days: number, stage: number): ReviewItem => ({
    dueAt: new Date(evidence.observedAt + days * DAY_MS).toISOString(),
    lastReviewedAt: observedAtIso,
    skillId: base.skillId,
    stage,
    updatedAt: observedAtIso,
  });

  if (!evidence.correct) {
    return schedule(1, Math.max(base.stage - 1, 0));
  }

  if (evidence.strength === 'weak') {
    return schedule(1, base.stage);
  }

  return schedule(
    intervalDaysForStage(base.stage),
    Math.min(base.stage + 1, FINAL_REVIEW_STAGE),
  );
}

export function isDue(item: ReviewItem, atMs: number): boolean {
  return Date.parse(item.dueAt) <= atMs;
}

/** Due items, most overdue first, ties broken by skill id so order is stable. */
export function sortDueItems(items: readonly ReviewItem[]): readonly ReviewItem[] {
  return [...items].sort((a, b) => {
    const byDue = Date.parse(a.dueAt) - Date.parse(b.dueAt);

    return byDue !== 0 ? byDue : a.skillId.localeCompare(b.skillId);
  });
}
