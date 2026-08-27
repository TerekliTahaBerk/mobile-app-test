import { useCallback, useState } from 'react';
import { useFocusEffect } from 'expo-router';

import { getContentIndex } from '@/modules/curriculum/content/content-source';
import { KURULTAY_PATH_NODE_ID } from '@/modules/curriculum/content/tyt-social-draft-bundle';
import type { PathNodeId } from '@/modules/curriculum/domain/content-types';
import { useRepositories } from '@/modules/progress/application/progress-store';
import { buildIzWeek, computeIz, type IzDayState } from '@/modules/progress/domain/iz-policy';
import type { PathProgress } from '@/modules/progress/domain/progress-types';
import {
  recommendNext,
  type Recommendation,
} from '@/modules/progress/domain/recommendation-policy';
import { systemClock, type Clock } from '@/shared/time/clock';
import { toLocalDate, type LocalDate } from '@/shared/time/local-date';

export type ProgressDashboard = {
  completedRealLevels: number;
  completedSessions: { lessons: number; reviews: number };
  iz: { current: number; todayQualified: boolean };
  pathProgress: ReadonlyMap<PathNodeId, PathProgress>;
  recommendation: Recommendation;
  totalXp: number;
  week: readonly { date: LocalDate; state: IzDayState }[];
};

export type ProgressDashboardState =
  | { status: 'loading' }
  | { error: Error; refresh: () => void; status: 'failed' }
  | { data: ProgressDashboard; refresh: () => void; status: 'ready' };

/** One consistent read model for Home, İz, and the accountless local profile. */
export function useProgressDashboard(clock: Clock = systemClock): ProgressDashboardState {
  const repositories = useRepositories();
  const [revision, setRevision] = useState(0);
  const [state, setState] = useState<
    { data: ProgressDashboard; status: 'ready' } | { error: Error; status: 'failed' } | { status: 'loading' }
  >({ status: 'loading' });
  const refresh = useCallback(() => setRevision((value) => value + 1), []);

  useFocusEffect(
    useCallback(() => {
      // `revision` is an explicit refresh signal; reading it makes a retry
      // re-run the focused query without changing repository identity.
      void revision;
      let cancelled = false;
      const now = clock.now();
      const today = toLocalDate(now, clock.timeZone());

      Promise.all([
        repositories.xp.total(),
        repositories.dailyActivity.listQualifyingDates(),
        repositories.progress.getAll(),
        repositories.sessions.findActive(),
        repositories.review.listAll(),
        repositories.mistakes.listUnresolved(),
        repositories.sessions.completionCounts(),
      ])
        .then(([totalXp, dates, progressRows, activeSession, reviewItems, mistakes, counts]) => {
          if (cancelled) {
            return;
          }

          const pathProgress = new Map(progressRows.map((row) => [row.pathNodeId, row]));
          const realNode = getContentIndex().bundle.pathNodes.find(
            (node) => node.id === KURULTAY_PATH_NODE_ID,
          );
          if (realNode?.lessonId === undefined) {
            throw new Error('Gerçek yol düğümü bulunamadı.');
          }

          const completed = pathProgress.get(realNode.id)?.status === 'completed';
          setState({
            data: {
              completedRealLevels: progressRows.filter((row) => row.status === 'completed').length,
              completedSessions: counts,
              iz: computeIz(dates, today),
              pathProgress,
              recommendation: recommendNext({
                activeSession,
                atMs: now,
                nextLesson: completed
                  ? null
                  : { lessonId: realNode.lessonId, pathNodeId: realNode.id },
                reviewItems,
                unresolvedMistakes: mistakes,
              }),
              totalXp,
              week: buildIzWeek(dates, today),
            },
            status: 'ready',
          });
        })
        .catch((cause: unknown) => {
          if (!cancelled) {
            setState({
              error: cause instanceof Error ? cause : new Error(String(cause)),
              status: 'failed',
            });
          }
        });

      return () => {
        cancelled = true;
      };
    }, [clock, repositories, revision]),
  );

  return state.status === 'ready'
    ? { ...state, refresh }
    : state.status === 'failed'
      ? { ...state, refresh }
      : state;
}
