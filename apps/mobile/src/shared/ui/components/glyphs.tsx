import { StyleSheet, View } from 'react-native';

import { theme } from '@/shared/ui/theme/tokens';

type GlyphProps = {
  color?: string | undefined;
  size?: number | undefined;
};

/**
 * The design's icon set is tiny and geometric, so it is drawn with plain views
 * rather than pulling in an icon font or an SVG runtime. Every glyph here is
 * decorative; the control that owns it carries the accessible label.
 */

export function CloseGlyph({ color = theme.colors.text.faint, size = 20 }: GlyphProps) {
  const bar = { backgroundColor: color, borderRadius: theme.radii.xs, height: 4, width: size };

  return (
    <View style={[styles.box, { height: size, width: size }]}>
      <View style={[styles.centeredBar, bar, { transform: [{ rotate: '45deg' }] }]} />
      <View style={[styles.centeredBar, bar, { transform: [{ rotate: '-45deg' }] }]} />
    </View>
  );
}

export function BackGlyph({ color = theme.colors.text.faint, size = 15 }: GlyphProps) {
  return (
    <View
      style={{
        borderBottomWidth: 3,
        borderColor: color,
        borderLeftWidth: 3,
        borderRadius: 2,
        height: size,
        transform: [{ rotate: '45deg' }],
        width: size,
      }}
    />
  );
}

export function HeartGlyph({ color = theme.colors.reward.heart, size = 18 }: GlyphProps) {
  const lobe = size * 0.6;

  return (
    <View style={{ height: size * 0.9, width: size }}>
      <View
        style={[styles.pinned, { backgroundColor: color, borderRadius: lobe, height: lobe, left: 0, top: 0, width: lobe }]}
      />
      <View
        style={[styles.pinned, { backgroundColor: color, borderRadius: lobe, height: lobe, right: 0, top: 0, width: lobe }]}
      />
      <View
        style={[
          styles.pinned,
          {
            backgroundColor: color,
            borderBottomLeftRadius: size * 0.45,
            borderBottomRightRadius: size * 0.45,
            height: size * 0.72,
            left: size * 0.11,
            top: size * 0.26,
            width: size * 0.78,
          },
        ]}
      />
    </View>
  );
}

export function GemGlyph({ color = theme.colors.reward.gem, size = 16 }: GlyphProps) {
  return (
    <View
      style={{
        backgroundColor: color,
        borderRadius: 4,
        height: size,
        transform: [{ rotate: '45deg' }],
        width: size,
      }}
    />
  );
}

export function LockGlyph({ color = theme.colors.path.lockedGlyph, size = 27 }: GlyphProps) {
  const bodyWidth = size * 0.89;

  return (
    <View style={{ height: size, width: bodyWidth }}>
      <View
        style={[
          styles.pinned,
          {
            backgroundColor: color,
            borderRadius: 6,
            bottom: 0,
            height: size * 0.63,
            width: bodyWidth,
          },
        ]}
      />
      <View
        style={[
          styles.pinned,
          {
            borderColor: color,
            borderTopLeftRadius: 9,
            borderTopRightRadius: 9,
            borderTopWidth: 4,
            borderLeftWidth: 4,
            borderRightWidth: 4,
            height: size * 0.48,
            left: bodyWidth * 0.21,
            top: 0,
            width: bodyWidth * 0.58,
          },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  centeredBar: {
    position: 'absolute',
  },
  pinned: {
    position: 'absolute',
  },
});
