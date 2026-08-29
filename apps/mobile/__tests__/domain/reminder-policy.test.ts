import { planReminders } from '@/modules/reminders/domain/reminder-policy';

/** A Wednesday at 09:00 local. */
const moment = { atMs: Date.parse('2026-09-02T06:00:00.000Z'), timeZone: 'Europe/Istanbul' };

function planOf(overrides: Partial<Parameters<typeof planReminders>[0]> = {}) {
  return planReminders({
    moment,
    remindersEnabled: true,
    reminderTime: '20:00',
    streak: 4,
    todayQualified: false,
    weeklyReportBody: 'Bu hafta 2 alt konuyu güçlendirdin. Raporun hazır.',
    weeklyReportDay: 0,
    ...overrides,
  });
}

describe('reminder policy', () => {
  it('schedules nothing at all when reminders are off', () => {
    expect(planOf({ remindersEnabled: false })).toEqual([]);
  });

  it('arms a week of daily reminders at the chosen time', () => {
    const streak = planOf().filter((reminder) => reminder.id.startsWith('streak:'));

    expect(streak).toHaveLength(7);
    expect(streak[0]).toMatchObject({ hour: 20, localDate: '2026-09-02', minute: 0 });
    expect(streak[6]?.localDate).toBe('2026-09-08');
  });

  it('skips today once the day already counts', () => {
    const streak = planOf({ todayQualified: true }).filter((reminder) =>
      reminder.id.startsWith('streak:'),
    );

    // Reminding someone to do what they have done is how an app teaches people
    // to ignore it.
    expect(streak).toHaveLength(6);
    expect(streak[0]?.localDate).toBe('2026-09-03');
  });

  it('says what is actually at stake', () => {
    expect(planOf({ streak: 4 })[0]?.body).toContain('4 günlük serin');
    expect(planOf({ streak: 0 })[0]?.body).toContain('seri bugün başlasın');
  });

  it('arms the weekly report for its own day, in its own words', () => {
    const weekly = planOf().find((reminder) => reminder.id.startsWith('weekly:'));

    // Wednesday 2 September; the next Sunday is the 6th.
    expect(weekly).toMatchObject({
      body: 'Bu hafta 2 alt konuyu güçlendirdin. Raporun hazır.',
      localDate: '2026-09-06',
    });
  });

  it('moves the weekly reminder with the chosen report day', () => {
    const weekly = planOf({ weeklyReportDay: 3 }).find((reminder) =>
      reminder.id.startsWith('weekly:'),
    );

    // Today is that Wednesday, so the report closes today.
    expect(weekly?.localDate).toBe('2026-09-02');
  });

  it('honours the chosen hour and falls back to a sane one', () => {
    expect(planOf({ reminderTime: '17:00' })[0]).toMatchObject({ hour: 17, minute: 0 });
    expect(planOf({ reminderTime: undefined })[0]).toMatchObject({ hour: 20 });
  });

  it('gives every reminder a stable id, so re-arming replaces rather than piles up', () => {
    const ids = planOf().map((reminder) => reminder.id);

    expect(new Set(ids).size).toBe(ids.length);
    expect(planOf().map((reminder) => reminder.id)).toEqual(ids);
  });
});
