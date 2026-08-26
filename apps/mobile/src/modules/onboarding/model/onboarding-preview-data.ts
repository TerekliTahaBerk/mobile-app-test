import type { CizgiMood } from '@/shared/ui/cizgi/cizgi-assets';

/**
 * Presentation copy for the four-step intake in the imported design. Nothing
 * is persisted, no account is created, and no placement is calculated — those
 * are product decisions that have not been made.
 */
export type OnboardingOption = {
  id: string;
  /** Optional leading badge text, e.g. "LGS" / "YKS". */
  badge?: string;
  meta?: string;
  title: string;
};

export type OnboardingStep = {
  cta: string;
  id: string;
  mood: CizgiMood;
  options: readonly OnboardingOption[];
  prompt: string;
};

export const onboardingPreviewData = {
  steps: [
    {
      cta: 'DEVAM ET',
      id: 'step-exam',
      mood: 'wave',
      options: [
        { badge: 'LGS', id: 'exam-lgs', meta: 'Ortaokul · 8. sınıf', title: 'LGS' },
        { badge: 'YKS', id: 'exam-tyt', meta: 'Lise · mezun', title: 'TYT / AYT' },
      ],
      prompt: 'Merhaba, ben Çizgi! Hangi sınava çalışıyoruz?',
    },
    {
      cta: 'DEVAM ET',
      id: 'step-level',
      mood: 'thinking',
      options: [
        { id: 'level-1', title: 'TYT Sosyal’e yeni başlıyorum' },
        { id: 'level-2', title: 'Konuları duydum, netim düşük' },
        { id: 'level-3', title: 'Tarih iyi, Coğrafya zayıf' },
        { id: 'level-4', title: 'Sosyal netim 12-16 arası' },
        { id: 'level-5', title: 'Sosyal’de tam net hedefliyorum' },
      ],
      prompt: 'Şu an neredesin? Yolu ona göre kuruyorum.',
    },
    {
      cta: 'DEVAM ET',
      id: 'step-start',
      mood: 'idle',
      options: [
        {
          id: 'start-scratch',
          meta: 'TYT Sosyal’in ilk ünitesi, Tarih 1’den',
          title: 'Sıfırdan başla',
        },
        {
          id: 'start-placement',
          meta: '8 soruluk kısa deneme, Çizgi yerini söyler',
          title: 'Seviyemi bul',
        },
      ],
      prompt: 'Nereden başlamak istersin?',
    },
    {
      cta: 'BAŞLAYALIM',
      id: 'step-daily',
      mood: 'proud',
      options: [
        { badge: '10 XP', id: 'daily-rahat', meta: 'günde 5 dk', title: 'Rahat' },
        { badge: '20 XP', id: 'daily-normal', meta: 'günde 10 dk', title: 'Normal' },
        { badge: '30 XP', id: 'daily-ciddi', meta: 'günde 15 dk', title: 'Ciddi' },
        { badge: '50 XP', id: 'daily-yogun', meta: 'günde 20 dk', title: 'Yoğun' },
      ],
      prompt: 'Günde ne kadar iz bırakalım?',
    },
  ],
} as const satisfies { steps: readonly OnboardingStep[] };
