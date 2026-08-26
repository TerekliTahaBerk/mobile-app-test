import type { SubjectKey } from '@/shared/ui/theme/tokens';

/**
 * Presentation copy for the daily quest board. Quest definitions, progress, and
 * rewards are gamification concerns that have not been designed yet — nothing
 * here counts or awards anything.
 */
export type QuestIcon = 'clock' | 'target' | 'trace';

export type QuestPreview = {
  claimed: boolean;
  icon: QuestIcon;
  id: string;
  progress: number;
  progressLabel: string;
  title: string;
  tone: SubjectKey;
};

export type QuestsPreviewViewModel = {
  cta: string;
  event: {
    remaining: string;
    progressLabel: string;
    title: string;
  };
  gems: string;
  heading: string;
  quests: readonly QuestPreview[];
};

export const questsPreviewData = {
  cta: 'ÖDÜLÜ AL',
  event: {
    progressLabel: '5 / 25',
    remaining: '10 gün kaldı',
    title: 'Ağustos Maratonu',
  },
  gems: '527',
  heading: '1 görev tamam!',
  quests: [
    {
      claimed: true,
      icon: 'trace',
      id: 'quest-trace',
      progress: 1,
      progressLabel: '1 / 1',
      title: 'İzini uzat',
      tone: 'religion',
    },
    {
      claimed: false,
      icon: 'clock',
      id: 'quest-minutes',
      progress: 0.5,
      progressLabel: '5 / 10',
      title: '10 dakika çalış',
      tone: 'religion',
    },
    {
      claimed: false,
      icon: 'target',
      id: 'quest-accuracy',
      progress: 0.2,
      progressLabel: '1 / 5',
      title: '5 derste %90 üstü isabet',
      tone: 'geography',
    },
  ],
} as const satisfies QuestsPreviewViewModel;
