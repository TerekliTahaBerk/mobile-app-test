import { StyleSheet, View } from 'react-native';

import type { PathNodeView, PathNodeState } from '@/modules/home/model/home-view-model';
import { AppText, type AppTextColor } from '@/shared/ui/components/app-text';
import { LockGlyph } from '@/shared/ui/components/glyphs';
import { Pulse } from '@/shared/ui/motion/motion';
import { TactilePressable } from '@/shared/ui/components/tactile-pressable';
import { theme } from '@/shared/ui/theme/tokens';

export const NODE_SIZE = 80;
export const CHECKPOINT_SIZE = 52;
export const CURRENT_RING_SIZE = 108;

type PathNodeButtonProps = {
  node: PathNodeView;
  onPress: () => void;
};

/**
 * One stop on the learning journey. The current node is deliberately the
 * loudest thing on the screen: it is larger, coral, and wears a ring.
 */
export function PathNodeButton({ node, onPress }: PathNodeButtonProps) {
  const visual = visuals[node.state];
  const isCurrent = node.state === 'current';
  // Preview levels keep the composition but open nothing — only a node backed
  // by real content has a lesson to start.
  const isOpenable = node.source === 'real' && node.lessonId !== undefined;
  const isLocked = node.state === 'locked' || !isOpenable;
  const size = node.state === 'checkpoint' ? CHECKPOINT_SIZE : NODE_SIZE;

  const face = (
    <TactilePressable
      accessibilityHint={
        isOpenable
          ? 'Bu dersin bilgilerini açar'
          : node.state === 'locked'
            ? undefined
            : 'Önizleme içeriği'
      }
      accessibilityLabel={`${node.title}. ${node.status}. ${node.detail}`}
      accessibilityRole="button"
      accessibilityState={{ disabled: isLocked }}
      depth={node.state === 'checkpoint' ? theme.depth.nodeSmall : theme.depth.node}
      depthColor={visual.depth}
      disabled={isLocked}
      faceStyle={[styles.face, { backgroundColor: visual.face, height: size, width: size }]}
      onPress={onPress}
      radius={theme.radii.pill}
      testID={`path-node-${node.id}`}
    >
      <NodeGlyph size={size} state={node.state} tint={visual.glyphColor} />
    </TactilePressable>
  );

  if (!isCurrent) {
    return face;
  }

  return (
    <View style={styles.ringFrame}>
      <Pulse style={styles.ringLayer}>
        <View importantForAccessibility="no-hide-descendants" style={styles.ring} />
      </Pulse>
      {face}
    </View>
  );
}

type NodeGlyphProps = {
  size: number;
  state: PathNodeState;
  tint: AppTextColor;
};

function NodeGlyph({ size, state, tint }: NodeGlyphProps) {
  if (state === 'locked') {
    return <LockGlyph size={26} />;
  }

  return (
    <AppText
      align="center"
      color={tint}
      style={{ fontSize: Math.round(size * 0.38), lineHeight: Math.round(size * 0.44) }}
      variant="labelL"
    >
      {markers[state]}
    </AppText>
  );
}

const markers: Record<PathNodeState, string> = {
  available: '›',
  checkpoint: '★',
  complete: '✓',
  current: '★',
  locked: '',
  review: '↺',
};

type NodeVisual = {
  depth: string;
  face: string;
  glyphColor: AppTextColor;
};

const visuals: Record<PathNodeState, NodeVisual> = {
  available: {
    depth: theme.colors.subject.history.depth,
    face: theme.colors.subject.history.soft,
    glyphColor: 'subjectHistory',
  },
  checkpoint: {
    depth: theme.colors.path.checkpointDepth,
    face: theme.colors.path.checkpointFace,
    glyphColor: 'checkpoint',
  },
  complete: {
    depth: theme.colors.subject.history.depth,
    face: theme.colors.subject.history.primary,
    glyphColor: 'inverse',
  },
  current: {
    depth: theme.colors.path.currentDepth,
    face: theme.colors.path.currentFace,
    glyphColor: 'inverse',
  },
  locked: {
    depth: theme.colors.path.lockedDepth,
    face: theme.colors.path.lockedFace,
    glyphColor: 'faint',
  },
  review: {
    depth: theme.colors.action.primaryDepth,
    face: theme.colors.action.primarySoft,
    glyphColor: 'accent',
  },
};

const styles = StyleSheet.create({
  face: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  ring: {
    borderColor: theme.colors.path.currentRing,
    borderRadius: theme.radii.pill,
    borderTopColor: theme.colors.path.currentFace,
    borderWidth: 6,
    height: CURRENT_RING_SIZE,
    width: CURRENT_RING_SIZE,
  },
  ringLayer: {
    position: 'absolute',
    top: -((CURRENT_RING_SIZE - NODE_SIZE) / 2),
  },
  ringFrame: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
});
