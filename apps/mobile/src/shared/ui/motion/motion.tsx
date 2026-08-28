import { type ReactNode, useEffect, useState } from 'react';
import {
  Animated,
  Easing,
  type StyleProp,
  type ViewProps,
  type ViewStyle,
} from 'react-native';

import { useReducedMotion } from '@/shared/ui/motion/use-reduced-motion';

/**
 * The design's four motions, built on React Native's built-in `Animated`.
 * No animation dependency is added, every loop runs on the native driver, and
 * each one collapses to a static frame under Reduce Motion.
 */

type MotionProps = {
  children: ReactNode;
  onLayout?: ViewProps['onLayout'];
  style?: StyleProp<ViewStyle>;
  testID?: string | undefined;
};

type LoopProps = MotionProps & {
  /** Full cycle duration in milliseconds. */
  duration?: number;
};

/** A slow vertical float, used under Dino. */
export function Bob({ children, duration = 3600, style }: LoopProps) {
  const reduced = useReducedMotion();
  // A lazy state initializer keeps one stable Animated.Value per mount without
  // reading a ref during render.
  const [progress] = useState(() => new Animated.Value(0));

  useEffect(() => {
    if (reduced) {
      progress.setValue(0);
      return;
    }

    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(progress, {
          duration: duration / 2,
          easing: Easing.inOut(Easing.ease),
          toValue: 1,
          useNativeDriver: true,
        }),
        Animated.timing(progress, {
          duration: duration / 2,
          easing: Easing.inOut(Easing.ease),
          toValue: 0,
          useNativeDriver: true,
        }),
      ]),
    );
    loop.start();

    return () => loop.stop();
  }, [duration, progress, reduced]);

  const translateY = progress.interpolate({ inputRange: [0, 1], outputRange: [0, -6] });

  return <Animated.View style={[style, { transform: [{ translateY }] }]}>{children}</Animated.View>;
}

/** The breathing ring around the current path node. */
export function Pulse({ children, duration = 2400, style }: LoopProps) {
  const reduced = useReducedMotion();
  const [progress] = useState(() => new Animated.Value(0));

  useEffect(() => {
    if (reduced) {
      progress.setValue(0);
      return;
    }

    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(progress, {
          duration: duration / 2,
          easing: Easing.inOut(Easing.ease),
          toValue: 1,
          useNativeDriver: true,
        }),
        Animated.timing(progress, {
          duration: duration / 2,
          easing: Easing.inOut(Easing.ease),
          toValue: 0,
          useNativeDriver: true,
        }),
      ]),
    );
    loop.start();

    return () => loop.stop();
  }, [duration, progress, reduced]);

  const scale = progress.interpolate({ inputRange: [0, 1], outputRange: [1, 1.05] });

  return <Animated.View style={[style, { transform: [{ scale }] }]}>{children}</Animated.View>;
}

/** The entrance for callouts, sheets and reward panels. */
export function Pop({ children, duration = 220, onLayout, style, testID }: LoopProps) {
  const reduced = useReducedMotion();
  const [progress] = useState(() => new Animated.Value(0));

  useEffect(() => {
    if (reduced) {
      progress.setValue(1);
      return;
    }

    progress.setValue(0);
    const animation = Animated.timing(progress, {
      duration,
      easing: Easing.out(Easing.cubic),
      toValue: 1,
      useNativeDriver: true,
    });
    animation.start();

    return () => animation.stop();
  }, [duration, progress, reduced]);

  const scale = progress.interpolate({ inputRange: [0, 1], outputRange: [0.9, 1] });

  return (
    <Animated.View
      onLayout={onLayout}
      style={[style, { opacity: progress, transform: [{ scale }] }]}
      testID={testID}
    >
      {children}
    </Animated.View>
  );
}

type ShakeProps = MotionProps & {
  /** Increment this to replay the shake. */
  trigger: number;
};

/** The refusal when a match does not land. */
export function Shake({ children, style, trigger }: ShakeProps) {
  const reduced = useReducedMotion();
  const [offset] = useState(() => new Animated.Value(0));

  useEffect(() => {
    if (trigger === 0 || reduced) {
      return;
    }

    const step = (toValue: number) =>
      Animated.timing(offset, {
        duration: 100,
        easing: Easing.linear,
        toValue,
        useNativeDriver: true,
      });

    const animation = Animated.sequence([step(-5), step(5), step(-5), step(0)]);
    animation.start();

    return () => animation.stop();
  }, [offset, reduced, trigger]);

  return (
    <Animated.View style={[style, { transform: [{ translateX: offset }] }]}>
      {children}
    </Animated.View>
  );
}
