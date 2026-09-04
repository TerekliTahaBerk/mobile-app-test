import type { Badge } from '@/modules/progress/domain/badge-policy';
import type { AvatarId } from '@/modules/learner/domain/learner-profile';
import type { TopicPerformanceBand } from '@/modules/progress/domain/topic-performance';

export type ProfileStat = {
  id: string;
  label: string;
  value: string;
};

export type ProfileViewModel = {
  avatarId: AvatarId;
  badges: readonly Badge[];
  /** The real curriculum scope and target year. */
  description: string;
  displayName: string;
  initial: string;
  level: number;
  /** Mistakes still waiting for a clean repeat answer. */
  openMistakes: number;
  stats: readonly ProfileStat[];
  streak: number;
  totalXp: number;
  topicPerformance: readonly ProfileTopicPerformance[];
};

export type ProfileTopicPerformance = {
  accuracy: number;
  accuracyLabel: string;
  band: TopicPerformanceBand;
  correctAnswers: number;
  detail: string;
  id: string;
  nextReviewLabel: string | null;
  statusLabel: string;
  subtopics: readonly Omit<ProfileTopicPerformance, 'subtopics'>[];
  title: string;
  totalAttempts: number;
  wrongAnswers: number;
};
