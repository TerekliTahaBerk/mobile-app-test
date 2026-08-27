import { ScrollView, StyleSheet, View } from 'react-native';

import { lessonPreviewData } from '@/modules/learning/model/lesson-preview-data';
import { AppButton } from '@/shared/ui/components/app-button';
import { AppText } from '@/shared/ui/components/app-text';
import { BottomAction } from '@/shared/ui/components/bottom-action';
import { TraceMark } from '@/shared/ui/components/trace-mark';
import { Cizgi } from '@/shared/ui/cizgi/cizgi';
import { Bob } from '@/shared/ui/motion/motion';
import { Screen } from '@/shared/ui/components/screen';
import { theme } from '@/shared/ui/theme/tokens';

type LessonCompleteScreenProps = {
  onCollect: () => void;
};

/**
 * Design screen 09. The celebration reports what the session produced — XP,
 * accuracy, time — and closes with the İz the learner added today.
 *
 * Every number here is preview copy. Nothing is computed.
 */
export function LessonCompleteScreen({ onCollect }: LessonCompleteScreenProps) {
  const { complete } = lessonPreviewData;

  return (
    <Screen includeBottomInset={false} testID="lesson-complete-screen">
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        style={styles.scroll}
      >
        <Bob duration={2400}>
          <Cizgi mood={complete.mood} width={206} />
        </Bob>

        <View style={styles.heading}>
          <AppText accessibilityRole="header" align="center" color="accentStrong" variant="headingXL">
            {complete.heading}
          </AppText>
          <AppText align="center" color="muted" variant="bodyM">
            {complete.subheading}
          </AppText>
        </View>

        <View style={styles.stats}>
          {complete.stats.map((stat) => {
            const tone =
              stat.subject === 'xp'
                ? {
                    border: theme.colors.reward.xp,
                    surface: theme.colors.reward.xpSoft,
                    figure: theme.colors.reward.xpNumber,
                    label: theme.colors.reward.xpInk,
                  }
                : {
                    border: theme.colors.subject[stat.subject].primary,
                    surface: theme.colors.subject[stat.subject].soft,
                    figure: theme.colors.subject[stat.subject].ink,
                    label: theme.colors.subject[stat.subject].deep,
                  };

            return (
              <View
                accessible
                accessibilityLabel={`${stat.label}: ${stat.value}`}
                key={stat.id}
                style={[styles.stat, { borderColor: tone.border }]}
              >
                <View style={[styles.statHeader, { backgroundColor: tone.surface }]}>
                  <AppText align="center" style={[styles.statLabel, { color: tone.label }]} variant="eyebrow">
                    {stat.label}
                  </AppText>
                </View>
                <View style={styles.statBody}>
                  <AppText align="center" style={{ color: tone.figure }} variant="numeric">
                    {stat.value}
                  </AppText>
                </View>
              </View>
            );
          })}
        </View>

        <View accessible accessibilityLabel={complete.traceNote} style={styles.traceCard}>
          <TraceMark size="sm" />
          <AppText color="secondary" style={styles.traceCopy} variant="bodyS">
            {complete.traceNote}
          </AppText>
        </View>
      </ScrollView>

      <BottomAction>
        <AppButton label={complete.cta} onPress={onCollect} testID="lesson-complete-cta" />
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
