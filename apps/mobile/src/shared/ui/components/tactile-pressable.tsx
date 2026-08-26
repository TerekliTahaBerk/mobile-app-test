import { type ReactNode, useState } from 'react';
import {
  Pressable,
  StyleSheet,
  View,
  type PressableProps,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

import { theme } from '@/shared/ui/theme/tokens';

type TactilePressableProps = Omit<PressableProps, 'children' | 'style'> & {
  children: ReactNode;
  /** Structural depth under the face, in points. */
  depth?: number;
  depthColor: string;
  faceStyle?: StyleProp<ViewStyle>;
  radius?: number;
  style?: StyleProp<ViewStyle>;
};

/**
 * The shared physical control of the TEKRARLA design: a raised face sitting on
 * a solid structural shadow. Pressing compresses the face onto the shadow.
 * Depth is drawn with plain views so no animation dependency is required.
 */
export function TactilePressable({
  children,
  depth = theme.depth.button,
  depthColor,
  disabled = false,
  faceStyle,
  onPressIn,
  onPressOut,
  radius = theme.radii.medium,
  style,
  testID,
  ...pressableProps
}: TactilePressableProps) {
  const [isPressed, setIsPressed] = useState(false);
  const isDisabled = disabled === true;
  const showPressed = isPressed && !isDisabled;

  return (
    <Pressable
      disabled={isDisabled}
      onPressIn={(event) => {
        setIsPressed(true);
        onPressIn?.(event);
      }}
      onPressOut={(event) => {
        setIsPressed(false);
        onPressOut?.(event);
      }}
      style={[{ paddingBottom: depth }, style]}
      testID={testID}
      {...pressableProps}
    >
      <View style={styles.frame}>
        <View
          style={[
            styles.depth,
            { backgroundColor: depthColor, borderRadius: radius, bottom: -depth },
          ]}
        />
        <View
          style={[
            { borderRadius: radius },
            faceStyle,
            showPressed && { transform: [{ translateY: depth }] },
          ]}
          testID={testID ? `${testID}-face` : undefined}
        >
          {children}
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  depth: {
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
  },
  frame: {
    position: 'relative',
  },
});
