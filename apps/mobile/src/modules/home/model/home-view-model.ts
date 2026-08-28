import type { LessonId, PathNodeId, SkillId } from '@/modules/curriculum/domain/content-types';
import type { DailyPlanCard } from '@/modules/learning/model/daily-plan-card';
import { subjectTheme, type SubjectTheme } from '@/shared/ui/theme/subject-theme';

/**
 * What the Ana Sayfa tab renders. The screen takes this whole model as a prop
 * so it can be composed from live progress in a pilot build and from fixtures
 * in a design preview, without the screen knowing which it got.
 */

export type ContinueCard = {
  action:
    | { kind: 'lesson'; lessonId: LessonId; pathNodeId: PathNodeId }
    | { kind: 'resume'; sessionId: string }
    | { kind: 'review'; skillId: SkillId };
  actionLabel: string;
  /** "İlk ve Orta Çağlarda Türk Dünyası · %60" */
  detail: string;
  eyebrow: string;
  subjectTitle: string;
};

export type { DailyPlanCard };

export type SubjectTile = {
  id: string;
  /** `null` while the subject has no authored material yet. */
  level: number | null;
  progress: number;
  subjectTheme: SubjectTheme;
  title: string;
};

export type HomeViewModel = {
  continueCard: ContinueCard | null;
  /** The primary action whenever there is no half-finished round to resume. */
  dailyPlan: DailyPlanCard | null;
  greeting: string;
  hearts: number | null;
  initial: string;
  /** `null` when the league has no standings to show. */
  leagueRank: { closesIn: string; name: string; rank: number } | null;
  level: number;
  levelProgress: number;
  streak: number;
  subjects: readonly SubjectTile[];
  xpForLevel: number;
  xpIntoLevel: number;
};

/** The Ana Sayfa fixture used by the design preview. */
export const homePreviewData: HomeViewModel = {
  dailyPlan: {
    actionLabel: 'Başla',
    detail: '4 farklı konudan karışık',
    headline: 'Bugün 12 soru',
    lines: [
      { count: 5, kind: 'weakTopic', label: 'zayıf konu sorusu' },
      { count: 3, kind: 'review', label: 'zamanı gelen tekrar' },
      { count: 2, kind: 'refresh', label: 'güçlü konu kontrolü' },
      { count: 2, kind: 'newMaterial', label: 'yeni konu sorusu' },
    ],
  },
  continueCard: {
    action: {
      kind: 'lesson',
      lessonId: 'lesson.history.chronology.001',
      pathNodeId: 'path.history.first-turkish-states.03',
    },
    actionLabel: 'Devam',
    detail: 'İlk ve Orta Çağlarda Türk Dünyası · %60',
    eyebrow: 'KALDIĞIN YERDEN',
    subjectTitle: 'TYT Tarih',
  },
  greeting: 'Merhaba, Ege',
  hearts: 5,
  initial: 'E',
  leagueRank: { closesIn: 'Bitişe 3 gün', name: 'Zümrüt Lig', rank: 8 },
  level: 8,
  levelProgress: 0.85,
  streak: 12,
  subjects: [
    {
      id: 'tyt.history',
      level: 6,
      progress: 0.6,
      subjectTheme: subjectTheme('history'),
      title: 'Tarih',
    },
    { id: 'tyt.math', level: 5, progress: 0.42, subjectTheme: subjectTheme('math'), title: 'Matematik' },
    { id: 'tyt.physics', level: 3, progress: 0.24, subjectTheme: subjectTheme('physics'), title: 'Fizik' },
    {
      id: 'tyt.chemistry',
      level: 2,
      progress: 0.18,
      subjectTheme: subjectTheme('chemistry'),
      title: 'Kimya',
    },
    {
      id: 'tyt.biology',
      level: 4,
      progress: 0.33,
      subjectTheme: subjectTheme('biology'),
      title: 'Biyoloji',
    },
    {
      id: 'tyt.geography',
      level: 2,
      progress: 0.12,
      subjectTheme: subjectTheme('geography'),
      title: 'Coğrafya',
    },
  ],
  xpForLevel: 1000,
  xpIntoLevel: 850,
};
