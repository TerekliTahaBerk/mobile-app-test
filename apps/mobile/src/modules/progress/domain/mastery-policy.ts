import type { SkillId, Timestamp } from '@/modules/curriculum/domain/content-types';
import {
  MASTERY_POLICY_VERSION,
  type SkillMastery,
} from '@/modules/progress/domain/progress-types';

/**
 * Mastery, v1 — a Beta-evidence model.
 *
 * Each skill accumulates successes (`alpha`) and failures (`beta`); the
 * estimate is `alpha / (alpha + beta)`. Storing the evidence rather than the
 * percentage means the number can always be explained and recomputed, and the
 * formula can be replaced without discarding what the learner did.
 *
 * The prior is `alpha 1, beta 3` → 0.25. A learner starts low but not at zero,
 * and a single lucky answer cannot imply mastery.
 *
 * Mastery is not XP. XP measures activity; this estimates knowledge.
 */

export const MASTERY_PRIOR = { alpha: 1, beta: 3 } as const;

/**
 * How much a piece of evidence is worth. `strong` is a first-attempt correct
 * answer with no help; `weak` is correct after a retry or a hint. Hints do not
 * exist yet, but the boundary does so adding them later changes no call site.
 */
export type EvidenceStrength = 'strong' | 'weak';

export type MasteryEvidence = {
  correct: boolean;
  observedAt: Timestamp;
  skillId: SkillId;
  strength: EvidenceStrength;
};

const ALPHA_GAIN = { strong: 1, weak: 0.5 } as const;
const BETA_GAIN = 1;

export function initialMastery(skillId: SkillId): SkillMastery {
  return {
    alpha: MASTERY_PRIOR.alpha,
    beta: MASTERY_PRIOR.beta,
    evidenceCount: 0,
    policyVersion: MASTERY_POLICY_VERSION,
    skillId,
  };
}

/** Folds one observation into a skill's evidence. Pure. */
export function applyMasteryEvidence(
  current: SkillMastery | null,
  evidence: MasteryEvidence,
): SkillMastery {
  const base = current ?? initialMastery(evidence.skillId);

  return {
    alpha: base.alpha + (evidence.correct ? ALPHA_GAIN[evidence.strength] : 0),
    beta: base.beta + (evidence.correct ? 0 : BETA_GAIN),
    evidenceCount: base.evidenceCount + 1,
    lastEvidenceAt: evidence.observedAt,
    policyVersion: MASTERY_POLICY_VERSION,
    skillId: base.skillId,
  };
}

/** The estimate, clamped defensively to [0, 1]. */
export function masteryEstimate(mastery: SkillMastery): number {
  const total = mastery.alpha + mastery.beta;
  if (total <= 0) {
    return 0;
  }

  return Math.min(1, Math.max(0, mastery.alpha / total));
}

export type MasteryBand = 'building' | 'starting' | 'strong';

/**
 * Broad bands for display. Learner-facing surfaces must never show a raw
 * probability — the precision would imply a confidence the model does not have.
 */
export function masteryBand(mastery: SkillMastery): MasteryBand {
  const estimate = masteryEstimate(mastery);
  if (estimate >= 0.75) {
    return 'strong';
  }

  return estimate >= 0.45 ? 'building' : 'starting';
}

export function masteryPercent(mastery: SkillMastery): number {
  return Math.round(masteryEstimate(mastery) * 100);
}
