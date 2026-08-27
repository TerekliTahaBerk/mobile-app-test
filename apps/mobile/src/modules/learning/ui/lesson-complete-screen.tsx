import { ScrollView, StyleSheet, View } from 'react-native';

import { getContentIndex } from '@/modules/curriculum/content/content-source';
import { useLessonSession } from '@/modules/learning/application/lesson-session-store';
import { AppButton } from '@/shared/ui/components/app-button';
import { AppText } from '@/shared/ui/components/app-text';
import { BottomAction } from '@/shared/ui/components/bottom-action';
import { Screen } from '@/shared/ui/components/screen';
import { Cizgi } from '@/shared/ui/cizgi/cizgi';
import { Bob } from '@/shared/ui/motion/motion';
import { theme } from '@/shared/ui/theme/tokens';

type LessonCompleteScreenProps = {
  onCollect: () => void;
};

type StatTone = { border: string; figure: string; label: string; surface: string };

/**
 * Design screen 09. Every number here now comes from the finished session: XP
 * the engine awarded, accuracy over the exercises it actually scored, and the
 * real lesson title.
 *
 * The İz line is still preview copy — İz is not computed yet.
 */
export function LessonCompleteScreen({ onCollect }: LessonCompleteScreenProps) {
  const { completionResult, lesson, summary } = useLessonSession();

  if (lesson === null || summary === null) {
    return null;
  }

  const index = getContentIndex();
  const topic = index.getTopic(lesson.deps.lesson.topicId);
  const unit = index.getUnit(topic.unitId);

  const stats: readonly { id: string; label: string; tone: StatTone; value: string }[] = [
    {
      id: 'stat-xp',
      label: 'KAZANILAN XP',
      tone: {
        border: theme.colors.reward.xp,
        figure: theme.colors.reward.xpNumber,
        label: theme.colors.reward.xpInk,
        surface: theme.colors.reward.xpSoft,
      },
      value: `${completionResult?.awardedXp ?? summary.xpEarned}`,
    },
    {
      id: 'stat-accuracy',
      label: 'İSABET',
      tone: {
        border: theme.colors.subject.geography.primary,
        figure: theme.colors.subject.geography.ink,
        label: theme.colors.subject.geography.deep,
        surface: theme.colors.subject.geography.soft,
      },
      value: `%${summary.accuracyPercent}`,
    },
    {
      id: 'stat-correct',
      label: 'DOĞRU',
      tone: {
        border: theme.colors.subject.religion.primary,
        figure: theme.colors.subject.religion.ink,
        label: theme.colors.subject.religion.deep,
        surface: theme.colors.subject.religion.soft,
      },
      value: `${summary.correctCount}/${summary.scoredCount}`,
    },
  ];

  return (
    <Screen includeBottomInset={false} testID="lesson-complete-screen">
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        style={styles.scroll}
      >
        <Bob duration={2400}>
          <Cizgi mood="cheer" width={206} />
        </Bob>

        <View style={styles.heading}>
          <AppText accessibilityRole="header" align="center" color="accentStrong" variant="headingXL">
            {lesson.kind === 'review' ? 'Tekrar tamamlandı!' : 'Ders tamamlandı!'}
          </AppText>
          <AppText align="center" color="muted" variant="bodyM">
            {`${unit.title} · ${lesson.deps.lesson.title}`}
          </AppText>
        </View>

        <View style={styles.stats}>
          {stats.map((stat) => (
            <View
              accessible
              accessibilityLabel={`${stat.label}: ${stat.value}`}
              key={stat.id}
              style={[styles.stat, { borderColor: stat.tone.border }]}
            >
              <View style={[styles.statHeader, { backgroundColor: stat.tone.surface }]}>
                <AppText
                  align="center"
                  style={[styles.statLabel, { color: stat.tone.label }]}
                  variant="eyebrow"
                >
                  {stat.label}
                </AppText>
              </View>
              <View style={styles.statBody}>
                <AppText align="center" style={{ color: stat.tone.figure }} variant="numeric">
                  {stat.value}
                </AppText>
              </View>
            </View>
          ))}
        </View>

        <View
          accessible
          accessibilityLabel={`${summary.exerciseCount} alıştırma tamamlandı`}
          style={styles.traceCard}
        >
          <AppText color="secondary" style={styles.traceCopy} variant="bodyS">
            {`${summary.exerciseCount} alıştırma tamamlandı · ${summary.scoredCount} tanesi puanlandı`}
          </AppText>
        </View>
      </ScrollView>

      <BottomAction>
        <AppButton label="XP’Yİ AL" onPress={onCollect} testID="lesson-complete-cta" />
      </BottomAction>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    alignItems: 'center',
    flexGrow: 1,
    gap: theme.spacing.xl,
    justifyContent: 'center',
    paddingHorizontal: theme.spacing.xxl,
    paddingVertical: theme.spacing.xl,
  },
  heading: {
    gap: theme.spacing.sm,
  },
  scroll: {
    flex: 1,
  },
  stat: {
    borderRadius: theme.radii.medium,
    borderWidth: 2,
    flex: 1,
    overflow: 'hidden',
  },
  statBody: {
    paddingHorizontal: theme.spacing.xs,
    paddingVertical: theme.spacing.md + 1,
  },
  statHeader: {
    paddingHorizontal: theme.spacing.xs,
    paddingVertical: theme.spacing.sm - 2,
  },
  statLabel: {
    fontSize: 10,
    letterSpacing: 1,
  },
  stats: {
    flexDirection: 'row',
    gap: theme.spacing.md - 1,
    width: '100%',
  },
  traceCard: {
    alignItems: 'center',
    backgroundColor: theme.colors.trace.surface,
    borderColor: theme.colors.trace.border,
    borderRadius: theme.radii.medium + 2,
    borderWidth: 2,
    flexDirection: 'row',
    gap: theme.spacing.md + 2,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.lg - 1,
    width: '100%',
  },
  traceCopy: {
    flex: 1,
  },
});
