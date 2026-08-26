import type { ImageSourcePropType } from 'react-native';

/**
 * The ÇİZGİ poses used by the approved design. Adding a mood means adding the
 * asset and one registry entry — screens never call `require` directly.
 *
 * This is an asset registry, not a mascot state engine: which mood a screen
 * shows is a presentation decision made by that screen.
 */
export type CizgiMood =
  | 'cheer'
  | 'excited'
  | 'happy'
  | 'idle'
  | 'pose'
  | 'proud'
  | 'sad'
  | 'thinking'
  | 'wave';

export const cizgiAssets: Record<CizgiMood, ImageSourcePropType> = {
  cheer: require('@/assets/cizgi/cizgi-cheer.png'),
  excited: require('@/assets/cizgi/cizgi-excited.png'),
  happy: require('@/assets/cizgi/cizgi-happy.png'),
  idle: require('@/assets/cizgi/cizgi-idle.png'),
  pose: require('@/assets/cizgi/cizgi-pose.png'),
  proud: require('@/assets/cizgi/cizgi-proud.png'),
  sad: require('@/assets/cizgi/cizgi-sad.png'),
  thinking: require('@/assets/cizgi/cizgi-thinking.png'),
  wave: require('@/assets/cizgi/cizgi-wave.png'),
};

/**
 * Source aspect ratios (width / height) so a caller can size ÇİZGİ by width
 * and let height follow, the way the design does.
 */
export const cizgiAspectRatios: Record<CizgiMood, number> = {
  cheer: 300 / 452,
  excited: 292 / 394,
  happy: 256 / 390,
  idle: 328 / 414,
  pose: 276 / 406,
  proud: 294 / 386,
  sad: 260 / 392,
  thinking: 336 / 472,
  wave: 318 / 394,
};
