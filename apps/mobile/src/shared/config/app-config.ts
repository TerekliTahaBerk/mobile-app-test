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
  /** Fictional gem balance. Hidden until an economy exists. */
  gemsEconomy: boolean;
  /** Attempts/hearts economy. Studying is never blocked in the pilot. */
  heartsEconomy: boolean;
  /** Weekly league standings. Needs a real leaderboard service. */
  league: boolean;
  /** TEKRARLA Plus. Needs real in-app purchases. */
  plus: boolean;
  /** Presentation-only quest board. */
  quests: boolean;
};

const FLAGS_BY_MODE: Record<AppMode, FeatureFlags> = {
  designPreview: {
    gemsEconomy: true,
    heartsEconomy: true,
    league: true,
    plus: true,
    quests: true,
  },
  productionPilot: {
    gemsEconomy: false,
    heartsEconomy: false,
    league: false,
    plus: false,
    quests: false,
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

/** Test seam: resolve flags for a named mode without touching `__DEV__`. */
export function featuresForMode(mode: AppMode): FeatureFlags {
  return FLAGS_BY_MODE[mode];
}
