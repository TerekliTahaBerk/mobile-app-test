import type { CizgiMood } from '@/shared/ui/cizgi/cizgi-assets';
import type { SubjectKey } from '@/shared/ui/theme/tokens';

/**
 * PRESENTATION-ONLY LESSON PREVIEW
 *
 * These types describe how the imported design's exercise screens look and how
 * they respond to a tap. They are not the exercise, curriculum, evaluation, XP,
 * or mastery contract — that work belongs to the learning system and has not
 * been designed yet. Nothing here may be reused as a domain model.
 */

export type MultipleChoicePreview = {
  explanation: string;
  id: string;
  kind: 'multipleChoice';
  mood: CizgiMood;
  options: readonly { correct: boolean; id: string; key: string; label: string }[];
  progress: number;
  prompt: string;
  subject: SubjectKey;
  tag: string;
  wrongTitle: string;
};

export type WordBankPreview = {
  bank: readonly { id: string; label: string }[];
  hint: string;
  id: string;
  kind: 'wordBank';
  mood: CizgiMood;
  progress: number;
  solution: readonly string[];
  title: string;
};

export type MatchingPreview = {
  id: string;
  kind: 'matching';
  left: readonly { id: string; label: string; matchId: string }[];
  right: readonly { id: string; label: string }[];
  subject: SubjectKey;
  subtitle: string;
  tag: string;
  title: string;
};

export type FlashcardPreview = {
  cards: readonly { back: string; front: string; hint: string; id: string }[];
  deckSize: number;
  id: string;
  kind: 'flashcard';
  subject: SubjectKey;
  tag: string;
};

export type LessonExercisePreview =
  | FlashcardPreview
  | MatchingPreview
  | MultipleChoicePreview
  | WordBankPreview;

export type LessonPreviewViewModel = {
  complete: {
    cta: string;
    heading: string;
    mood: CizgiMood;
    stats: readonly { id: string; label: string; subject: SubjectKey | 'xp'; value: string }[];
    subheading: string;
    traceNote: string;
  };
  exercises: readonly LessonExercisePreview[];
  exit: {
    body: string;
    confirmLabel: string;
    heading: string;
    mood: CizgiMood;
    stayLabel: string;
  };
  hearts: string;
  intro: {
    cta: string;
    mood: CizgiMood;
    prompt: string;
    traceNote: string;
  };
};

export const lessonPreviewData = {
  complete: {
    cta: 'XP’Yİ AL',
    heading: 'Ders tamamlandı!',
    mood: 'cheer',
    stats: [
      { id: 'stat-xp', label: 'TOPLAM XP', subject: 'xp', value: '42' },
      { id: 'stat-accuracy', label: 'İSABET', subject: 'geography', value: '%80' },
      { id: 'stat-duration', label: 'SÜRE', subject: 'religion', value: '3:12' },
    ],
    subheading: 'Osmanlı’da yenileşme · Ders 2',
    traceNote: 'Bugün 42 satır iz bıraktın · toplam 1.284',
  },
  exercises: [
    {
      explanation: 'Akdeniz: düşük enlem + alçak kıyı ovaları sıcaklığı yükseltir.',
      id: 'exercise-mc',
      kind: 'multipleChoice',
      mood: 'thinking',
      options: [
        { correct: true, id: 'mc-a', key: 'A', label: 'Akdeniz Bölgesi' },
        { correct: false, id: 'mc-b', key: 'B', label: 'Marmara Bölgesi' },
        { correct: false, id: 'mc-c', key: 'C', label: 'Karadeniz Bölgesi' },
        { correct: false, id: 'mc-d', key: 'D', label: 'Doğu Anadolu Bölgesi' },
      ],
      progress: 0.45,
      prompt: 'Türkiye’de yıllık ortalama sıcaklığın en yüksek olduğu bölge hangisidir?',
      subject: 'geography',
      tag: 'COĞRAFYA · İKLİM',
      wrongTitle: 'Doğrusu: Akdeniz Bölgesi',
    },
    {
      bank: [
        { id: 'wb-1', label: 'Tanzimat' },
        { id: 'wb-2', label: 'Fermanı' },
        { id: 'wb-3', label: 'eşitlik' },
        { id: 'wb-4', label: 'Islahat' },
        { id: 'wb-5', label: 'kanun' },
        { id: 'wb-6', label: 'önünde' },
        { id: 'wb-7', label: 'padişah' },
        { id: 'wb-8', label: 'meclis' },
      ],
      hint: '1839 · hukuk önünde eşitlik',
      id: 'exercise-word-bank',
      kind: 'wordBank',
      mood: 'idle',
      progress: 0.62,
      solution: ['Tanzimat', 'Fermanı', 'kanun', 'önünde', 'eşitlik'],
      title: 'Cümleyi tamamla',
    },
    {
      id: 'exercise-matching',
      kind: 'matching',
      left: [
        { id: 'm-tanzimat', label: 'Tanzimat Fermanı', matchId: 'm-1839' },
        { id: 'm-kavimler', label: 'Kavimler Göçü', matchId: 'm-375' },
        { id: 'm-malazgirt', label: 'Malazgirt Savaşı', matchId: 'm-1071' },
        { id: 'm-lale', label: 'Lale Devri', matchId: 'm-1718' },
      ],
      right: [
        { id: 'm-1071', label: '1071' },
        { id: 'm-1839', label: '1839' },
        { id: 'm-375', label: '375' },
        { id: 'm-1718', label: '1718' },
      ],
      subject: 'history',
      subtitle: 'yanlış eşleşme can götürmez',
      tag: 'TARİH · KRONOLOJİ',
      title: 'Olayı yılıyla eşleştir',
    },
    {
      cards: [
        {
          back: 'Bilgi felsefesi. Bilginin kaynağını, sınırını ve doğruluğunu sorgular.',
          front: 'Epistemoloji',
          hint: 'TYT’de en sık: bilginin kaynağı tartışmaları (akıl, deney, sezgi).',
          id: 'card-epistemoloji',
        },
        {
          back: 'Varlık felsefesi. “Var olan nedir?” sorusunu ele alır.',
          front: 'Ontoloji',
          hint: 'Metafizikle karıştırılıyor — ontoloji varlığın kendisine odaklanır.',
          id: 'card-ontoloji',
        },
        {
          back: 'Ahlak felsefesi. İyi, kötü ve doğru davranışın ölçütünü arar.',
          front: 'Etik',
          hint: 'Haz ahlakı, ödev ahlakı ve faydacılık ayrımını sor.',
          id: 'card-etik',
        },
      ],
      deckSize: 12,
      id: 'exercise-flashcard',
      kind: 'flashcard',
      subject: 'philosophy',
      tag: 'FELSEFE · KAVRAMLAR',
    },
  ],
  exit: {
    body: '4 soru kaldı, yaklaşık 1 dakika. Bugünün çizgisini tamamlamana az kaldı.',
    confirmLabel: 'Çıkışı onayla',
    heading: 'Şimdi çıkarsan bu ders izine yazılmaz',
    mood: 'sad',
    stayLabel: 'DERSE DÖN',
  },
  hearts: '4',
  intro: {
    cta: 'DEVAM ET',
    mood: 'pose',
    prompt: 'Tamam! Ünite 3, Ders 2’ye hazırlan — Tanzimat.',
    traceNote: 'bugünün izine 1 ders kaldı',
  },
} as const satisfies LessonPreviewViewModel;
