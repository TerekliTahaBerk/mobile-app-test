import {
  applyMasteryEvidence,
  initialMastery,
  masteryBand,
  masteryEstimate,
  masteryPercent,
} from '@/modules/progress/domain/mastery-policy';
import type { SkillId } from '@/modules/curriculum/domain/content-types';

const SKILL_ID = 'skill.test.001' as SkillId;
const AT = '2026-08-27T18:00:00.000Z';

describe('mastery', () => {
  it('starts low but not at zero', () => {
    expect(masteryEstimate(initialMastery(SKILL_ID))).toBeCloseTo(0.25);
    expect(masteryBand(initialMastery(SKILL_ID))).toBe('starting');
  });

  it('does not call a single correct answer mastery', () => {
    const after = applyMasteryEvidence(null, {
      correct: true,
      observedAt: AT,
      skillId: SKILL_ID,
      strength: 'strong',
    });

    expect(masteryPercent(after)).toBe(40);
    expect(masteryBand(after)).toBe('starting');
  });

  it('counts a retry as weaker evidence than a clean answer', () => {
    const strong = applyMasteryEvidence(null, {
      correct: true,
      observedAt: AT,
      skillId: SKILL_ID,
      strength: 'strong',
    });
    const weak = applyMasteryEvidence(null, {
      correct: true,
      observedAt: AT,
      skillId: SKILL_ID,
      strength: 'weak',
    });

    expect(masteryEstimate(weak)).toBeLessThan(masteryEstimate(strong));
  });

  it('rises into strong only with repeated success', () => {
    let mastery = initialMastery(SKILL_ID);
    for (let index = 0; index < 8; index += 1) {
      mastery = applyMasteryEvidence(mastery, {
        correct: true,
        observedAt: AT,
        skillId: SKILL_ID,
        strength: 'strong',
      });
    }

    expect(mastery.evidenceCount).toBe(8);
    expect(masteryBand(mastery)).toBe('strong');
  });

  it('falls back when the learner misses', () => {
    const before = applyMasteryEvidence(null, {
      correct: true,
      observedAt: AT,
      skillId: SKILL_ID,
      strength: 'strong',
    });
    const after = applyMasteryEvidence(before, {
      correct: false,
      observedAt: AT,
      skillId: SKILL_ID,
      strength: 'strong',
    });

    expect(masteryEstimate(after)).toBeLessThan(masteryEstimate(before));
  });
});
