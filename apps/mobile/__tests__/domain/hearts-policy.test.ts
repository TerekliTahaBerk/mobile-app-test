import {
  formatHeartWait,
  fullHearts,
  grantHeart,
  readHearts,
  spendHeart,
  MAX_HEARTS,
  REFILL_INTERVAL_MS,
} from '@/modules/progress/domain/hearts-policy';

const T0 = 1_700_000_000_000;

describe('hearts', () => {
  it('starts full and reports nothing pending', () => {
    expect(readHearts(fullHearts(T0), T0)).toEqual({
      hearts: MAX_HEARTS,
      nextHeartInMs: null,
      unlimited: false,
    });
  });

  it('spends one heart and starts the refill window from that moment', () => {
    const spent = spendHeart(fullHearts(T0), T0);

    expect(spent).toEqual({ hearts: MAX_HEARTS - 1, updatedAtMs: T0 });
    expect(readHearts(spent, T0)).toMatchObject({
      hearts: MAX_HEARTS - 1,
      nextHeartInMs: REFILL_INTERVAL_MS,
    });
  });

  it('regenerates from elapsed time rather than a timer', () => {
    const record = { hearts: 1, updatedAtMs: T0 };

    expect(readHearts(record, T0 + REFILL_INTERVAL_MS * 2).hearts).toBe(3);
    expect(readHearts(record, T0 + REFILL_INTERVAL_MS * 2).nextHeartInMs).toBe(
      REFILL_INTERVAL_MS,
    );
  });

  it('caps regeneration at the maximum and stops counting down there', () => {
    expect(readHearts({ hearts: 0, updatedAtMs: T0 }, T0 + REFILL_INTERVAL_MS * 99)).toEqual({
      hearts: MAX_HEARTS,
      nextHeartInMs: null,
      unlimited: false,
    });
  });

  it('never lets a backwards clock take hearts away', () => {
    const record = { hearts: 2, updatedAtMs: T0 };

    expect(readHearts(record, T0 - 60 * 60 * 1000).hearts).toBe(2);
  });

  it('cannot go negative when a spend lands at zero', () => {
    expect(spendHeart({ hearts: 0, updatedAtMs: T0 }, T0)).toEqual({
      hearts: 0,
      updatedAtMs: T0,
    });
  });

  it('grants a heart back for a free practice round, still capped', () => {
    expect(grantHeart({ hearts: 0, updatedAtMs: T0 }, T0).hearts).toBe(1);
    expect(grantHeart(fullHearts(T0), T0).hearts).toBe(MAX_HEARTS);
  });

  it('reports unlimited for an entitled learner without touching the record', () => {
    expect(readHearts({ hearts: 0, updatedAtMs: T0 }, T0, { unlimited: true })).toEqual({
      hearts: null,
      nextHeartInMs: null,
      unlimited: true,
    });
  });

  it('formats the wait the way the screen says it', () => {
    expect(formatHeartWait(18 * 60 * 1000)).toBe('18 dk');
    expect(formatHeartWait(30 * 1000)).toBe('30 sn');
    expect(formatHeartWait(61 * 1000)).toBe('2 dk');
  });
});
