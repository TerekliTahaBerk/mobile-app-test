import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import type {
  ContinueCard,
  HomeViewModel,
  SubjectTile,
} from '@/modules/home/model/home-view-model';
import { AppText } from '@/shared/ui/components/app-text';
import { Card } from '@/shared/ui/components/card';
import { HudChip } from '@/shared/ui/components/hud-chip';
import {
  BookmarkIcon,
  ChevronIcon,
  LeagueIcon,
  SubjectIcon,
} from '@/shared/ui/components/icons';
import { ProgressBar } from '@/shared/ui/components/progress-bar';
import { Screen } from '@/shared/ui/components/screen';
import { SegmentedToggle } from '@/shared/ui/components/segmented-toggle';
import { BottomTabBar, type AppTabKey } from '@/shared/ui/navigation/bottom-tab-bar';
import { theme } from '@/shared/ui/theme/tokens';

export type ExamFilter = 'ayt' | 'tyt';

type HomeScreenProps = {
  exam: ExamFilter;
  onChangeExam: (exam: ExamFilter) => void;
  onContinue: (card: ContinueCard) => void;
  onOpenLeague: () => void;
  onOpenSubject: (subjectId: string) => void;
  onSelectTab: (tab: AppTabKey) => void;
  viewModel: HomeViewModel;
};

/**
 * Ana Sayfa: who the learner is, what they were in the middle of, and every
 * subject they can open. The continue card is the only primary action —
 * everything else is a way into the same loop from a different angle.
 */
export function HomeScreen({
  exam,
  onChangeExam,
  onContinue,
  onOpenLeague,
  onOpenSubject,
  onSelectTab,
  viewModel,
}: HomeScreenProps) {
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

        <View style={styles.examToggle}>
          <SegmentedToggle
            accessibilityLabel="Sınav seçimi"
            onChange={onChangeExam}
            options={[
              { label: 'TYT', value: 'tyt' },
              { label: 'AYT', value: 'ayt' },
            ]}
            value={exam}
          />
        </View>

        <AppText accessibilityRole="header" style={styles.sectionTitle} variant="headingM">
          Dersler
        </AppText>

        {viewModel.subjects.length === 0 ? (
          <Card style={styles.emptySubjects}>
            <AppText color="secondary" variant="prose">
              Bu sınav için henüz ders eklenmedi.
            </AppText>
          </Card>
        ) : (
          <View style={styles.subjectGrid}>
            {viewModel.subjects.map((subject) => (
              <SubjectCard key={subject.id} onPress={onOpenSubject} subject={subject} />
            ))}
          </View>
        )}

        {viewModel.leagueRank === null ? null : (
          <Pressable
            accessibilityLabel={`${viewModel.leagueRank.name}, ${viewModel.leagueRank.rank}. sıra`}
            accessibilityRole="button"
            onPress={onOpenLeague}
            style={styles.leagueRow}
            testID="home-league-row"
          >
            <View style={styles.leagueIcon}>
              <LeagueIcon color={theme.colors.action.primary} size={20} />
            </View>
            <View style={styles.leagueBody}>
              <AppText variant="bodyM">
                {viewModel.leagueRank.name} · #{viewModel.leagueRank.rank}
              </AppText>
              <AppText color="secondary" style={styles.leagueDetail} variant="proseS">
                {viewModel.leagueRank.closesIn}
              </AppText>
            </View>
            <ChevronIcon color={theme.colors.text.muted} />
          </Pressable>
        )}
      </ScrollView>

      <BottomTabBar activeTab="anasayfa" onSelectTab={onSelectTab} />
    </Screen>
  );
}

function ContinueBanner({
  card,
  onPress,
}: {
  card: ContinueCard;
  onPress: (card: ContinueCard) => void;
}) {
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
        <AppText color="onDarkFaint" style={styles.continueEyebrow} variant="eyebrow">
          KALDIĞIN YERDEN
        </AppText>
        <AppText color="inverse" variant="headingXS">
          {card.subjectTitle}
        </AppText>
        <AppText color="onDark" style={styles.continueDetail} variant="proseS">
          {card.detail}
        </AppText>
      </View>
      <View style={styles.continueAction}>
        <AppText color="inverse" variant="labelM">
          Devam
        </AppText>
      </View>
    </Pressable>
  );
}

function SubjectCard({
  onPress,
  subject,
}: {
  onPress: (subjectId: string) => void;
  subject: SubjectTile;
}) {
  const tone = subject.subjectTheme;
  const isAvailable = subject.level !== null;

  return (
    <Pressable
      accessibilityLabel={
        isAvailable ? `${subject.title}, seviye ${subject.level}` : `${subject.title}, yakında`
      }
      accessibilityRole="button"
      accessibilityState={{ disabled: !isAvailable }}
      disabled={!isAvailable}
      onPress={() => onPress(subject.id)}
      style={[
        styles.subjectCard,
        { backgroundColor: tone.soft, borderColor: tone.border },
        isAvailable ? null : styles.subjectCardPending,
      ]}
      testID={`subject-${subject.id}`}
    >
      <View style={styles.subjectIcon}>
        <SubjectIcon color={tone.primary} name={tone.icon} />
      </View>
      <AppText style={[styles.subjectTitle, { color: tone.deep }]} variant="headingXS">
        {subject.title}
      </AppText>
      {isAvailable ? (
        <View style={styles.subjectMeter}>
          <View style={styles.subjectMeterTrack}>
            <ProgressBar
              accessibilityLabel={`${subject.title} ilerlemesi`}
              fillColor={tone.primary}
              height={6}
              trackColor={theme.colors.surface.default}
              value={subject.progress}
            />
          </View>
          <AppText style={{ color: tone.ink }} variant="mono">
            Lv {subject.level}
          </AppText>
        </View>
      ) : (
        <AppText style={[styles.subjectPending, { color: tone.ink }]} variant="proseS">
          Yakında
        </AppText>
      )}
    </Pressable>
  );
}

/** Turkish thousands separator, as the design writes XP figures. */
function formatXp(value: number): string {
  return value.toLocaleString('tr-TR');
}

const styles = StyleSheet.create({
  avatar: {
    alignItems: 'center',
    backgroundColor: theme.colors.surface.soft,
    borderColor: theme.colors.action.primary,
    borderRadius: theme.radii.pill,
    borderWidth: 2,
    height: 44,
    justifyContent: 'center',
    width: 44,
  },
  continueAction: {
    backgroundColor: theme.colors.action.primary,
    borderRadius: theme.radii.pill,
    paddingHorizontal: theme.spacing.md + 5,
    paddingVertical: theme.spacing.md + 2,
  },
  continueBody: {
    flex: 1,
    gap: 3,
  },
  continueCard: {
    alignItems: 'center',
    backgroundColor: theme.colors.action.primaryDepth,
    borderRadius: theme.radii.node,
    flexDirection: 'row',
    gap: theme.spacing.lg,
    marginHorizontal: theme.spacing.xl,
    marginTop: theme.spacing.lg,
    padding: theme.spacing.md + 5,
  },
  continueDetail: {
    marginTop: 1,
  },
  continueEyebrow: {
    textTransform: 'uppercase',
  },
  continueIcon: {
    alignItems: 'center',
    backgroundColor: theme.colors.surface.onDark,
    borderRadius: theme.radii.medium,
    height: 52,
    justifyContent: 'center',
    width: 52,
  },
  emptySubjects: {
    marginHorizontal: theme.spacing.xl,
    marginTop: theme.spacing.lg,
  },
  examToggle: {
    marginHorizontal: theme.spacing.xl,
    marginTop: theme.spacing.xxl,
  },
  greeting: {
    flex: 1,
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: theme.spacing.sm + 2,
    paddingHorizontal: theme.spacing.xl,
    paddingTop: theme.spacing.md,
  },
  leagueBody: {
    flex: 1,
  },
  leagueDetail: {
    marginTop: 1,
  },
  leagueIcon: {
    alignItems: 'center',
    backgroundColor: theme.colors.surface.soft,
    borderRadius: theme.radii.small,
    height: 38,
    justifyContent: 'center',
    width: 38,
  },
  leagueRow: {
    alignItems: 'center',
    backgroundColor: theme.colors.surface.default,
    borderColor: theme.colors.border.subtle,
    borderRadius: theme.radii.large + 2,
    borderWidth: 1,
    flexDirection: 'row',
    gap: theme.spacing.md + 1,
    marginHorizontal: theme.spacing.xl,
    marginTop: theme.spacing.xl,
    paddingHorizontal: theme.spacing.lg + 2,
    paddingVertical: theme.spacing.lg,
  },
  levelBadge: {
    alignItems: 'center',
    backgroundColor: theme.colors.action.primaryDepth,
    borderRadius: theme.radii.small - 1,
    height: 34,
    justifyContent: 'center',
    width: 34,
  },
  levelBadgeText: {
    color: theme.colors.progress.gain,
  },
  levelBody: {
    flex: 1,
    gap: 5,
  },
  levelCard: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: theme.spacing.md + 1,
    marginHorizontal: theme.spacing.xl,
    marginTop: theme.spacing.lg,
  },
  levelRow: {
    alignItems: 'baseline',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  scroll: {
    paddingBottom: theme.spacing.xxl,
  },
  sectionTitle: {
    marginHorizontal: theme.spacing.xl,
    marginTop: theme.spacing.xl,
  },
  subjectCard: {
    borderRadius: theme.radii.xlarge,
    borderWidth: 2,
    flexBasis: '48%',
    flexGrow: 1,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md + 5,
  },
  subjectCardPending: {
    opacity: 0.72,
  },
  subjectGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.md + 1,
    marginHorizontal: theme.spacing.xl,
    marginTop: theme.spacing.lg,
  },
  subjectIcon: {
    alignItems: 'center',
    backgroundColor: theme.colors.surface.default,
    borderRadius: theme.radii.medium,
    height: 52,
    justifyContent: 'center',
    width: 52,
  },
  subjectMeter: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 7,
    marginTop: theme.spacing.sm,
  },
  subjectMeterTrack: {
    flex: 1,
  },
  subjectPending: {
    marginTop: theme.spacing.sm,
  },
  subjectTitle: {
    marginTop: theme.spacing.md + 1,
  },
});
