import type { LessonId, PathNodeId } from '@/modules/curriculum/domain/content-types';
import type { DailyPlanCard } from '@/modules/learning/model/daily-plan-card';

/**
 * What the Ana Sayfa tab renders. The screen takes this whole model as a prop
 * so it can be composed from live progress in a pilot build and from fixtures
 * in a design preview, without the screen knowing which it got.
 */

export type ContinueCard = {
  action:
    | { kind: 'lesson'; lessonId: LessonId; pathNodeId: PathNodeId }
    | { kind: 'resume'; sessionId: string };
  actionLabel: string;
  /** "İlk ve Orta Çağlarda Türk Dünyası · %60" */
  detail: string;
  eyebrow: string;
  subjectTitle: string;
};

export type { DailyPlanCard };

export type PersonalizedCard = {
  actionLabel: string;
  detail: string;
  eyebrow: string;
  kind: 'review' | 'streak' | 'weakTopic';
  title: string;
};

export type LeagueCard =
  | { detail: string; kind: 'pending'; title: string }
  | { detail: string; kind: 'standing'; rank: number; title: string };

export type HomeViewModel = {
  continueCard: ContinueCard | null;
  /** Today's real, evidence-backed mixed drill. */
  dailyPlan: DailyPlanCard | null;
  dailyProgress: { completed: number; goal: number };
  greeting: string;
  hearts: number | null;
  initial: string;
  /** Always present; pending never pretends a real standing exists. */
  leagueCard: LeagueCard;
  level: number;
  levelProgress: number;
  personalizedCard: PersonalizedCard | null;
  streak: number;
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
  dailyProgress: { completed: 1, goal: 3 },
  greeting: 'Merhaba, Ege',
  hearts: 5,
  initial: 'E',
  leagueCard: { detail: 'Bitişe 3 gün', kind: 'standing', rank: 8, title: 'Zümrüt Lig' },
  level: 8,
  levelProgress: 0.85,
  personalizedCard: {
    actionLabel: 'Plana geç',
    detail: 'Dün zorlandığın 3 soru bugünkü planında hazır.',
    eyebrow: 'SANA ÖZEL',
    kind: 'review',
    title: 'Tekrar zamanı',
  },
  streak: 12,
  xpForLevel: 1000,
  xpIntoLevel: 850,
};
