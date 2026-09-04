import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import type {
  ContinueCard,
  DailyPlanCard,
  HomeViewModel,
  LeagueCard,
  PersonalizedCard,
} from '@/modules/home/model/home-view-model';
import type { DailyPlanLine } from '@/modules/learning/model/daily-plan-card';
import { AppText } from '@/shared/ui/components/app-text';
import { Card } from '@/shared/ui/components/card';
import { HudChip } from '@/shared/ui/components/hud-chip';
import {
  BookmarkIcon,
  ChevronIcon,
  LeagueIcon,
  RepeatIcon,
  StarIcon,
  StreakIcon,
  TargetIcon,
} from '@/shared/ui/components/icons';
import { ProgressBar } from '@/shared/ui/components/progress-bar';
import { Screen } from '@/shared/ui/components/screen';
import { BottomTabBar, type AppTabKey } from '@/shared/ui/navigation/bottom-tab-bar';
import { theme } from '@/shared/ui/theme/tokens';

type HomeScreenProps = {
  onContinue: (card: ContinueCard) => void;
  onOpenLeague?: (() => void) | undefined;
  onSelectTab: (tab: AppTabKey) => void;
  onStartDailyPlan: () => void;
  viewModel: HomeViewModel;
};

/** Ana Sayfa answers one question: “Şimdi ne yapmalıyım?” */
export function HomeScreen({
  onContinue,
  onOpenLeague,
  onSelectTab,
  onStartDailyPlan,
  viewModel,
}: HomeScreenProps) {
  const planLocked = viewModel.continueCard?.action.kind === 'resume';

  return (
    <Screen includeBottomInset={false} testID="home-screen">
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View style={styles.avatar}>
            <AppText color="accentStrong" variant="headingXS">
              {viewModel.initial}
            </AppText>
          </View>
          <AppText accessibilityRole="header" style={styles.greeting} variant="headingS">
            {viewModel.greeting}
          </AppText>
          <HudChip kind="streak" value={viewModel.streak} />
          <HudChip kind="hearts" value={viewModel.hearts} />
        </View>

        <Card style={styles.levelCard}>
          <View style={styles.levelBadge}>
            <AppText style={styles.levelBadgeText} variant="labelS">
              {viewModel.level}
            </AppText>
          </View>
          <View style={styles.levelBody}>
            <View style={styles.levelRow}>
              <AppText variant="bodyS">Level {viewModel.level}</AppText>
              <AppText color="secondary" variant="mono">
                {formatXp(viewModel.xpIntoLevel)} / {formatXp(viewModel.xpForLevel)} XP
              </AppText>
            </View>
            <ProgressBar
              accessibilityLabel={`Level ${viewModel.level} ilerlemesi`}
              value={viewModel.levelProgress}
            />
          </View>
        </Card>

        {viewModel.continueCard === null ? null : (
          <ContinueBanner card={viewModel.continueCard} onPress={onContinue} />
        )}

        {viewModel.dailyPlan === null ? null : (
          <View style={styles.planSection}>
            <View style={styles.sectionHeading}>
              <View>
                <AppText accessibilityRole="header" variant="headingM">
                  Bugünkü Plan
                </AppText>
                <AppText color="secondary" variant="proseS">
                  Karar verme; sıradaki adımın hazır.
                </AppText>
              </View>
              <AppText color="accentStrong" variant="labelS">
                {compactPlanLines(viewModel.dailyPlan.lines).length} adım
              </AppText>
            </View>
            <DailyPlanBanner
              card={viewModel.dailyPlan}
              disabled={planLocked}
              onPress={onStartDailyPlan}
            />
          </View>
        )}

        <DailyProgress progress={viewModel.dailyProgress} />

        {viewModel.personalizedCard === null ? null : (
          <PersonalizedBanner
            card={viewModel.personalizedCard}
            disabled={planLocked}
            onPress={onStartDailyPlan}
          />
        )}

        {onOpenLeague === undefined ? null : (
          <LeagueBanner card={viewModel.leagueCard} onPress={onOpenLeague} />
        )}
      </ScrollView>

      <BottomTabBar activeTab="anasayfa" onSelectTab={onSelectTab} />
    </Screen>
  );
}

function LeagueBanner({ card, onPress }: { card: LeagueCard; onPress: () => void }) {
  const standing = card.kind === 'standing' ? `, ${card.rank}. sıra` : '';

  return (
    <View style={styles.leagueSection}>
      <View style={styles.sectionHeading}>
        <AppText accessibilityRole="header" variant="headingM">
          Lig
        </AppText>
        <AppText color="secondary" variant="proseS">
          Haftalık XP sıralaması
        </AppText>
      </View>
      <Pressable
        accessibilityLabel={`${card.title}${standing}. ${card.detail}`}
        accessibilityRole="button"
        onPress={onPress}
        style={styles.leagueRow}
        testID="home-league-row"
      >
        <View style={styles.leagueIcon}>
          <LeagueIcon color={theme.colors.action.primary} size={22} />
        </View>
        <View style={styles.leagueBody}>
          <AppText variant="bodyM">
            {card.title}
            {card.kind === 'standing' ? ` · #${card.rank}` : ''}
          </AppText>
          <AppText color="secondary" style={styles.leagueDetail} variant="proseS">
            {card.detail}
          </AppText>
        </View>
        <ChevronIcon color={theme.colors.text.muted} />
      </Pressable>
    </View>
  );
}

function DailyPlanBanner({
  card,
  disabled,
  onPress,
}: {
  card: DailyPlanCard;
  disabled: boolean;
  onPress: () => void;
}) {
  const lines = compactPlanLines(card.lines);

  return (
    <Pressable
      accessibilityLabel={`${card.headline}, ${card.detail}`}
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      style={[styles.planCard, disabled ? styles.disabledCard : null]}
      testID="home-daily-plan"
    >
      <View style={styles.planHeader}>
        <View style={styles.planMark}>
          <TargetIcon color={theme.colors.text.inverse} size={24} />
        </View>
        <View style={styles.planTitle}>
          <AppText color="inverse" variant="headingS">
            {card.headline}
          </AppText>
          <AppText color="onDark" variant="proseS">
            {card.detail}
          </AppText>
        </View>
        <View style={styles.planAction}>
          <AppText color="accentStrong" variant="labelM">
            {disabled ? 'Önce devam et' : card.actionLabel}
          </AppText>
        </View>
      </View>
      <View style={styles.planLines}>
        {lines.map((line) => (
          <View key={line.kind} style={styles.planLine}>
            <View style={styles.planCount}>
              <AppText color="accentStrong" variant="labelS">
                {line.count}
              </AppText>
            </View>
            <AppText color="onDark" style={styles.planLineLabel} variant="proseS">
              {line.label}
            </AppText>
          </View>
        ))}
      </View>
    </Pressable>
  );
}

function DailyProgress({ progress }: { progress: HomeViewModel['dailyProgress'] }) {
  const value = progress.goal === 0 ? 0 : Math.min(progress.completed / progress.goal, 1);

  return (
    <Card style={styles.progressCard} testID="home-daily-progress" variant="soft">
      <View style={styles.progressHeading}>
        <AppText variant="labelM">Bugünkü ilerleme</AppText>
        <AppText color="accentStrong" variant="mono">
          {progress.completed} / {progress.goal} çalışma
        </AppText>
      </View>
      <ProgressBar accessibilityLabel="Bugünkü çalışma hedefi" height={8} value={value} />
    </Card>
  );
}

function PersonalizedBanner({
  card,
  disabled,
  onPress,
}: {
  card: PersonalizedCard;
  disabled: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityLabel={`${card.title}. ${card.detail}`}
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      style={[styles.personalizedCard, disabled ? styles.disabledCard : null]}
      testID="home-personalized-card"
    >
      <View style={styles.personalizedIcon}>
        {card.kind === 'review' ? (
          <RepeatIcon />
        ) : card.kind === 'streak' ? (
          <StreakIcon size={22} />
        ) : (
          <StarIcon color={theme.colors.action.primary} size={22} />
        )}
      </View>
      <View style={styles.personalizedBody}>
        <AppText color="muted" variant="eyebrow">
          {card.eyebrow}
        </AppText>
        <AppText variant="headingXS">{card.title}</AppText>
        <AppText color="secondary" variant="proseS">
          {card.detail}
        </AppText>
      </View>
      <AppText color="accent" variant="labelS">
        {disabled ? 'Bekliyor' : card.actionLabel}
      </AppText>
    </Pressable>
  );
}

function ContinueBanner({ card, onPress }: { card: ContinueCard; onPress: (card: ContinueCard) => void }) {
  return (
    <Pressable
      accessibilityLabel={`Kaldığın yerden devam et: ${card.subjectTitle}`}
      accessibilityRole="button"
      onPress={() => onPress(card)}
      style={styles.continueCard}
      testID="home-continue"
    >
      <View style={styles.continueIcon}>
        <BookmarkIcon />
      </View>
      <View style={styles.continueBody}>
        <AppText color="muted" variant="eyebrow">{card.eyebrow}</AppText>
        <AppText variant="headingXS">{card.subjectTitle}</AppText>
        <AppText color="secondary" variant="proseS">{card.detail}</AppText>
      </View>
      <View style={styles.continueAction}>
        <AppText color="inverse" variant="labelM">{card.actionLabel}</AppText>
      </View>
    </Pressable>
  );
}

function compactPlanLines(lines: readonly DailyPlanLine[]): readonly DailyPlanLine[] {
  if (lines.length <= 3) return lines;

  const first = lines.slice(0, 2);
  const rest = lines.slice(2);
  return [
    ...first,
    {
      count: rest.reduce((sum, line) => sum + line.count, 0),
      kind: 'newMaterial',
      label: 'yeni ve pekiştirme sorusu',
    },
  ];
}

function formatXp(value: number): string {
  return value.toLocaleString('tr-TR');
}

const styles = StyleSheet.create({
  avatar: { alignItems: 'center', backgroundColor: theme.colors.surface.soft, borderColor: theme.colors.action.primary, borderRadius: theme.radii.pill, borderWidth: 2, height: 44, justifyContent: 'center', width: 44 },
  continueAction: { backgroundColor: theme.colors.action.primary, borderRadius: theme.radii.pill, paddingHorizontal: theme.spacing.md + 5, paddingVertical: theme.spacing.md + 2 },
  continueBody: { flex: 1, gap: 3 },
  continueCard: { alignItems: 'center', backgroundColor: theme.colors.surface.default, borderBottomWidth: theme.depth.cardBorder, borderColor: theme.colors.border.subtle, borderRadius: theme.radii.node, flexDirection: 'row', gap: theme.spacing.lg, marginHorizontal: theme.spacing.xl, marginTop: theme.spacing.lg, padding: theme.spacing.md + 5 },
  continueIcon: { alignItems: 'center', backgroundColor: theme.colors.action.primaryDepth, borderRadius: theme.radii.medium, height: 52, justifyContent: 'center', width: 52 },
  disabledCard: { opacity: 0.58 },
  greeting: { flex: 1 },
  header: { alignItems: 'center', flexDirection: 'row', gap: theme.spacing.sm + 2, paddingHorizontal: theme.spacing.xl, paddingTop: theme.spacing.md },
  leagueBody: { flex: 1 },
  leagueDetail: { marginTop: 1 },
  leagueIcon: { alignItems: 'center', backgroundColor: theme.colors.surface.soft, borderRadius: theme.radii.small, height: 38, justifyContent: 'center', width: 38 },
  leagueRow: { alignItems: 'center', backgroundColor: theme.colors.surface.default, borderColor: theme.colors.border.subtle, borderRadius: theme.radii.large + 2, borderWidth: 1, flexDirection: 'row', gap: theme.spacing.md + 1, paddingHorizontal: theme.spacing.lg + 2, paddingVertical: theme.spacing.lg },
  leagueSection: { gap: theme.spacing.md, marginHorizontal: theme.spacing.xl, marginTop: theme.spacing.xxl },
  levelBadge: { alignItems: 'center', backgroundColor: theme.colors.action.primaryDepth, borderRadius: theme.radii.small - 1, height: 34, justifyContent: 'center', width: 34 },
  levelBadgeText: { color: theme.colors.progress.gain },
  levelBody: { flex: 1, gap: 5 },
  levelCard: { alignItems: 'center', flexDirection: 'row', gap: theme.spacing.md + 1, marginHorizontal: theme.spacing.xl, marginTop: theme.spacing.lg },
  levelRow: { alignItems: 'baseline', flexDirection: 'row', justifyContent: 'space-between' },
  personalizedBody: { flex: 1, gap: 2 },
  personalizedCard: { alignItems: 'center', backgroundColor: theme.colors.surface.default, borderColor: theme.colors.border.subtle, borderRadius: theme.radii.xlarge, borderWidth: 1, flexDirection: 'row', gap: theme.spacing.md, marginHorizontal: theme.spacing.xl, marginTop: theme.spacing.lg, padding: theme.spacing.lg },
  personalizedIcon: { alignItems: 'center', backgroundColor: theme.colors.surface.soft, borderRadius: theme.radii.medium, height: 44, justifyContent: 'center', width: 44 },
  planAction: { backgroundColor: theme.colors.surface.default, borderRadius: theme.radii.pill, paddingHorizontal: theme.spacing.md, paddingVertical: theme.spacing.sm },
  planCard: { backgroundColor: theme.colors.action.primaryDepth, borderRadius: theme.radii.node, gap: theme.spacing.lg, padding: theme.spacing.lg },
  planCount: { alignItems: 'center', backgroundColor: theme.colors.surface.default, borderRadius: theme.radii.pill, justifyContent: 'center', minWidth: 30, paddingHorizontal: theme.spacing.sm, paddingVertical: 4 },
  planHeader: { alignItems: 'center', flexDirection: 'row', gap: theme.spacing.md },
  planLine: { alignItems: 'center', backgroundColor: theme.colors.surface.onDark, borderRadius: theme.radii.medium, flex: 1, gap: theme.spacing.sm, minHeight: 70, padding: theme.spacing.md },
  planLineLabel: { textAlign: 'center' },
  planLines: { flexDirection: 'row', gap: theme.spacing.sm },
  planMark: { alignItems: 'center', backgroundColor: theme.colors.action.primary, borderRadius: theme.radii.medium, height: 48, justifyContent: 'center', width: 48 },
  planSection: { gap: theme.spacing.md, marginHorizontal: theme.spacing.xl, marginTop: theme.spacing.xxl },
  planTitle: { flex: 1, gap: 2 },
  progressCard: { gap: theme.spacing.md, marginHorizontal: theme.spacing.xl, marginTop: theme.spacing.lg },
  progressHeading: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between' },
  scroll: { paddingBottom: theme.spacing.xxl },
  sectionHeading: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between' },
});
