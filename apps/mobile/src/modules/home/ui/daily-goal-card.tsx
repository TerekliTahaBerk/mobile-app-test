import { StyleSheet, View } from 'react-native';

import type { HomePreviewViewModel } from '@/modules/home/model/home-preview-data';
import { AppText } from '@/shared/ui/components/app-text';
import { Card } from '@/shared/ui/components/card';
import { ProgressBar } from '@/shared/ui/components/progress-bar';
import { theme } from '@/shared/ui/theme/tokens';

type DailyGoalCardProps = {
  goal: HomePreviewViewModel['dailyGoal'];
};

export function DailyGoalCard({ goal }: DailyGoalCardProps) {
  return (
    <Card style={styles.card} variant="elevated">
      <View style={styles.header}>
        <View style={styles.headerCopy}>
          <AppText color="accent" variant="caption">
            BUGÜNÜN İZİ
          </AppText>
          <AppText variant="headingM">3 kısa adım</AppText>
        </View>
        <View accessible accessibilityLabel={`${goal.completedSteps} / ${goal.totalSteps} adım`} style={styles.counter}>
          <AppText color="accent" variant="labelM">
            {goal.completedSteps} / {goal.totalSteps}
          </AppText>
        </View>
      </View>

      <ProgressBar accessibilityLabel="Bugünün iz ilerlemesi" value={goal.progress} />

      <AppText color="secondary" variant="bodyS">
        {goal.message}
      </AppText>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: theme.spacing.lg,
    padding: theme.spacing.lg,
  },
  counter: {
    backgroundColor: theme.colors.reward.traceSoft,
    borderRadius: theme.radii.pill,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: theme.spacing.md,
    justifyContent: 'space-between',
  },
  headerCopy: {
    flex: 1,
    gap: theme.spacing.xs,
  },
});
