import { addDays, daysBetween, previousDay, toLocalDate } from '@/shared/time/local-date';

describe('local calendar dates', () => {
  it('renders an instant in the learner zone, not UTC', () => {
    // 22:30 UTC is already the next day in Istanbul (UTC+3).
    expect(toLocalDate(Date.parse('2026-08-27T22:30:00.000Z'), 'Europe/Istanbul')).toBe(
      '2026-08-28',
    );
    expect(toLocalDate(Date.parse('2026-08-27T22:30:00.000Z'), 'UTC')).toBe('2026-08-27');
  });

  it('steps across month and year boundaries', () => {
    expect(previousDay('2026-09-01')).toBe('2026-08-31');
    expect(addDays('2026-12-31', 1)).toBe('2027-01-01');
    expect(addDays('2028-02-28', 1)).toBe('2028-02-29');
  });

  it('measures whole calendar days in both directions', () => {
    expect(daysBetween('2026-08-25', '2026-08-27')).toBe(2);
    expect(daysBetween('2026-08-27', '2026-08-25')).toBe(-2);
  });
});
