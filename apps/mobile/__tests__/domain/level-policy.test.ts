import { levelForXp, xpRequiredForLevel } from '@/modules/progress/domain/level-policy';

describe('XP levels', () => {
  it('widens the ladder by a fixed step', () => {
    expect(xpRequiredForLevel(1)).toBe(300);
    expect(xpRequiredForLevel(2)).toBe(400);
    expect(xpRequiredForLevel(8)).toBe(1000);
  });

  it('rejects a level below one rather than inventing a requirement', () => {
    expect(() => xpRequiredForLevel(0)).toThrow(RangeError);
  });

  it('puts a fresh learner at level one with nothing banked', () => {
    expect(levelForXp(0)).toEqual({
      level: 1,
      progress: 0,
      xpForLevel: 300,
      xpIntoLevel: 0,
    });
  });

  it('carries the remainder into the next level', () => {
    expect(levelForXp(300)).toMatchObject({ level: 2, xpIntoLevel: 0, xpForLevel: 400 });
    expect(levelForXp(450)).toMatchObject({ level: 2, xpIntoLevel: 150 });
  });

  it('treats a negative or fractional total as the floor it can support', () => {
    expect(levelForXp(-50).level).toBe(1);
    expect(levelForXp(300.9)).toMatchObject({ level: 2, xpIntoLevel: 0 });
  });
});
