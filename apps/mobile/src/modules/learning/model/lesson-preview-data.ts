export type LessonPreviewViewModel = {
  helperText: string;
  options: readonly {
    id: string;
    label: string;
    marker: string;
  }[];
  progress: number;
  progressLabel: string;
  question: string;
  subject: string;
  topic: string;
};

// Temporary presentation copy, not an exercise, answer, or curriculum schema.
export const lessonPreviewData = {
  helperText: 'Bu ekran sunum amaçlıdır; seçim yapılmaz ve yanıt değerlendirilmez.',
  options: [
    { id: 'preview-a', label: 'Merkezî yönetimi tamamen kaldırmak', marker: 'A' },
    { id: 'preview-b', label: 'Hukuk önünde eşitlik anlayışını güçlendirmek', marker: 'B' },
    { id: 'preview-c', label: 'Özel mülkiyeti sona erdirmek', marker: 'C' },
    { id: 'preview-d', label: 'Ülkeyi şehir devletlerine ayırmak', marker: 'D' },
  ],
  progress: 0.4,
  progressLabel: '2 / 5',
  question: 'Tanzimat Fermanı ile güçlendirilmek istenen temel anlayış hangisidir?',
  subject: 'TARİH',
  topic: 'Osmanlı’da Yenileşme',
} as const satisfies LessonPreviewViewModel;
