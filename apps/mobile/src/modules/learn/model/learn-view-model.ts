import type { SubjectId } from '@/modules/curriculum/domain/content-types';
import { subjectTheme, type SubjectTheme } from '@/shared/ui/theme/subject-theme';

/** One row of the Öğren tab. */
export type SubjectRow = {
  /** "Level 6 · 2 / 8 ünite · 650 XP", or why the row cannot be opened. */
  detail: string;
  id: SubjectId;
  /** No authored material yet: the row is shown, but not openable. */
  locked: boolean;
  progress: number;
  subjectTheme: SubjectTheme;
  title: string;
};

export type LearnViewModel = {
  hearts: number | null;
  rows: readonly SubjectRow[];
  streak: number;
};

export const learnPreviewData: LearnViewModel = {
  hearts: 5,
  rows: [
    {
      detail: 'Level 6 · 2 / 8 ünite · 650 XP',
      id: 'tyt.history',
      locked: false,
      progress: 0.32,
      subjectTheme: subjectTheme('history'),
      title: 'Tarih',
    },
    {
      detail: 'Level 5 · 3 / 9 ünite',
      id: 'tyt.math',
      locked: false,
      progress: 0.42,
      subjectTheme: subjectTheme('math'),
      title: 'Matematik',
    },
    {
      detail: 'Level 4 · 2 / 7 ünite',
      id: 'tyt.turkish',
      locked: false,
      progress: 0.28,
      subjectTheme: subjectTheme('turkish'),
      title: 'Türkçe',
    },
    {
      detail: 'Level 2 · 1 / 6 ünite',
      id: 'tyt.geography',
      locked: false,
      progress: 0.12,
      subjectTheme: subjectTheme('geography'),
      title: 'Coğrafya',
    },
    {
      detail: 'Yeni başla · 5 ünite',
      id: 'tyt.philosophy',
      locked: false,
      progress: 0,
      subjectTheme: subjectTheme('philosophy'),
      title: 'Felsefe',
    },
  ],
  streak: 12,
};
