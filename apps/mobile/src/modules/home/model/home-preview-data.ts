export type PathStepPreviewState =
  | 'available'
  | 'checkpoint'
  | 'complete'
  | 'current'
  | 'locked';

export type PathStepPreview = {
  detail: string;
  id: string;
  index: string;
  state: PathStepPreviewState;
  status: string;
  title: string;
};

export type HomePreviewViewModel = {
  brandName: string;
  companionName: string;
  dailyGoal: {
    completedSteps: number;
    message: string;
    progress: number;
    totalSteps: number;
  };
  greeting: string;
  mode: string;
  nextStepTitle: string;
  pathSteps: readonly PathStepPreview[];
  stats: {
    trace: string;
    xp: string;
  };
  subject: string;
  subtitle: string;
  unit: {
    eyebrow: string;
    progress: string;
    title: string;
  };
};

// Presentation-only demo data. It is deliberately not a curriculum, exercise,
// progress, XP, mastery, or persistence contract.
export const homePreviewData = {
  brandName: 'TEKRARLA',
  companionName: 'ÇİZGİ',
  dailyGoal: {
    completedSteps: 2,
    message: 'Bir kısa adım daha, bugünün izi tamam.',
    progress: 2 / 3,
    totalSteps: 3,
  },
  greeting: 'Hazırsan bir iz bırakalım.',
  mode: 'TYT',
  nextStepTitle: 'Tanzimat’a giriş',
  pathSteps: [
    {
      detail: 'Kısa başlangıç tamamlandı',
      id: 'preview-01',
      index: '01',
      state: 'complete',
      status: 'Tamamlandı',
      title: 'Değişimin ilk adımları',
    },
    {
      detail: 'Yaklaşık 5 dakika',
      id: 'preview-02',
      index: '02',
      state: 'current',
      status: 'Şimdi',
      title: 'Tanzimat’a giriş',
    },
    {
      detail: 'Kısa karşılaştırma turu',
      id: 'preview-03',
      index: '03',
      state: 'available',
      status: 'Açık',
      title: 'Fermanları karşılaştır',
    },
    {
      detail: 'Önceki adımlardan sonra açılır',
      id: 'preview-04',
      index: '04',
      state: 'locked',
      status: 'Kilitli',
      title: 'Kısa tekrar',
    },
    {
      detail: 'Ünite sonu kontrol noktası',
      id: 'preview-05',
      index: '05',
      state: 'checkpoint',
      status: 'Kontrol noktası',
      title: 'Ünite sınavı',
    },
  ],
  stats: {
    trace: '12 gün iz',
    xp: '1.240 XP',
  },
  subject: 'Tarih',
  subtitle: 'Sıradaki kısa adım hazır.',
  unit: {
    eyebrow: 'ÜNİTE 3 · TARİH',
    progress: '3 / 7',
    title: 'Osmanlı’da Yenileşme',
  },
} as const satisfies HomePreviewViewModel;
