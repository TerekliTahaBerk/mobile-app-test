import { Fragment } from 'react';
import { StyleSheet, useWindowDimensions, View } from 'react-native';

import type { CurrentLevelPreview, HomePreviewViewModel, PathNode } from '@/modules/home/model/home-preview-data';
import { LevelDetailPanel } from '@/modules/home/ui/level-detail-panel';
import { CURRENT_RING_SIZE, NODE_SIZE, PathNodeButton } from '@/modules/home/ui/path-node';
import { AppText } from '@/shared/ui/components/app-text';
import { TactilePressable } from '@/shared/ui/components/tactile-pressable';
import { Cizgi } from '@/shared/ui/cizgi/cizgi';
import { theme } from '@/shared/ui/theme/tokens';

type LevelPathProps = {
  companion: HomePreviewViewModel['companion'];
  level: CurrentLevelPreview;
  nodes: readonly PathNode[];
  onSelectNode: (nodeId: string) => void;
  onStartLevel: () => void;
  selectedNodeId: string | null;
};

/**
 * The journey itself. Nodes weave left and right down the screen following the
 * design's rhythm; the offsets are a repeating pattern rather than absolute
 * coordinates so the path keeps working for any number of levels and any
 * phone width.
 */
const WEAVE = [2, 72, 104, 76, 12, -86] as const;
const COMPANION_WIDTH = 104;

export function LevelPath({
  companion,
  level,
  nodes,
  onSelectNode,
  onStartLevel,
  selectedNodeId,
}: LevelPathProps) {
  const { width } = useWindowDimensions();
  const scale = weaveScale(width);

  return (
    <View style={styles.path}>
      {nodes.map((node, index) => {
        const offset = Math.round((WEAVE[index % WEAVE.length] ?? 0) * scale);
        const isCurrent = node.state === 'current';
        const isSelected = selectedNodeId === node.id;

        return (
          <Fragment key={node.id}>
            <View style={styles.row}>
              {isCurrent ? (
                <Cizgi
                  accessibilityLabel={companion.accessibilityLabel}
                  ground
                  mood={companion.mood}
                  style={styles.companion}
                  width={COMPANION_WIDTH}
                />
              ) : null}

              <View style={[styles.nodeSlot, { transform: [{ translateX: offset }] }]}>
                {isCurrent && !isSelected ? (
                  <StartCallout onPress={() => onSelectNode(node.id)} title={node.title} />
                ) : null}
                <PathNodeButton node={node} onPress={() => onSelectNode(node.id)} />
              </View>
            </View>

            {isSelected ? <LevelDetailPanel level={level} onStart={onStartLevel} /> : null}
          </Fragment>
        );
      })}
    </View>
  );
}

type StartCalloutProps = {
  onPress: () => void;
  title: string;
};

/**
 * The nudge beside the current node. It repeats the node's own action, so it
 * is hidden from assistive technology to avoid announcing the level twice.
 */
function StartCallout({ onPress, title }: StartCalloutProps) {
  return (
    <TactilePressable
      accessibilityElementsHidden
      accessibilityLabel={`${title} dersine başla`}
      accessibilityRole="button"
      depth={0}
      depthColor="transparent"
      faceStyle={styles.calloutFace}
      importantForAccessibility="no-hide-descendants"
      onPress={onPress}
      radius={theme.radii.small + 1}
      style={styles.callout}
    >
      <AppText color="accent" variant="labelS">
        BAŞLA
      </AppText>
    </TactilePressable>
  );
}

/** Keeps the widest weave step on screen for narrow phones. */
function weaveScale(width: number) {
  const widest = Math.max(...WEAVE.map(Math.abs));
  const room = width / 2 - CURRENT_RING_SIZE / 2 - theme.spacing.sm;

  return Math.min(1, room / widest);
}

const styles = StyleSheet.create({
  callout: {
    // Numeric insets only: the slot is exactly one node wide, so pushing the
    // callout past the ring keeps it clear of the node on every screen size.
    position: 'absolute',
    right: NODE_SIZE + 22,
    top: 22,
    zIndex: 2,
  },
  calloutFace: {
    backgroundColor: theme.colors.surface.default,
    borderBottomWidth: theme.depth.cardBorder - 1,
    borderColor: theme.colors.action.primary,
    borderWidth: 2,
    paddingHorizontal: theme.spacing.md + 1,
    paddingVertical: theme.spacing.sm + 2,
  },
  companion: {
    left: theme.spacing.sm,
    position: 'absolute',
    top: -theme.spacing.xxl,
  },
  nodeSlot: {
    alignItems: 'center',
    position: 'relative',
    width: NODE_SIZE,
  },
  path: {
    alignItems: 'center',
    gap: theme.spacing.lg,
    paddingHorizontal: theme.spacing.lg,
  },
  row: {
    alignItems: 'center',
    alignSelf: 'stretch',
    justifyContent: 'center',
    position: 'relative',
  },
});
