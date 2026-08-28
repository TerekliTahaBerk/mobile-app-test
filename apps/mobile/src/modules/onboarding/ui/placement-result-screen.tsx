import { ScrollView, StyleSheet, View } from 'react-native';

import type {
  PlacementResultViewModel,
  PlacementTopicRow,
} from '@/modules/onboarding/model/placement-result-view-model';
import { AppButton } from '@/shared/ui/components/app-button';
import { AppText } from '@/shared/ui/components/app-text';
import { BottomAction } from '@/shared/ui/components/bottom-action';
import { Card } from '@/shared/ui/components/card';
import { Screen } from '@/shared/ui/components/screen';
import { Dino } from '@/shared/ui/dino/dino';
import { theme } from '@/shared/ui/theme/tokens';

type PlacementResultScreenProps = {
  onSkipPlan: () => void;
  onStartPlan: () => void;
  viewModel: PlacementResultViewModel;
};

/**
 * The first thing a measured learner sees. It is a map, not a score: each
 * subtopic carries the label its own evidence supports, weakest first, and the
 * day that follows from it is stated before it is offered.
 */
export function PlacementResultScreen({
  onSkipPlan,
  onStartPlan,
  viewModel,
}: PlacementResultScreenProps) {
  return (
    <Screen testID="placement-result-screen">
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.hero}>
          <Dino size={96} />
          <AppText accessibilityRole="header" align="center" style={styles.title} variant="headingL">
            Başlangıç haritan hazır
          </AppText>
          <AppText align="center" color="secondary" variant="prose">
            {viewModel.detail}
          </AppText>
        </View>

        {viewModel.plan === null ? null : (
          <Card style={styles.planCard} testID="placement-plan" variant="soft">
            <AppText color="accentStrong" variant="eyebrow">
              İLK PLANIN
            </AppText>
            <AppText color="accentStrong" variant="headingS">
              {viewModel.plan.headline}
            </AppText>
            <AppText color="accentSoft" style={styles.planDetail} variant="proseS">
              {viewModel.plan.detail}
            </AppText>
            <View style={styles.planLines}>
              {viewModel.plan.lines.map((line) => (
                <AppText color="accentSoft" key={line.kind} variant="proseS">
                  {line.count} {line.label}
                </AppText>
              ))}
            </View>
          </Card>
        )}

        <AppText accessibilityRole="header" style={styles.sectionTitle} variant="headingS">
          Konu haritan
        </AppText>
        <AppText color="secondary" style={styles.sectionDescription} variant="proseS">
          Sıralama en çok çalışman gereken konudan başlar.
        </AppText>
        <View style={styles.rows}>
          {viewModel.rows.map((row) => (
            <TopicRow key={row.id} row={row} />
          ))}
        </View>
      </ScrollView>

      <BottomAction>
        <AppButton label="Bugünkü plana başla" onPress={onStartPlan} testID="placement-start-plan" />
        <AppButton
          label="Ana sayfaya dön"
          onPress={onSkipPlan}
          style={styles.secondaryAction}
          testID="placement-skip-plan"
          variant="neutral"
        />
      </BottomAction>
    </Screen>
  );
}

function TopicRow({ row }: { row: PlacementTopicRow }) {
  const needsPractice = row.band === 'needsPractice';
  const strong = row.band === 'strong';

  return (
    <Card style={styles.row} testID={`placement-topic-${row.id}`} variant="outlined">
      <View style={styles.rowTitle}>
        <AppText variant="labelM">{row.title}</AppText>
        <AppText color="muted" variant="caption">
          {row.mainTopicTitle}
        </AppText>
      </View>
      <View style={styles.rowScore}>
        <AppText color={needsPractice ? 'danger' : strong ? 'success' : 'primary'} variant="labelS">
          {row.accuracyLabel}
        </AppText>
        <AppText color="secondary" variant="caption">
          {row.statusLabel}
        </AppText>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  hero: { alignItems: 'center', paddingTop: theme.spacing.xl },
  planCard: { marginTop: theme.spacing.xxl, padding: theme.spacing.xl },
  planDetail: { marginTop: theme.spacing.xxs },
  planLines: { gap: theme.spacing.xxs, marginTop: theme.spacing.md },
  row: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: theme.spacing.md,
    padding: theme.spacing.lg,
  },
  rowScore: { alignItems: 'flex-end', gap: theme.spacing.xxs },
  rowTitle: { flex: 1, gap: theme.spacing.xxs },
  rows: { gap: theme.spacing.sm, marginTop: theme.spacing.md },
  scroll: { padding: theme.spacing.xl, paddingBottom: theme.spacing.huge },
  secondaryAction: { marginTop: theme.spacing.sm },
  sectionDescription: { marginTop: theme.spacing.xs },
  sectionTitle: { marginTop: theme.spacing.xxl },
  title: { marginBottom: theme.spacing.sm, marginTop: theme.spacing.lg },
});
