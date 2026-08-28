import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect } from 'react';

import { getContentIndex } from '@/modules/curriculum/content/content-source';
import { useLessonSession } from '@/modules/learning/application/lesson-session-store';
import {
  LessonCompleteScreen,
  type LessonCompleteViewModel,
} from '@/modules/learning/ui/lesson-complete-screen';
import {
  useProgressDashboard,
  type ProgressDashboard,
} from '@/modules/progress/application/use-progress-dashboard';
import { isStreakMilestone } from '@/modules/progress/domain/streak-policy';
import { MessageScreen } from '@/shared/ui/feedback/message-screen';

export default function LessonCompleteRoute() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    beforeAccuracy?: string;
    returnTo?: string;
    topicId?: string;
  }>();
  const { discard, lesson, persistenceStatus, retryPersistence, summary } = useLessonSession();
  const dashboard = useProgressDashboard();
  const refresh = dashboard.status === 'loading' ? null : dashboard.refresh;

  // The round is written after this screen mounts, so the first read can still
  // be pre-completion. Re-reading once the write lands is what makes the streak
  // and the unit meter show what the learner just did rather than what they had.
  useEffect(() => {
    if (persistenceStatus === 'saved' && refresh !== null) {
      refresh();
    }
  }, [persistenceStatus, refresh]);

  if (persistenceStatus === 'failed') {
    return (
      <MessageScreen
        action={{ label: 'Tekrar dene', onPress: retryPersistence }}
        body="Bu turun kaydedilmesi tamamlanamadı. Tekrar deneyebilirsin; hiçbir kaydın silinmedi."
        heading="Kaydedilemedi"
        testID="lesson-complete-failed"
        tone="dimmed"
      />
    );
  }

  if (summary === null || lesson === null) {
    return (
      <MessageScreen
        action={{ label: 'Ana Sayfa', onPress: () => router.replace('/') }}
        body="Özetlenecek tamamlanmış bir çalışma bulunamadı."
        heading="Özet hazır değil"
        testID="lesson-complete-missing"
        tone="muted"
      />
    );
  }

  const data = dashboard.status === 'ready' ? dashboard.data : null;
  const pathNodeId = lesson.session.pathNodeId;

  const viewModel: LessonCompleteViewModel = {
    accuracyLabel: `${summary.correctCount}/${Math.max(summary.scoredCount, 1)}`,
    roundTitle: lesson.deps.lesson.title,
    streak: data?.streak.current ?? 0,
    unit: data === null || pathNodeId === undefined ? null : unitMeterFor(data, pathNodeId),
    unlockedLabel:
      data === null || pathNodeId === undefined ? null : unlockedLabelFor(data, pathNodeId),
    xpEarned: summary.xpEarned,
  };

  const streak = viewModel.streak;
  const leaveHome = () => {
    discard();
    // The streak screen is a milestone moment, not a per-round interstitial.
    router.replace(isStreakMilestone(streak) ? '/seri' : '/');
  };

  const leaveNext = () => {
    if (params.returnTo === 'placement') {
      discard();
      router.replace('/baslangic-haritasi');
      return;
    }
    if (params.returnTo !== 'topicPerformance') {
      leaveHome();
      return;
    }
    discard();
    router.replace({
      pathname: '/konu-performansi',
      params: {
        beforeAccuracy: params.beforeAccuracy ?? '',
        topicId: params.topicId ?? '',
      },
    });
  };

  return (
    <LessonCompleteScreen
      nextActionLabel={
        params.returnTo === 'placement'
          ? 'Haritamı gör'
          : params.returnTo === 'topicPerformance'
            ? 'Performansı gör'
            : undefined
      }
      onBackToHome={leaveHome}
      onNextRound={leaveNext}
      viewModel={viewModel}
    />
  );
}

/**
 * How far the unit moved. The completed node is already counted in the stored
 * record, so "before" is that count minus this round.
 */
function unitMeterFor(
  data: ProgressDashboard,
  pathNodeId: string,
): LessonCompleteViewModel['unit'] {
  const index = getContentIndex();
  const path = [...data.subjects.values()]
    .flatMap((entry) => entry.paths)
    .find((candidate) => candidate.steps.some((step) => step.node.id === pathNodeId));

  if (path === undefined || path.steps.length === 0) {
    return null;
  }

  const step = 1 / path.steps.length;

  return {
    before: Math.max(0, path.completion - step),
    gained: Math.min(step, path.completion),
    title: index.getUnit(path.unitId).title,
  };
}

/** The node this round opened, if it opened one. */
function unlockedLabelFor(data: ProgressDashboard, pathNodeId: string): string | null {
  const path = [...data.subjects.values()]
    .flatMap((entry) => entry.paths)
    .find((candidate) => candidate.steps.some((step) => step.node.id === pathNodeId));

  const opened = path?.steps.find(
    (step) => step.status === 'current' && step.node.prerequisiteIds.includes(pathNodeId),
  );

  return opened === undefined ? null : `Yeni adım açıldı: ${opened.node.title}`;
}
