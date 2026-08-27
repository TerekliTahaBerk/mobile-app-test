import type { CizgiMood } from '@/shared/ui/cizgi/cizgi-assets';

/**
 * İz is the learner-facing habit trace. This is presentation copy only: no İz
 * is counted, stored, or evaluated here, and the timezone and grace rules that
 * a real İz needs have not been decided.
 */
export type IzDayState = 'done' | 'missed' | 'pending' | 'today' | 'upcoming';

export type IzPreviewViewModel = {
  count: string;
  cta: string;
  footnote: string;
  mood: CizgiMood;
  shareLabel: string;
  unit: string;
  week: readonly { id: string; label: string; longLabel: string; state: IzDayState }[];
};

export const izPreviewData = {
  count: '14',
  cta: 'DEVAM ET',
  footnote:
    'Her gün en az bir ders çöz, izin kesilmesin. Cumartesi ilk haftalık rozetine ulaşıyorsun.',
  mood: 'proud',
  shareLabel: 'İzi paylaş',
  unit: 'günlük iz',
  week: [
    { id: 'iz-cu', label: 'Cu', longLabel: 'Cuma', state: 'done' },
    { id: 'iz-ct', label: 'Ct', longLabel: 'Cumartesi', state: 'done' },
    { id: 'iz-pz', label: 'Pz', longLabel: 'Pazar', state: 'done' },
    { id: 'iz-pt', label: 'Pt', longLabel: 'Pazartesi', state: 'done' },
    { id: 'iz-sa', label: 'Sa', longLabel: 'Salı', state: 'today' },
    { id: 'iz-ca', label: 'Ça', longLabel: 'Çarşamba', state: 'upcoming' },
    { id: 'iz-pe', label: 'Pe', longLabel: 'Perşembe', state: 'upcoming' },
  ],
} as const satisfies IzPreviewViewModel;

export function buildDurableIzViewModel(
  current: number,
  week: readonly {
    date: string;
    state: 'future' | 'missed' | 'pending' | 'qualified' | 'today';
  }[],
): IzPreviewViewModel {
  return {
    count: String(current),
    cta: 'DEVAM ET',
    footnote: 'Bir ders veya zamanı gelen tekrar tamamladığın yerel gün İz’e yazılır.',
    mood: 'proud',
    shareLabel: 'İzi paylaş',
    unit: 'günlük iz',
    week: week.map((day) => ({
      id: day.date,
      label: weekday(day.date, 'short'),
      longLabel: weekday(day.date, 'long'),
      state:
        day.state === 'qualified'
          ? 'done'
          : day.state === 'today'
            ? 'today'
            : day.state === 'future'
              ? 'upcoming'
              : day.state === 'missed'
                ? 'missed'
                : 'pending',
    })),
  };
}

function weekday(date: string, width: 'long' | 'short'): string {
  return new Intl.DateTimeFormat('tr-TR', { timeZone: 'UTC', weekday: width }).format(
    new Date(`${date}T12:00:00.000Z`),
  );
}
