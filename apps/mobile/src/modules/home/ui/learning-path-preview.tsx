import { StyleSheet, View } from 'react-native';

import type {
  HomePreviewViewModel,
  PathStepPreview,
  PathStepPreviewState,
} from '@/modules/home/model/home-preview-data';
import { AppText, type AppTextColor } from '@/shared/ui/components/app-text';
import { Card } from '@/shared/ui/components/card';
import { theme } from '@/shared/ui/theme/tokens';

type LearningPathPreviewProps = Pick<HomePreviewViewModel, 'subject' | 'unit'> & {
  steps: readonly PathStepPreview[];
};

const traceDots = ['trace-1', 'trace-2', 'trace-3', 'trace-4'] as const;

export function LearningPathPreview({ steps, subject, unit }: LearningPathPreviewProps) {
  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <View style={styles.sectionCopy}>
          <AppText color="accent" variant="caption">
            ÖĞRENME YOLU
          </AppText>
          <AppText accessibilityRole="header" variant="headingL">
            {subject} rotası
          </AppText>
        </View>
        <AppText color="muted" variant="bodyS">
          Statik önizleme
        </AppText>
      </View>

      <View accessible accessibilityLabel={`${unit.eyebrow}, ${unit.title}, ${unit.progress}`} style={styles.unitBanner}>
        <View style={styles.unitCopy}>
          <AppText color="inverse" variant="caption">
            {unit.eyebrow}
          </AppText>
          <AppText color="inverse" variant="headingL">
            {unit.title}
          </AppText>
        </View>
        <View style={styles.unitProgress}>
          <AppText color="inverse" variant="labelM">
            {unit.progress}
          </AppText>
        </View>
      </View>

      <View style={styles.pathList}>
        {steps.map((step, index) => (
          <PathStepCard isLast={index === steps.length - 1} key={step.id} step={step} />
        ))}
      </View>
    </View>
  );
}

type PathStepCardProps = {
  isLast: boolean;
  step: PathStepPreview;
};

function PathStepCard({ isLast, step }: PathStepCardProps) {
  const stateStyle = stateStyles[step.state];
  const marker = markerByState[step.state] ?? step.index;

  return (
    <View
      accessible
      accessibilityLabel={`${step.title}. ${step.status}. ${step.detail}`}
      style={styles.stepRow}
    >
      <View importantForAccessibility="no-hide-descendants" style={styles.traceColumn}>
        <View style={[styles.stepNode, stateStyle.node]}>
          <AppText color={stateStyle.nodeTextColor} variant={step.state === 'checkpoint' ? 'caption' : 'labelM'}>
            {marker}
          </AppText>
        </View>
        {!isLast ? (
          <View style={styles.traceConnector}>
            {traceDots.map((dot) => (
              <View key={dot} style={styles.traceDot} />
            ))}
          </View>
        ) : null}
      </View>

      <Card style={[styles.stepCard, stateStyle.card]} variant="outlined">
        <AppText color={stateStyle.statusTextColor} variant="caption">
          {step.status.toLocaleUpperCase('tr-TR')}
        </AppText>
        <AppText variant="headingM">{step.title}</AppText>
        <AppText color="secondary" variant="bodyS">
          {step.detail}
        </AppText>
      </Card>
    </View>
  );
}

type PathStateStyle = {
  card: object;
  node: object;
  nodeTextColor: AppTextColor;
  statusTextColor: AppTextColor;
};

const styles = StyleSheet.create({
  pathList: {
    gap: theme.spacing.sm,
  },
  section: {
    gap: theme.spacing.lg,
  },
  sectionCopy: {
    gap: theme.spacing.xs,
  },
  sectionHeader: {
    alignItems: 'flex-end',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.md,
    justifyContent: 'space-between',
  },
  stepCard: {
    flex: 1,
    gap: theme.spacing.xs,
    minHeight: 106,
    padding: theme.spacing.lg,
  },
  stepNode: {
    alignItems: 'center',
    borderRadius: theme.radii.pill,
    height: 48,
    justifyContent: 'center',
    width: 48,
  },
  stepRow: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: theme.spacing.md,
  },
  traceColumn: {
    alignItems: 'center',
    minHeight: 114,
    width: 48,
  },
  traceConnector: {
    alignItems: 'center',
    flex: 1,
    gap: 5,
    justifyContent: 'space-evenly',
    paddingVertical: theme.spacing.xs,
  },
  traceDot: {
    backgroundColor: theme.colors.reward.trace,
    borderRadius: theme.radii.pill,
    height: 4,
    opacity: 0.55,
    width: 4,
  },
  unitBanner: {
    alignItems: 'center',
    backgroundColor: theme.colors.subject.history.primary,
    borderBottomColor: theme.colors.subject.history.dark,
    borderBottomWidth: 6,
    borderRadius: theme.radii.large,
    flexDirection: 'row',
    gap: theme.spacing.md,
    justifyContent: 'space-between',
    padding: theme.spacing.xl,
  },
  unitCopy: {
    flex: 1,
    gap: theme.spacing.xs,
  },
  unitProgress: {
    backgroundColor: theme.colors.subject.history.dark,
    borderRadius: theme.radii.pill,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
  },
});

const stateVisuals = StyleSheet.create({
  availableCard: {
    backgroundColor: theme.colors.surface.default,
  },
  availableNode: {
    backgroundColor: theme.colors.subject.history.primary,
  },
  checkpointCard: {
    backgroundColor: theme.colors.status.warningSurface,
    borderColor: theme.colors.reward.highlight,
    borderStyle: 'dashed',
    borderWidth: 2,
  },
  checkpointNode: {
    backgroundColor: theme.colors.reward.highlight,
  },
  completeCard: {
    backgroundColor: theme.colors.subject.history.soft,
    borderColor: theme.colors.subject.history.primary,
  },
  completeNode: {
    backgroundColor: theme.colors.status.success,
  },
  currentCard: {
    ...theme.elevation.raised,
    backgroundColor: theme.colors.surface.default,
    borderColor: theme.colors.action.primary,
    borderWidth: 2,
  },
  currentNode: {
    backgroundColor: theme.colors.action.primary,
    borderColor: theme.colors.action.primaryPressed,
    borderWidth: 3,
    height: 56,
    width: 56,
  },
  lockedCard: {
    backgroundColor: theme.colors.background.subtle,
    borderColor: theme.colors.border.strong,
  },
  lockedNode: {
    backgroundColor: theme.colors.action.disabled,
    borderColor: theme.colors.text.muted,
    borderWidth: 1,
  },
});

const markerByState: Partial<Record<PathStepPreviewState, string>> = {
  checkpoint: 'ARA',
  complete: '✓',
  locked: 'KİLİT',
};

const stateStyles: Record<PathStepPreviewState, PathStateStyle> = {
  available: {
    card: stateVisuals.availableCard,
    node: stateVisuals.availableNode,
    nodeTextColor: 'inverse',
    statusTextColor: 'secondary',
  },
  checkpoint: {
    card: stateVisuals.checkpointCard,
    node: stateVisuals.checkpointNode,
    nodeTextColor: 'primary',
    statusTextColor: 'warning',
  },
  complete: {
    card: stateVisuals.completeCard,
    node: stateVisuals.completeNode,
    nodeTextColor: 'inverse',
    statusTextColor: 'success',
  },
  current: {
    card: stateVisuals.currentCard,
    node: stateVisuals.currentNode,
    nodeTextColor: 'inverse',
    statusTextColor: 'accent',
  },
  locked: {
    card: stateVisuals.lockedCard,
    node: stateVisuals.lockedNode,
    nodeTextColor: 'secondary',
    statusTextColor: 'muted',
  },
};
