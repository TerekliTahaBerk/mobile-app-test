import { StyleSheet, View } from 'react-native';

import type {
  HomePreviewViewModel,
  PathStepPreview,
  PathStepPreviewState,
} from '@/modules/home/model/home-preview-data';
import { AppText, type AppTextColor } from '@/shared/ui/components/app-text';
import { theme } from '@/shared/ui/theme/tokens';

type LearningPathPreviewProps = Pick<HomePreviewViewModel, 'subject' | 'unit'> & {
  steps: readonly PathStepPreview[];
};

const traceDots = ['trace-1', 'trace-2', 'trace-3'] as const;

// Gentle left/right offsets create a winding trail without geometry math.
const windOffsets = [0, 64, 32, -40, -8] as const;

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

      <View style={styles.trail}>
        {steps.map((step, index) => (
          <PathTrailNode
            isLast={index === steps.length - 1}
            key={step.id}
            offset={windOffsets[index % windOffsets.length] ?? 0}
            step={step}
          />
        ))}
      </View>
    </View>
  );
}

type PathTrailNodeProps = {
  isLast: boolean;
  offset: number;
  step: PathStepPreview;
};

function PathTrailNode({ isLast, offset, step }: PathTrailNodeProps) {
  const stateStyle = stateStyles[step.state];
  const marker = markerByState[step.state] ?? step.index;
  const isCurrent = step.state === 'current';

  return (
    <View style={styles.trailRow}>
      <View
        accessible
        accessibilityLabel={`${step.title}. ${step.status}. ${step.detail}`}
        style={[styles.nodeGroup, { transform: [{ translateX: offset }] }]}
      >
        {isCurrent ? (
          <View importantForAccessibility="no-hide-descendants" style={styles.callout}>
            <AppText color="inverse" variant="labelM">
              BAŞLA
            </AppText>
            <View style={styles.calloutTail} />
          </View>
        ) : null}

        <View importantForAccessibility="no-hide-descendants" style={styles.nodeFrame}>
          <View style={[styles.nodeShadow, stateStyle.shadow, isCurrent && styles.nodeShadowCurrent]} />
          <View style={[styles.nodeFace, stateStyle.node, isCurrent && styles.nodeFaceCurrent]}>
            <AppText color={stateStyle.nodeTextColor} variant={step.state === 'checkpoint' ? 'caption' : 'labelL'}>
              {marker}
            </AppText>
          </View>
        </View>

        <View importantForAccessibility="no-hide-descendants" style={styles.nodeLabel}>
          <AppText align="center" color={stateStyle.statusTextColor} variant="caption">
            {step.status.toLocaleUpperCase('tr-TR')}
          </AppText>
          <AppText align="center" color={isCurrent ? 'primary' : 'secondary'} variant="labelM">
            {step.title}
          </AppText>
        </View>
      </View>

      {!isLast ? (
        <View importantForAccessibility="no-hide-descendants" style={styles.traceConnector}>
          {traceDots.map((dot) => (
            <View key={dot} style={styles.traceDot} />
          ))}
        </View>
      ) : null}
    </View>
  );
}

type PathStateStyle = {
  node: object;
  nodeTextColor: AppTextColor;
  shadow: object;
  statusTextColor: AppTextColor;
};

const styles = StyleSheet.create({
  callout: {
    alignItems: 'center',
    backgroundColor: theme.colors.action.primary,
    borderRadius: theme.radii.medium,
    marginBottom: theme.spacing.sm,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.sm,
    position: 'relative',
  },
  calloutTail: {
    backgroundColor: theme.colors.action.primary,
    borderRadius: 2,
    bottom: -4,
    height: 12,
    position: 'absolute',
    transform: [{ rotate: '45deg' }],
    width: 12,
  },
  nodeFace: {
    alignItems: 'center',
    borderRadius: theme.radii.pill,
    height: 64,
    justifyContent: 'center',
    width: 64,
  },
  nodeFaceCurrent: {
    borderColor: theme.colors.action.primarySoft,
    borderWidth: 4,
    height: 76,
    width: 76,
  },
  nodeFrame: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  nodeGroup: {
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
  nodeLabel: {
    alignItems: 'center',
    gap: 2,
    maxWidth: 200,
  },
  nodeShadow: {
    borderRadius: theme.radii.pill,
    bottom: -6,
    height: 64,
    position: 'absolute',
    width: 64,
  },
  nodeShadowCurrent: {
    height: 76,
    width: 76,
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
  traceConnector: {
    alignItems: 'center',
    gap: theme.spacing.sm,
    justifyContent: 'center',
    paddingVertical: theme.spacing.md,
  },
  traceDot: {
    backgroundColor: theme.colors.reward.trace,
    borderRadius: theme.radii.pill,
    height: 6,
    opacity: 0.55,
    width: 6,
  },
  trail: {
    alignItems: 'center',
  },
  trailRow: {
    alignItems: 'center',
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
  availableNode: {
    backgroundColor: theme.colors.subject.history.primary,
  },
  availableShadow: {
    backgroundColor: theme.colors.subject.history.dark,
  },
  checkpointNode: {
    backgroundColor: theme.colors.reward.highlight,
  },
  checkpointShadow: {
    backgroundColor: theme.colors.status.warning,
  },
  completeNode: {
    backgroundColor: theme.colors.status.success,
  },
  completeShadow: {
    backgroundColor: '#0F5A3A',
  },
  currentNode: {
    backgroundColor: theme.colors.action.primary,
  },
  currentShadow: {
    backgroundColor: theme.colors.action.primaryPressed,
  },
  lockedNode: {
    backgroundColor: theme.colors.background.subtle,
    borderColor: theme.colors.border.strong,
    borderWidth: 2,
  },
  lockedShadow: {
    backgroundColor: theme.colors.border.strong,
  },
});

const markerByState: Partial<Record<PathStepPreviewState, string>> = {
  checkpoint: 'ARA',
  complete: '✓',
  locked: '🔒',
};

const stateStyles: Record<PathStepPreviewState, PathStateStyle> = {
  available: {
    node: stateVisuals.availableNode,
    nodeTextColor: 'inverse',
    shadow: stateVisuals.availableShadow,
    statusTextColor: 'secondary',
  },
  checkpoint: {
    node: stateVisuals.checkpointNode,
    nodeTextColor: 'primary',
    shadow: stateVisuals.checkpointShadow,
    statusTextColor: 'warning',
  },
  complete: {
    node: stateVisuals.completeNode,
    nodeTextColor: 'inverse',
    shadow: stateVisuals.completeShadow,
    statusTextColor: 'success',
  },
  current: {
    node: stateVisuals.currentNode,
    nodeTextColor: 'inverse',
    shadow: stateVisuals.currentShadow,
    statusTextColor: 'accent',
  },
  locked: {
    node: stateVisuals.lockedNode,
    nodeTextColor: 'muted',
    shadow: stateVisuals.lockedShadow,
    statusTextColor: 'muted',
  },
};
