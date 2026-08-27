import type { SkillId } from '@/modules/curriculum/domain/content-types';
import {
  FINAL_REVIEW_STAGE,
  applyReviewEvidence,
  initialReviewItem,
  isDue,
  sortDueItems,
} from '@/modules/progress/domain/review-policy';

const SKILL_ID = 'skill.test.001' as SkillId;
const NOW = Date.parse('2026-08-27T18:00:00.000Z');
const DAY = 24 * 60 * 60 * 1000;

function daysUntilDue(dueAt: string, from: number): number {
  return Math.round((Date.parse(dueAt) - from) / DAY);
}

describe('spaced review', () => {
  it('schedules a first review for tomorrow', () => {
    expect(daysUntilDue(initialReviewItem(SKILL_ID, NOW).dueAt, NOW)).toBe(1);
  });

  it('walks the ladder on clean answers', () => {
    let item = initialReviewItem(SKILL_ID, NOW);
    const intervals: number[] = [];
    let at = NOW;

    for (let index = 0; index < 6; index += 1) {
      item = applyReviewEvidence(item, {
        correct: true,
        observedAt: at,
        skillId: SKILL_ID,
        strength: 'strong',
      });
      intervals.push(daysUntilDue(item.dueAt, at));
      at = Date.parse(item.dueAt);
    }

    expect(intervals).toEqual([1, 3, 7, 14, 30, 30]);
    expect(item.stage).toBe(FINAL_REVIEW_STAGE);
  });

  it('holds the stage when the answer needed a retry', () => {
    const first = applyReviewEvidence(null, {
      correct: true,
      observedAt: NOW,
      skillId: SKILL_ID,
      strength: 'strong',
    });
    const second = applyReviewEvidence(first, {
      correct: true,
      observedAt: NOW,
      skillId: SKILL_ID,
      strength: 'weak',
    });

    expect(second.stage).toBe(first.stage);
    expect(daysUntilDue(second.dueAt, NOW)).toBe(1);
  });

  it('drops a stage and returns tomorrow after a miss', () => {
    let item = applyReviewEvidence(null, {
      correct: true,
      observedAt: NOW,
      skillId: SKILL_ID,
      strength: 'strong',
    });
    item = applyReviewEvidence(item, {
      correct: true,
      observedAt: NOW,
      skillId: SKILL_ID,
      strength: 'strong',
    });
    expect(item.stage).toBe(2);

    const missed = applyReviewEvidence(item, {
      correct: false,
      observedAt: NOW,
      skillId: SKILL_ID,
      strength: 'strong',
    });

    expect(missed.stage).toBe(1);
    expect(daysUntilDue(missed.dueAt, NOW)).toBe(1);
  });

  it('orders due items most overdue first, stably', () => {
    const older = { dueAt: '2026-08-25T00:00:00.000Z', skillId: 'b' as SkillId, stage: 0, updatedAt: '' };
    const newer = { dueAt: '2026-08-26T00:00:00.000Z', skillId: 'a' as SkillId, stage: 0, updatedAt: '' };

    expect(sortDueItems([newer, older]).map((item) => item.skillId)).toEqual(['b', 'a']);
    expect(isDue(older, NOW)).toBe(true);
    expect(isDue({ ...older, dueAt: '2026-09-01T00:00:00.000Z' }, NOW)).toBe(false);
  });
});
