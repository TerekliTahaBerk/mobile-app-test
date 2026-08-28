import { StyleSheet, View } from 'react-native';

import { NODE_COLUMN_WIDTH, NODE_ROW_HEIGHT } from '@/modules/learn/ui/path-node';
import type { SubjectTheme } from '@/shared/ui/theme/subject-theme';
import { theme } from '@/shared/ui/theme/tokens';

const DASH_HEIGHT = 4;
const DASH_GAP = 7;
const TRACK_WIDTH = 4;

type PathTrackProps = {
  /** Nodes already completed; the solid part of the line stops after them. */
  completedCount: number;
  subjectTheme: SubjectTheme;
  totalCount: number;
};

/**
 * The line threading the path together. It runs from the centre of the first
 * node to the centre of the last, solid where the learner has already been and
 * dashed where they have not.
 *
 * It is drawn behind the nodes and marked as decorative: the same progress is
 * already stated by each node's own label, so nothing here is the only way to
 * read the screen.
 */
export function PathTrack({ completedCount, subjectTheme: tone, totalCount }: PathTrackProps) {
  if (totalCount < 2) {
    return null;
  }

  const half = NODE_ROW_HEIGHT / 2;
  const fullHeight = (totalCount - 1) * NODE_ROW_HEIGHT;
  // The solid run ends at the centre of the last completed node.
  const solidHeight = Math.min(fullHeight, Math.max(0, completedCount - 1) * NODE_ROW_HEIGHT);
  const dashCount = Math.max(0, Math.floor((fullHeight - solidHeight) / (DASH_HEIGHT + DASH_GAP)));

  return (
    <View
      importantForAccessibility="no-hide-descendants"
      pointerEvents="none"
      style={[styles.container, { height: fullHeight, top: half }]}
    >
      {solidHeight > 0 ? (
        <View style={[styles.solid, { backgroundColor: tone.primary, height: solidHeight }]} />
      ) : null}
      <View style={[styles.dashes, { top: solidHeight }]}>
        {Array.from({ length: dashCount }, (_unused, index) => (
          <View
            key={index}
            style={[styles.dash, { backgroundColor: theme.colors.path.trackPending }]}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    left: 0,
    position: 'absolute',
    width: NODE_COLUMN_WIDTH,
  },
  dash: {
    borderRadius: theme.radii.pill,
    height: DASH_HEIGHT,
    width: TRACK_WIDTH,
  },
  dashes: {
    alignItems: 'center',
    bottom: 0,
    gap: DASH_GAP,
    left: 0,
    position: 'absolute',
    right: 0,
  },
  solid: {
    borderRadius: theme.radii.pill,
    width: TRACK_WIDTH,
    zIndex: 1,
  },
});
