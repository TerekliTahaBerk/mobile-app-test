import type { LessonId, PathNodeId } from '@/modules/curriculum/domain/content-types';
import type { PathStepStatus } from '@/modules/curriculum/domain/path-progression';
import { subjectTheme, type SubjectTheme } from '@/shared/ui/theme/subject-theme';

/** One stop on the vertical path. */
export type PathStepView = {
  /** "7 soru · 4 dk", "tamamlandı · %100", "önceki adımı bitir". */
  detail: string;
  id: PathNodeId;
  kind: 'checkpoint' | 'lesson' | 'practice' | 'review';
  readonly lessonId?: LessonId;
  status: PathStepStatus;
  title: string;
};

export type UnitSection = {
  /** "ünite 2 · %60", "ünite 1 · tamamlandı", "ünite 3 · kilitli". */
  eyebrow: string;
  id: string;
  locked: boolean;
  /** "3 / 5 çalışma tamam", or why the unit is not open yet. */
  progressLabel: string;
  steps: readonly PathStepView[];
  title: string;
};

export type UnitPathViewModel = {
  hearts: number | null;
  /** Shown once, above the path, after a round lands. */
  justEarned: string | null;
  level: number;
  sections: readonly UnitSection[];
  streak: number;
  subjectTheme: SubjectTheme;
  subjectTitle: string;
  xp: number;
};

export const unitPathPreviewData: UnitPathViewModel = {
  hearts: 5,
  justEarned: null,
  level: 6,
  sections: [
    {
      eyebrow: 'ünite 1 · tamamlandı',
      id: 'tyt.history.time-and-history',
      locked: false,
      progressLabel: '3 / 3 çalışma',
      steps: [
        {
          detail: 'tamamlandı · %100',
          id: 'path.history.time.01',
          kind: 'lesson',
          status: 'completed',
          title: 'Zamanı Ölçmek',
        },
        {
          detail: 'tamamlandı · %90',
          id: 'path.history.time.02',
          kind: 'lesson',
          status: 'completed',
          title: 'Çağlar ve Dönemler',
        },
        {
          detail: '2 soru · +60 XP',
          id: 'path.history.time.03',
          kind: 'checkpoint',
          status: 'completed',
          title: 'Mini Challenge',
        },
      ],
      title: 'Tarih ve Zaman',
    },
    {
      eyebrow: 'ünite 2 · %33',
      id: 'tyt.history.first-turkish-states',
      locked: false,
      progressLabel: '2 / 6 çalışma tamam',
      steps: [
        {
          detail: 'tamamlandı · %100',
          id: 'path.history.first-turkish-states.01',
          kind: 'lesson',
          status: 'completed',
          title: 'Devletleri Tanı',
        },
        {
          detail: 'tamamlandı · kusursuz',
          id: 'path.history.first-turkish-states.02',
          kind: 'lesson',
          status: 'completed',
          title: 'Kavramları Eşleştir',
        },
        {
          detail: '3 soru · 4 dk',
          id: 'path.history.first-turkish-states.03',
          kind: 'lesson',
          lessonId: 'lesson.history.chronology.001',
          status: 'current',
          title: 'Kronolojik Sırala',
        },
        {
          detail: 'boşluk doldur · 3 soru',
          id: 'path.history.first-turkish-states.04',
          kind: 'lesson',
          status: 'locked',
          title: 'Kut ve Töre',
        },
        {
          detail: 'önceki adımı bitir',
          id: 'path.history.first-turkish-states.05',
          kind: 'practice',
          status: 'locked',
          title: 'Hızlı Tekrar',
        },
        {
          detail: 'ünitenin sonu · +100 XP',
          id: 'path.history.first-turkish-states.06',
          kind: 'checkpoint',
          status: 'locked',
          title: 'Ünite Challenge',
        },
      ],
      title: 'İlk ve Orta Çağlarda Türk Dünyası',
    },
    {
      eyebrow: 'ünite 3 · kilitli',
      id: 'tyt.history.medieval-world',
      locked: true,
      progressLabel: 'Ünite 2 bitince açılır',
      steps: [],
      title: "Orta Çağ'da Dünya",
    },
  ],
  streak: 12,
  subjectTheme: subjectTheme('history'),
  subjectTitle: 'TYT Tarih',
  xp: 650,
};
