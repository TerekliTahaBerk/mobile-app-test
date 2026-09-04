/**
 * Build-mode configuration.
 *
 * The app carries approved screens for features that do not work yet: the
 * league preview ranks invented people, Premium shows benefits with no billing behind
 * them, and the hearts limit has no way for a learner to lift it. All three
 * stay in the codebase and stay reachable while designing, but their fictional
 * or unusable behaviour may not reach a pilot build. Unsupported product
 * choices and destinations are absent in production rather than advertised as
 * pending.
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
  /** LGS product path. The pilot only supports YKS -> TYT Sosyal. */
  lgs: boolean;
  /** Premium. Needs real in-app purchases. */
  plus: boolean;
};

const FLAGS_BY_MODE: Record<AppMode, FeatureFlags> = {
  designPreview: {
    heartsEconomy: true,
    league: true,
    lgs: true,
    plus: true,
  },
  productionPilot: {
    heartsEconomy: false,
    league: false,
    lgs: false,
    plus: false,
  },
};

/**
 * Development builds run in design-preview mode so the approved screens stay
 * reviewable. Anything else — including every release build — is a production
 * pilot. Explicit invalid configuration fails while the module is loading so a
 * release cannot start with preview-only product behaviour.
 */
export function resolveAppMode(requestedMode: string | undefined, isDev: boolean): AppMode {
  if (requestedMode === undefined || requestedMode === '') {
    return isDev ? 'designPreview' : 'productionPilot';
  }

  if (requestedMode === 'productionPilot') {
    return requestedMode;
  }

  if (requestedMode === 'designPreview') {
    if (!isDev) {
      throw new Error(
        'Invalid app configuration: designPreview is only available when __DEV__ is true.',
      );
    }

    return requestedMode;
  }

  throw new Error(`Invalid EXPO_PUBLIC_APP_MODE: ${requestedMode}.`);
}

export const APP_MODE = resolveAppMode(process.env.EXPO_PUBLIC_APP_MODE, __DEV__);

export const FEATURES: FeatureFlags = FLAGS_BY_MODE[APP_MODE];
export const APP_CONFIG = Object.freeze({ features: FEATURES, mode: APP_MODE });

/** Test seam: resolve flags for a named mode without touching `__DEV__`. */
export function featuresForMode(mode: AppMode): FeatureFlags {
  return FLAGS_BY_MODE[mode];
}
