/**
 * Build-mode configuration.
 *
 * The app carries approved screens for features that do not work yet: the
 * league ranks invented people, and TEKRARLA Plus shows prices with no billing
 * behind them. Both stay in the codebase and stay reachable while designing,
 * but neither may reach a pilot build — advertising a purchase that cannot be
 * made, or a ranking that is fiction, is not something a release should do.
 *
 * This is deliberately a compile-time constant rather than a flag service.
 * Remote configuration is Milestone 8.
 */

export type AppMode = 'designPreview' | 'productionPilot';

export type FeatureFlags = {
  /** Weekly league standings. Needs a real leaderboard service. */
  league: boolean;
  /** TEKRARLA Plus. Needs real in-app purchases. */
  plus: boolean;
};

const FLAGS_BY_MODE: Record<AppMode, FeatureFlags> = {
  designPreview: { league: true, plus: true },
  productionPilot: { league: false, plus: false },
};

/**
 * Development builds run in design-preview mode so the approved screens stay
 * reviewable. Anything else — including every release build — is a production
 * pilot.
 */
export const APP_MODE: AppMode = __DEV__ ? 'designPreview' : 'productionPilot';

export const FEATURES: FeatureFlags = FLAGS_BY_MODE[APP_MODE];

/** Test seam: resolve flags for a named mode without touching `__DEV__`. */
export function featuresForMode(mode: AppMode): FeatureFlags {
  return FLAGS_BY_MODE[mode];
}
