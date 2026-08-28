import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

import type { PathStepView } from '@/modules/learn/model/unit-path-view-model';
import { AppText } from '@/shared/ui/components/app-text';
import { BlankIcon, CheckIcon, LockIcon, PlayIcon, StarIcon } from '@/shared/ui/components/icons';
import { TactilePressable } from '@/shared/ui/components/tactile-pressable';
import { Pulse } from '@/shared/ui/motion/motion';
import type { SubjectTheme } from '@/shared/ui/theme/subject-theme';
import { theme } from '@/shared/ui/theme/tokens';

export const NODE_ROW_HEIGHT = 100;
export const NODE_COLUMN_WIDTH = 104;

const RESTING_SIZE = 64;
const CURRENT_SIZE = 72;

type PathNodeProps = {
  onPress: (step: PathStepView) => void;
  step: PathStepView;
  subjectTheme: SubjectTheme;
};

/**
 * One stop on the path: a raised rounded-square face with a solid edge beneath
 * it, and its title beside it. The current node is larger, carries the brand
 * colour rather than the subject's, and is the only one that pulses — the
 * screen has exactly one obvious place to press.
 */
export function PathNode({ onPress, step, subjectTheme: tone }: PathNodeProps) {
  const isCurrent = step.status === 'current';
  const isLocked = step.status === 'locked';
  const size = isCurrent ? CURRENT_SIZE : RESTING_SIZE;

  const face = (
    <View
      style={[
        styles.face,
        { borderRadius: isCurrent ? theme.radii.node : theme.radii.xlarge, height: size, width: size },
        faceStyleFor(step, tone),
      ]}
    >
      <NodeGlyph step={step} subjectTheme={tone} />
    </View>
  );

  return (
    <View style={styles.row}>
      <View style={styles.column}>
        {isLocked ? (
          <View accessibilityLabel={`${step.title}, kilitli`} accessibilityRole="image">
            {face}
          </View>
        ) : (
          <MaybePulse active={isCurrent}>
            <TactilePressable
              accessibilityLabel={`${step.title}. ${step.detail}`}
              accessibilityRole="button"
              depth={isCurrent ? theme.depth.nodeCurrent : theme.depth.node}
              depthColor={isCurrent ? theme.colors.path.currentDepth : depthFor(step, tone)}
              onPress={() => onPress(step)}
              radius={isCurrent ? theme.radii.node : theme.radii.xlarge}
              testID={`path-node-${step.id}`}
            >
              {face}
            </TactilePressable>
          </MaybePulse>
        )}
      </View>

      <View style={styles.label}>
        <View style={styles.titleRow}>
          <AppText
            style={isLocked ? styles.lockedTitle : { color: isCurrent ? theme.colors.status.successInk : tone.deep }}
            variant={isCurrent ? 'headingXS' : 'bodyM'}
          >
            {step.title}
          </AppText>
          {isCurrent ? (
            <View style={styles.startPill}>
              <AppText color="inverse" variant="eyebrow">
                BAŞLA
              </AppText>
            </View>
          ) : null}
        </View>
        <AppText
          style={[styles.detail, isLocked ? styles.lockedDetail : { color: tone.ink }]}
          variant="proseXS"
        >
          {step.detail}
        </AppText>
      </View>
    </View>
  );
}

/** Only the current node breathes; the rest stay still. */
function MaybePulse({ active, children }: { active: boolean; children: ReactNode }) {
  return active ? <Pulse>{children}</Pulse> : <>{children}</>;
}

function NodeGlyph({ step, subjectTheme: tone }: { step: PathStepView; subjectTheme: SubjectTheme }) {
  if (step.status === 'locked') {
    return <LockIcon color={theme.colors.path.lockedGlyph} />;
  }

  if (step.status === 'completed') {
    return step.kind === 'checkpoint' ? (
      <StarIcon color={theme.colors.text.inverse} size={28} />
    ) : (
      <CheckIcon size={28} strokeWidth={2.8} />
    );
  }

  if (step.kind === 'checkpoint') {
    return <StarIcon size={27} />;
  }

  if (step.status === 'current') {
    return step.kind === 'practice' ? (
      <CheckIcon size={28} strokeWidth={2.6} />
    ) : (
      <PlayIcon size={30} />
    );
  }

  return <BlankIcon color={tone.primary} />;
}

function faceStyleFor(step: PathStepView, tone: SubjectTheme) {
  switch (step.status) {
    case 'completed':
      return { backgroundColor: tone.primary };
    case 'current':
      return {
        backgroundColor: theme.colors.action.primary,
        borderColor: theme.colors.path.currentRing,
        borderWidth: 0,
      };
    case 'available':
      return {
        backgroundColor: theme.colors.surface.default,
        borderColor: theme.colors.path.checkpointBorder,
        borderWidth: 2,
      };
    case 'locked':
      return {
        backgroundColor: theme.colors.path.lockedFace,
        borderColor: theme.colors.path.lockedBorder,
        borderStyle: 'dashed' as const,
        borderWidth: 2,
      };
  }
}

function depthFor(step: PathStepView, tone: SubjectTheme): string {
  return step.status === 'completed' ? tone.depth : theme.colors.path.checkpointDepth;
}

const styles = StyleSheet.create({
  column: {
    alignItems: 'center',
    flexBasis: NODE_COLUMN_WIDTH,
    flexGrow: 0,
    flexShrink: 0,
  },
  detail: {
    marginTop: 3,
  },
  face: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    flex: 1,
    paddingRight: theme.spacing.sm,
  },
  lockedDetail: {
    color: theme.colors.path.lockedFaint,
  },
  lockedTitle: {
    color: theme.colors.path.lockedInk,
  },
  row: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: theme.spacing.lg,
    height: NODE_ROW_HEIGHT,
  },
  startPill: {
    backgroundColor: theme.colors.action.primary,
    borderRadius: theme.radii.pill,
    paddingHorizontal: theme.spacing.sm + 2,
    paddingVertical: theme.spacing.xs,
  },
  titleRow: {
    alignItems: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
  },
});
