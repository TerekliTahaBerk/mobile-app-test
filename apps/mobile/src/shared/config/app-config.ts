/**
 * Build-mode configuration.
 *
 * The app carries approved screens for features that do not work yet: the
 * league preview ranks invented people, Premium shows benefits with no billing behind
 * them, and the hearts limit has no way for a learner to lift it. All three
 * stay in the codebase and stay reachable while designing, but their fictional
 * or unusable behaviour may not reach a pilot build. Lig itself remains a
 * stable destination with an honest pending state; only its preview standings
 * are gated.
 *
 * This is deliberately a compile-time constant rather than a flag service.
 * Remote configuration is a later milestone.
 */

export type AppMode = 'designPreview' | 'productionPilot';

export type FeatureFlags = {
  /** Hearts economy. Studying is never blocked in the pilot. */
  heartsEconomy: boolean;
  /** Weekly league standings. Needs a real leaderboard service. */
  league: boolean;
  /** Premium. Needs real in-app purchases. */
  plus: boolean;
};

const FLAGS_BY_MODE: Record<AppMode, FeatureFlags> = {
  designPreview: {
    heartsEconomy: true,
    league: true,
    plus: true,
  },
  productionPilot: {
    heartsEconomy: false,
    league: false,
    plus: false,
  },
};

/**
 * Development builds run in design-preview mode so the approved screens stay
 * reviewable. Anything else — including every release build — is a production
 * pilot.
 */
const requestedMode = process.env.EXPO_PUBLIC_APP_MODE;
export const APP_MODE: AppMode =
  requestedMode === 'productionPilot' || requestedMode === 'designPreview'
    ? requestedMode
    : __DEV__
      ? 'designPreview'
      : 'productionPilot';

export const FEATURES: FeatureFlags = FLAGS_BY_MODE[APP_MODE];
export const APP_CONFIG = Object.freeze({ features: FEATURES, mode: APP_MODE });

/** Test seam: resolve flags for a named mode without touching `__DEV__`. */
export function featuresForMode(mode: AppMode): FeatureFlags {
  return FLAGS_BY_MODE[mode];
}
