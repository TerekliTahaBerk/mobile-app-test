import { ScrollView, StyleSheet, View } from 'react-native';

import type {
  PathStepView,
  UnitPathViewModel,
  UnitSection,
} from '@/modules/learn/model/unit-path-view-model';
import { PathNode } from '@/modules/learn/ui/path-node';
import { PathTrack } from '@/modules/learn/ui/path-track';
import { AppText } from '@/shared/ui/components/app-text';
import { EyebrowPill } from '@/shared/ui/components/eyebrow-pill';
import { HudChip } from '@/shared/ui/components/hud-chip';
import { BackIcon, CheckIcon } from '@/shared/ui/components/icons';
import { Screen } from '@/shared/ui/components/screen';
import { TactilePressable } from '@/shared/ui/components/tactile-pressable';
import { BottomTabBar, type AppTabKey } from '@/shared/ui/navigation/bottom-tab-bar';
import type { SubjectTheme } from '@/shared/ui/theme/subject-theme';
import { theme } from '@/shared/ui/theme/tokens';

type UnitPathScreenProps = {
  onBack: () => void;
  onSelectStep: (step: PathStepView) => void;
  onSelectTab: (tab: AppTabKey) => void;
  viewModel: UnitPathViewModel;
};

/**
 * The signature screen: one subject's units as a single vertical path. Units
 * stack in order, each introduced by its own header, so the learner reads one
 * continuous run rather than a set of disconnected lists.
 */
export function UnitPathScreen({
  onBack,
  onSelectStep,
  onSelectTab,
  viewModel,
}: UnitPathScreenProps) {
  const tone = viewModel.subjectTheme;

  return (
    <Screen background="lesson" includeBottomInset={false} testID="unit-path-screen">
      <View style={styles.header}>
        <TactilePressable
          accessibilityLabel="Geri"
          accessibilityRole="button"
          depth={0}
          depthColor="transparent"
          faceStyle={styles.backFace}
          onPress={onBack}
          testID="unit-path-back"
        >
          <BackIcon color={tone.deep} />
        </TactilePressable>
        <View style={styles.headerTitle}>
          <AppText accessibilityRole="header" style={{ color: tone.deep }} variant="headingS">
            {viewModel.subjectTitle}
          </AppText>
          <AppText style={[styles.headerDetail, { color: tone.ink }]} variant="proseXS">
            Level {viewModel.level} · {viewModel.xp.toLocaleString('tr-TR')} XP
          </AppText>
        </View>
        <HudChip compact kind="streak" value={viewModel.streak} />
        <HudChip compact kind="hearts" value={viewModel.hearts} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {viewModel.justEarned === null ? null : (
          <View style={styles.earnedBanner}>
            <View style={styles.earnedIcon}>
              <CheckIcon size={18} strokeWidth={2.4} />
            </View>
            <AppText color="inverse" style={styles.earnedText} variant="bodyM">
              {viewModel.justEarned}
            </AppText>
          </View>
        )}

        {viewModel.sections.map((section) => (
          <UnitSectionView
            key={section.id}
            onSelectStep={onSelectStep}
            section={section}
            subjectTheme={tone}
          />
        ))}
      </ScrollView>

      <BottomTabBar activeTab="ogren" onSelectTab={onSelectTab} />
    </Screen>
  );
}

function UnitSectionView({
  onSelectStep,
  section,
  subjectTheme: tone,
}: {
  onSelectStep: (step: PathStepView) => void;
  section: UnitSection;
  subjectTheme: SubjectTheme;
}) {
  const completedCount = section.steps.filter((step) => step.status === 'completed').length;

  return (
    <View testID={`unit-section-${section.id}`}>
      <View style={styles.unitHeader}>
        <EyebrowPill
          ink={section.locked ? theme.colors.path.lockedInk : tone.ink}
          label={section.eyebrow}
          surface={section.locked ? theme.colors.background.subtle : tone.soft}
        />
        <AppText style={[styles.unitTitle, { color: tone.deep }]} variant="headingS">
          {section.title}
        </AppText>
        <AppText style={[styles.unitProgress, { color: tone.ink }]} variant="proseS">
          {section.progressLabel}
        </AppText>
      </View>

      {section.steps.length === 0 ? null : (
        <View style={styles.path}>
          <PathTrack
            completedCount={completedCount}
            subjectTheme={tone}
            totalCount={section.steps.length}
          />
          {section.steps.map((step) => (
            <PathNode key={step.id} onPress={onSelectStep} step={step} subjectTheme={tone} />
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  backFace: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: theme.hitTarget,
    minWidth: theme.hitTarget - 12,
  },
  earnedBanner: {
    alignItems: 'center',
    backgroundColor: theme.colors.action.primary,
    borderRadius: theme.radii.large + 2,
    flexDirection: 'row',
    gap: theme.spacing.md + 1,
    marginHorizontal: theme.spacing.xl,
    marginTop: theme.spacing.lg + 2,
    paddingHorizontal: theme.spacing.lg + 2,
    paddingVertical: theme.spacing.lg,
  },
  earnedIcon: {
    alignItems: 'center',
    backgroundColor: theme.colors.surface.onDarkStrong,
    borderRadius: theme.radii.small - 1,
    height: 34,
    justifyContent: 'center',
    width: 34,
  },
  earnedText: {
    flex: 1,
  },
  header: {
    alignItems: 'center',
    borderBottomColor: theme.colors.border.hairline,
    borderBottomWidth: 1,
    flexDirection: 'row',
    gap: theme.spacing.sm + 2,
    paddingBottom: theme.spacing.lg,
    paddingHorizontal: theme.spacing.xl,
    paddingTop: theme.spacing.sm,
  },
  headerDetail: {
    marginTop: 1,
  },
  headerTitle: {
    flex: 1,
  },
  path: {
    marginHorizontal: 16,
    position: 'relative',
  },
  scroll: {
    paddingBottom: theme.spacing.lg,
  },
  unitHeader: {
    paddingHorizontal: theme.spacing.xl,
    paddingTop: theme.spacing.xxl,
  },
  unitProgress: {
    marginTop: theme.spacing.xs,
  },
  unitTitle: {
    marginTop: 9,
  },
});
