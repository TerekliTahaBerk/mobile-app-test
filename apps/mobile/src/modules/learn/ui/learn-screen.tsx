import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import type { LearnViewModel, SubjectRow } from '@/modules/learn/model/learn-view-model';
import type { ExamFilter } from '@/modules/home/ui/home-screen';
import { AppText } from '@/shared/ui/components/app-text';
import { HudChip } from '@/shared/ui/components/hud-chip';
import { LockIcon, SubjectIcon } from '@/shared/ui/components/icons';
import { ProgressBar } from '@/shared/ui/components/progress-bar';
import { Screen } from '@/shared/ui/components/screen';
import { SegmentedToggle } from '@/shared/ui/components/segmented-toggle';
import { BottomTabBar, type AppTabKey } from '@/shared/ui/navigation/bottom-tab-bar';
import { theme } from '@/shared/ui/theme/tokens';

type LearnScreenProps = {
  exam: ExamFilter;
  onChangeExam: (exam: ExamFilter) => void;
  onOpenSubject: (subjectId: string) => void;
  onSelectTab: (tab: AppTabKey) => void;
  viewModel: LearnViewModel;
};

/**
 * Öğren: every subject in the chosen exam as a full-width row. The current
 * subject is the only one that carries its own colour; the rest stay quiet so
 * the eye lands on where the learner already is.
 */
export function LearnScreen({
  exam,
  onChangeExam,
  onOpenSubject,
  onSelectTab,
  viewModel,
}: LearnScreenProps) {
  const [leadRow, ...restRows] = viewModel.rows;

  return (
    <Screen includeBottomInset={false} testID="learn-screen">
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <AppText accessibilityRole="header" style={styles.title} variant="headingL">
            Öğren
          </AppText>
          <HudChip compact kind="streak" value={viewModel.streak} />
          <HudChip compact kind="hearts" value={viewModel.hearts} />
        </View>

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

        {viewModel.rows.length === 0 ? (
          <View style={styles.empty}>
            <AppText color="secondary" variant="prose">
              Bu sınav için henüz ders eklenmedi.
            </AppText>
          </View>
        ) : (
          <View style={styles.rows}>
            {leadRow === undefined ? null : (
              <SubjectListRow highlighted onPress={onOpenSubject} row={leadRow} />
            )}
            {restRows.map((row) => (
              <SubjectListRow key={row.id} onPress={onOpenSubject} row={row} />
            ))}
          </View>
        )}
      </ScrollView>

      <BottomTabBar activeTab="ogren" onSelectTab={onSelectTab} />
    </Screen>
  );
}

function SubjectListRow({
  highlighted = false,
  onPress,
  row,
}: {
  highlighted?: boolean;
  onPress: (subjectId: string) => void;
  row: SubjectRow;
}) {
  const tone = row.subjectTheme;

  return (
    <Pressable
      accessibilityLabel={`${row.title}. ${row.detail}`}
      accessibilityRole="button"
      accessibilityState={{ disabled: row.locked }}
      disabled={row.locked}
      onPress={() => onPress(row.id)}
      style={[
        styles.row,
        highlighted ? { backgroundColor: tone.soft, borderColor: tone.primary, borderWidth: 2 } : null,
      ]}
      testID={`learn-subject-${row.id}`}
    >
      <View
        style={[
          styles.rowIcon,
          { backgroundColor: highlighted ? theme.colors.surface.default : tone.soft },
        ]}
      >
        {row.locked ? (
          <LockIcon color={theme.colors.text.muted} size={22} />
        ) : (
          <SubjectIcon color={tone.primary} name={tone.icon} size={27} />
        )}
      </View>
      <View style={styles.rowBody}>
        <AppText
          style={highlighted ? { color: tone.deep } : row.locked ? styles.lockedTitle : null}
          variant="headingXS"
        >
          {row.title}
        </AppText>
        <AppText
          color={row.locked ? 'muted' : 'secondary'}
          style={[styles.rowDetail, highlighted ? { color: tone.ink } : null]}
          variant="proseS"
        >
          {row.detail}
        </AppText>
        {row.locked ? null : (
          <ProgressBar
            accessibilityLabel={`${row.title} ilerlemesi`}
            fillColor={tone.primary}
            height={6}
            trackColor={highlighted ? theme.colors.surface.default : theme.colors.progress.track}
            value={row.progress}
          />
        )}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  empty: {
    paddingHorizontal: theme.spacing.xl,
    paddingTop: theme.spacing.xl,
  },
  examToggle: {
    marginHorizontal: theme.spacing.xl,
    marginTop: theme.spacing.lg + 2,
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: theme.spacing.sm + 2,
    paddingHorizontal: theme.spacing.xl,
    paddingTop: theme.spacing.md,
  },
  lockedTitle: {
    color: theme.colors.text.secondary,
  },
  row: {
    alignItems: 'center',
    backgroundColor: theme.colors.surface.default,
    borderColor: theme.colors.border.subtle,
    borderRadius: theme.radii.xlarge,
    borderWidth: 1,
    flexDirection: 'row',
    gap: theme.spacing.lg,
    padding: theme.spacing.lg + 1,
  },
  rowBody: {
    flex: 1,
    gap: theme.spacing.sm + 1,
  },
  rowDetail: {
    marginTop: -5,
  },
  rowIcon: {
    alignItems: 'center',
    borderRadius: theme.radii.large - 1,
    height: 54,
    justifyContent: 'center',
    width: 54,
  },
  rows: {
    gap: theme.spacing.md,
    paddingHorizontal: theme.spacing.xl,
    paddingTop: theme.spacing.lg + 4,
  },
  scroll: {
    paddingBottom: theme.spacing.xxl,
  },
  title: {
    flex: 1,
  },
});
