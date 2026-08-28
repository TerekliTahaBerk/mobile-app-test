import type { Badge } from '@/modules/progress/domain/badge-policy';

export type ProfileStat = {
  id: string;
  label: string;
  value: string;
};

export type ProfileViewModel = {
  badges: readonly Badge[];
  /** "YKS · Sayısal" */
  description: string;
  displayName: string;
  initial: string;
  level: number;
  stats: readonly ProfileStat[];
  streak: number;
  totalXp: number;
};
