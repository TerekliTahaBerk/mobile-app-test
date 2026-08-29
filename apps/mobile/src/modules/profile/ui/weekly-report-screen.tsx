import { ScrollView, StyleSheet, View } from 'react-native';

import type { WeeklyReportDay } from '@/modules/learner/domain/learner-profile';
import type {
  WeeklyReportTopicRow,
  WeeklyReportViewModel,
} from '@/modules/profile/model/weekly-report-view-model';
import { AppText } from '@/shared/ui/components/app-text';
import { Card } from '@/shared/ui/components/card';
import { BackIcon, CheckIcon, RepeatIcon } from '@/shared/ui/components/icons';
import { Screen } from '@/shared/ui/components/screen';
import { TactilePressable } from '@/shared/ui/components/tactile-pressable';
import { theme } from '@/shared/ui/theme/tokens';

type WeeklyReportScreenProps = {
  onBack: () => void;
  onChangeDay: (day: WeeklyReportDay) => void;
  viewModel: WeeklyReportViewModel;
};

/**
 * Haftalık rapor. A closed week, not a live meter: it covers the seven days
 * ending on the day the learner chose, and it keeps saying the same thing until
 * that day comes round again.
 */
export function WeeklyReportScreen({
  onBack,
  onChangeDay,
  viewModel,
}: WeeklyReportScreenProps) {
  return (
    <Screen background="lesson" testID="weekly-report-screen">
      <View style={styles.header}>
        <TactilePressable
          accessibilityLabel="Geri"
          accessibilityRole="button"
          depth={0}
          depthColor="transparent"
          faceStyle={styles.backFace}
          onPress={onBack}
          testID="weekly-report-back"
        >
          <BackIcon color={theme.colors.text.accentStrong} />
        </TactilePressable>
        <View style={styles.headerTitle}>
          <AppText accessibilityRole="header" variant="headingS">
            Haftalık raporun
          </AppText>
          <AppText color="secondary" variant="proseXS">
            {viewModel.dateRange} · {viewModel.status}
          </AppText>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {viewModel.empty ? (
          <Card style={styles.empty} testID="weekly-report-empty" variant="outlined">
            <AppText style={styles.emptyTitle} variant="headingXS">
              Bu hafta kayıt yok
            </AppText>
            <AppText align="center" color="secondary" variant="prose">
              {viewModel.suggestion}
            </AppText>
          </Card>
        ) : (
          <>
            <View style={styles.statGrid}>
              {viewModel.stats.map((stat) => (
                <Card key={stat.id} style={styles.statCard} testID={`stat-${stat.id}`}>
                  <AppText color="accentStrong" variant="numeric">
                    {stat.value}
                  </AppText>
                  <AppText color="secondary" variant="caption">
                    {stat.label}
                  </AppText>
                  {stat.note === null ? null : (
                    <AppText color="muted" style={styles.statNote} variant="caption">
                      {stat.note}
                    </AppText>
                  )}
                </Card>
              ))}
            </View>

            <TopicSection
              emptyNote="Bu hafta hiçbir konu güçlü seviyeye geçmedi."
              icon="strong"
              rows={viewModel.strengthened}
              testID="weekly-strengthened"
              title="Güçlenen konular"
            />
            <TopicSection
              emptyNote="Tekrar bekleyen konu kalmadı."
              icon="weak"
              rows={viewModel.stillWeak}
              testID="weekly-still-weak"
              title="Hâlâ tekrar isteyenler"
            />

            <Card style={styles.suggestion} variant="soft">
              <AppText color="accentStrong" variant="eyebrow">
                GELECEK HAFTA
              </AppText>
              <AppText color="accentSoft" style={styles.suggestionText} variant="prose">
                {viewModel.suggestion}
              </AppText>
            </Card>
          </>
        )}

        <AppText accessibilityRole="header" style={styles.sectionTitle} variant="headingS">
          Rapor günün
        </AppText>
        <AppText color="secondary" style={styles.sectionDescription} variant="proseS">
          Hafta bu günde kapanır. Değiştirdiğinde rapor yeni haftaya göre yeniden hesaplanır.
        </AppText>
        <View style={styles.days}>
          {viewModel.dayOptions.map((option) => {
            const selected = option.value === viewModel.day;

            return (
              <TactilePressable
                accessibilityLabel={option.label}
                accessibilityRole="button"
                accessibilityState={{ selected }}
                depth={selected ? 3 : 2}
                depthColor={
                  selected ? theme.colors.action.primaryDepth : theme.colors.border.subtle
                }
                faceStyle={[styles.dayFace, selected ? styles.dayFaceSelected : null]}
                key={option.value}
                onPress={() => onChangeDay(option.value)}
                testID={`report-day-${option.value}`}
              >
                <AppText color={selected ? 'inverse' : 'primary'} variant="labelS">
                  {option.label}
                </AppText>
              </TactilePressable>
            );
          })}
        </View>
      </ScrollView>
    </Screen>
  );
}

function TopicSection({
  emptyNote,
  icon,
  rows,
  testID,
  title,
}: {
  emptyNote: string;
  icon: 'strong' | 'weak';
  rows: readonly WeeklyReportTopicRow[];
  testID: string;
  title: string;
}) {
  return (
    <View style={styles.section} testID={testID}>
      <AppText accessibilityRole="header" variant="headingS">
        {title}
      </AppText>
      {rows.length === 0 ? (
        <AppText color="secondary" style={styles.sectionDescription} variant="proseS">
          {emptyNote}
        </AppText>
      ) : (
        <View style={styles.topicList}>
          {rows.map((row) => (
            <Card
              key={row.id}
              style={styles.topicRow}
              testID={`${testID}-${row.id}`}
              variant="outlined"
            >
              {icon === 'strong' ? (
                <CheckIcon color={theme.colors.status.successInk} size={18} />
              ) : (
                <RepeatIcon color={theme.colors.status.dangerInk} size={18} />
              )}
              <View style={styles.topicText}>
                <AppText variant="labelM">{row.title}</AppText>
                <AppText color="secondary" variant="proseXS">
                  {row.detail}
                </AppText>
              </View>
            </Card>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  backFace: {
    alignItems: 'center',
    height: theme.hitTarget,
    justifyContent: 'center',
    width: theme.hitTarget,
  },
  dayFace: {
    alignItems: 'center',
    backgroundColor: theme.colors.surface.default,
    borderColor: theme.colors.border.subtle,
    borderRadius: theme.radii.pill,
    borderWidth: 2,
    justifyContent: 'center',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
  },
  dayFaceSelected: {
    backgroundColor: theme.colors.action.primary,
    borderColor: theme.colors.action.primary,
  },
  days: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
    marginTop: theme.spacing.md,
  },
  empty: {
    alignItems: 'center',
    marginTop: theme.spacing.xl,
    paddingHorizontal: theme.spacing.xl,
    paddingVertical: theme.spacing.xxl,
  },
  emptyTitle: { marginBottom: theme.spacing.sm },
  header: {
    alignItems: 'center',
    borderBottomColor: theme.colors.border.hairline,
    borderBottomWidth: 1,
    flexDirection: 'row',
    minHeight: 64,
    paddingHorizontal: theme.spacing.md,
  },
  headerTitle: { flex: 1, paddingRight: theme.spacing.xl },
  scroll: { padding: theme.spacing.xl, paddingBottom: theme.spacing.xxl },
  section: { marginTop: theme.spacing.xxl },
  sectionDescription: { marginTop: theme.spacing.xs },
  sectionTitle: { marginTop: theme.spacing.xxl },
  statCard: {
    flexBasis: '47%',
    flexGrow: 1,
    gap: theme.spacing.xxs,
    paddingVertical: theme.spacing.lg,
  },
  statGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.md,
    marginTop: theme.spacing.md,
  },
  statNote: { marginTop: theme.spacing.xxs },
  suggestion: { marginTop: theme.spacing.xxl, padding: theme.spacing.xl },
  suggestionText: { marginTop: theme.spacing.xs },
  topicList: { gap: theme.spacing.sm, marginTop: theme.spacing.md },
  topicRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: theme.spacing.md,
    padding: theme.spacing.lg,
  },
  topicText: { flex: 1, gap: theme.spacing.xxs },
});
