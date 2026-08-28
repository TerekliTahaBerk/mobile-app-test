import type { TextStyle, ViewStyle } from 'react-native';

/**
 * Raw palette imported from the approved Claude Design project
 * "Online Dershanem Oyun v2" (game-loop pass). Components never read this
 * object; they consume the semantic roles below.
 */
const palette = {
  brand: '#14976B',
  brandDeep: '#0C4A38',
  brandDeepest: '#0A3A2C',
  brandSoft: '#EDF7F2',
  brandMint: '#8FD3B8',
  brandTint: '#E9F2EE',
  brandBorder: '#C9E5D8',
  brandInkSoft: '#3C6B5A',

  ink: '#14201C',
  inkMuted: '#5C6B65',
  inkFaint: '#98A5A0',
  inkGhost: '#B4BEBA',

  white: '#FFFFFF',
  canvas: '#FBFCFA',
  recessed: '#F4F6F3',
  recessedSoft: '#F8FAF8',
  border: '#E7EBE8',
  hairline: '#F0F3F0',
  borderMuted: '#DDE3DF',
  borderDashed: '#C9D5CF',

  streak: '#E08A1E',
  streakInk: '#8A5A12',
  streakSoft: '#FFF4E6',
  streakSurface: '#FFE7C4',
  streakDim: '#E0B878',

  heart: '#D9556B',
  heartInk: '#A63A4E',
  heartSoft: '#FDEDEF',
  heartBorder: '#F3C3CC',
  heartFaint: '#E0B6BE',
  heartDeep: '#7A2C3D',
  heartDeepest: '#5C2733',

  gold: '#E0A93E',
  goldSoft: '#F0C48A',
  premiumCanvas: '#FDF9F2',

  history: '#B4762A',
  historyDepth: '#8A5A12',
  historyInk: '#8A6528',
  historyDeep: '#5C4213',
  historySoft: '#FBF1E4',
  historyBorder: '#EFD9BC',
  historyTrack: '#E9DCC4',
  historyLockFace: '#F6EFE2',
  historyLockBorder: '#DCC9A8',
  historyLockInk: '#B49B72',
  historyLockFaint: '#C2AE8E',
  historyTint: '#F4F1EA',

  physics: '#4A6FA5',
  physicsInk: '#3D5A87',
  physicsDeep: '#2E4667',
  physicsSoft: '#EAF0F5',
  physicsBorder: '#D8E2EC',

  chemistry: '#7A5AA8',
  chemistryInk: '#5B4382',
  chemistryDeep: '#4D3970',
  chemistrySoft: '#F1EDF7',
  chemistryBorder: '#E2DAEE',

  biology: '#6E9B3A',
  biologyInk: '#4E6E2A',
  biologyDeep: '#456223',
  biologySoft: '#EEF4E6',
  biologyBorder: '#DEE9D0',

  geography: '#2E8A8A',
  geographyInk: '#256E6E',
  geographyDeep: '#1F6363',
  geographySoft: '#E6F1F1',
  geographyBorder: '#D3E6E6',
} as const;

const colors = {
  background: {
    /** Tab shells and list surfaces. */
    app: palette.canvas,
    /** Exercise and path screens, which run on pure white. */
    lesson: palette.white,
    /** The dark flashcard stage. */
    flashcard: palette.brandDeep,
    /** The full-bleed celebration stage. */
    celebration: palette.brand,
    /** The amber streak-milestone stage. */
    streak: palette.streakSoft,
    /** The paywall backdrop behind the premium sheet. */
    premium: palette.premiumCanvas,
    subtle: palette.recessed,
    scrim: 'rgba(12, 32, 28, 0.42)',
  },
  surface: {
    default: palette.white,
    soft: palette.brandSoft,
    recessed: palette.recessed,
    recessedSoft: palette.recessedSoft,
    sheet: palette.white,
    onDark: 'rgba(255, 255, 255, 0.13)',
    onDarkStrong: 'rgba(255, 255, 255, 0.18)',
  },
  text: {
    primary: palette.ink,
    body: palette.ink,
    secondary: palette.inkMuted,
    muted: palette.inkFaint,
    faint: palette.inkGhost,
    eyebrow: palette.inkFaint,
    inverse: palette.white,
    onDark: 'rgba(255, 255, 255, 0.72)',
    onDarkFaint: 'rgba(255, 255, 255, 0.6)',
    accent: palette.brand,
    accentStrong: palette.brandDeep,
    accentSoft: palette.brandInkSoft,
    disabled: palette.inkGhost,
  },
  border: {
    hairline: palette.hairline,
    subtle: palette.border,
    strong: palette.borderMuted,
    dashed: palette.borderDashed,
    accent: palette.brand,
    onDark: 'rgba(255, 255, 255, 0.35)',
  },
  action: {
    primary: palette.brand,
    primaryDepth: palette.brandDeep,
    primarySoft: palette.brandSoft,
    primaryTint: palette.brandTint,
    danger: palette.heart,
    dangerDepth: palette.heartInk,
    neutral: palette.white,
    neutralDepth: palette.border,
    inverse: palette.white,
    inverseDepth: 'rgba(0, 0, 0, 0.16)',
    disabled: palette.brandSoft,
    disabledDepth: palette.border,
    ghost: 'transparent',
    onPrimary: palette.white,
    onDisabled: palette.inkFaint,
  },
  progress: {
    track: palette.brandSoft,
    fill: palette.brand,
    /** The lighter segment showing what this session just added. */
    gain: palette.brandMint,
    trackOnDark: 'rgba(255, 255, 255, 0.16)',
    fillOnDark: palette.brandMint,
  },
  status: {
    success: palette.brand,
    successSoft: palette.brandSoft,
    successBorder: palette.brandBorder,
    successInk: palette.brandDeep,
    danger: palette.heart,
    dangerBorder: palette.heartBorder,
    dangerSoft: palette.heartSoft,
    dangerInk: palette.heartInk,
    dangerDeep: palette.heartDeep,
    dangerDeepest: palette.heartDeepest,
  },
  reward: {
    xp: palette.brand,
    xpInk: palette.brandDeep,
    xpSoft: palette.brandSoft,
    streak: palette.streak,
    streakInk: palette.streakInk,
    streakSoft: palette.streakSoft,
    streakSurface: palette.streakSurface,
    streakDim: palette.streakDim,
    heart: palette.heart,
    heartInk: palette.heartInk,
    heartSoft: palette.heartSoft,
    heartBorder: palette.heartBorder,
    heartFaint: palette.heartFaint,
    badge: palette.gold,
    badgeSoft: palette.goldSoft,
  },
  navigation: {
    surface: palette.white,
    hairline: palette.border,
    active: palette.brand,
    inactive: palette.inkFaint,
  },
  /** The vertical unit path. Node colours are taken from the active subject. */
  path: {
    trackDone: palette.history,
    trackPending: palette.historyTrack,
    lockedFace: palette.historyLockFace,
    lockedBorder: palette.historyLockBorder,
    lockedGlyph: palette.historyLockInk,
    lockedInk: palette.historyLockInk,
    lockedFaint: palette.historyLockFaint,
    currentFace: palette.brand,
    currentDepth: palette.brandDeep,
    currentRing: 'rgba(20, 151, 107, 0.16)',
    checkpointFace: palette.white,
    checkpointBorder: palette.historyBorder,
    checkpointDepth: '#EFE2CE',
    checkpointGlyph: palette.gold,
  },
  subject: {
    history: {
      primary: palette.history,
      depth: palette.historyDepth,
      ink: palette.historyInk,
      deep: palette.historyDeep,
      soft: palette.historySoft,
      border: palette.historyBorder,
    },
    math: {
      primary: palette.brand,
      depth: palette.brandDeep,
      ink: palette.brandDeep,
      deep: palette.brandDeep,
      soft: palette.brandTint,
      border: '#D5E7DF',
    },
    turkish: {
      primary: palette.brand,
      depth: palette.brandDeep,
      ink: palette.brandDeep,
      deep: palette.brandDeep,
      soft: palette.brandTint,
      border: '#D5E7DF',
    },
    physics: {
      primary: palette.physics,
      depth: palette.physicsDeep,
      ink: palette.physicsInk,
      deep: palette.physicsDeep,
      soft: palette.physicsSoft,
      border: palette.physicsBorder,
    },
    chemistry: {
      primary: palette.chemistry,
      depth: palette.chemistryDeep,
      ink: palette.chemistryInk,
      deep: palette.chemistryDeep,
      soft: palette.chemistrySoft,
      border: palette.chemistryBorder,
    },
    biology: {
      primary: palette.biology,
      depth: palette.biologyDeep,
      ink: palette.biologyInk,
      deep: palette.biologyDeep,
      soft: palette.biologySoft,
      border: palette.biologyBorder,
    },
    geography: {
      primary: palette.geography,
      depth: palette.geographyDeep,
      ink: palette.geographyInk,
      deep: palette.geographyDeep,
      soft: palette.geographySoft,
      border: palette.geographyBorder,
    },
    philosophy: {
      primary: palette.chemistry,
      depth: palette.chemistryDeep,
      ink: palette.chemistryInk,
      deep: palette.chemistryDeep,
      soft: palette.chemistrySoft,
      border: palette.chemistryBorder,
    },
  },
} as const;

export type SubjectKey = keyof typeof colors.subject;

/**
 * Type roles mirror the design's `font:` shorthands. Everything renders in
 * Manrope except `mono`, which is the JetBrains Mono micro-label used for
 * counters and XP figures.
 */
export const typography = {
  /** The 58px streak count. */
  display: { fontSize: 58, fontWeight: '800', letterSpacing: -1.7, lineHeight: 64 },
  headingXXL: { fontSize: 34, fontWeight: '800', letterSpacing: -0.85, lineHeight: 40 },
  headingXL: { fontSize: 29, fontWeight: '800', letterSpacing: -0.6, lineHeight: 35 },
  headingL: { fontSize: 26, fontWeight: '800', letterSpacing: -0.4, lineHeight: 32 },
  headingM: { fontSize: 23, fontWeight: '800', lineHeight: 30 },
  headingS: { fontSize: 19, fontWeight: '800', lineHeight: 25 },
  headingXS: { fontSize: 17.5, fontWeight: '800', lineHeight: 22 },
  numeric: { fontSize: 22, fontWeight: '800', lineHeight: 27 },

  /** Exercise stems. The design sets these at 1.35–1.45 line height. */
  question: { fontSize: 24, fontWeight: '800', lineHeight: 32 },
  questionS: { fontSize: 21, fontWeight: '800', lineHeight: 30 },

  bodyL: { fontSize: 17, fontWeight: '700', lineHeight: 24 },
  bodyM: { fontSize: 15, fontWeight: '800', lineHeight: 20 },
  bodyS: { fontSize: 13.5, fontWeight: '700', lineHeight: 18 },
  prose: { fontSize: 16, fontWeight: '400', lineHeight: 25 },
  proseS: { fontSize: 13, fontWeight: '400', lineHeight: 19 },
  proseXS: { fontSize: 12.5, fontWeight: '400', lineHeight: 17 },

  labelL: { fontSize: 17.5, fontWeight: '800', lineHeight: 22 },
  labelM: { fontSize: 15, fontWeight: '800', lineHeight: 19 },
  labelS: { fontSize: 13.5, fontWeight: '800', lineHeight: 17 },
  caption: { fontSize: 11.5, fontWeight: '800', lineHeight: 15 },
  eyebrow: { fontSize: 11, fontWeight: '800', letterSpacing: 0.9, lineHeight: 14 },
  /** HUD counters: streak, hearts, XP. */
  hud: { fontSize: 14.5, fontWeight: '800', lineHeight: 18 },
  /** JetBrains Mono micro-label. */
  mono: { fontSize: 11, fontWeight: '500', lineHeight: 15 },
  monoM: { fontSize: 12.5, fontWeight: '500', lineHeight: 16 },
} as const satisfies Record<string, TextStyle>;

export type TypographyRole = keyof typeof typography;

export const spacing = {
  xxs: 2,
  xs: 4,
  sm: 8,
  md: 11,
  lg: 14,
  xl: 20,
  xxl: 22,
  xxxl: 26,
  huge: 34,
} as const;

export const radii = {
  xs: 6,
  small: 12,
  medium: 16,
  large: 18,
  xlarge: 22,
  node: 24,
  sheet: 32,
  pill: 999,
} as const;

/**
 * The design expresses physical depth two ways: a solid offset shadow under a
 * pressable face (buttons, path nodes) and a thickened bottom border on cards
 * and options.
 */
export const depth = {
  button: 4,
  node: 4,
  nodeCurrent: 5,
  cardBorder: 4,
  panel: 4,
} as const;

export const elevation = {
  raised: {
    boxShadow: '0 2px 8px rgba(12, 74, 56, 0.08)',
    elevation: 2,
  },
  card: {
    boxShadow: '0 1px 3px rgba(12, 74, 56, 0.1)',
    elevation: 1,
  },
  sheet: {
    boxShadow: '0 -14px 40px rgba(12, 74, 56, 0.14)',
    elevation: 12,
  },
  flashcard: {
    boxShadow: '0 14px 0 rgba(0, 0, 0, 0.14)',
    elevation: 8,
  },
} as const satisfies Record<string, ViewStyle>;

export const motion = {
  duration: {
    instant: 0,
    fast: 120,
    standard: 220,
    slow: 360,
  },
} as const;

/** Minimum comfortable one-handed touch target, in points. */
export const hitTarget = 44;

export const lightTheme = {
  colors,
  depth,
  elevation,
  hitTarget,
  motion,
  radii,
  spacing,
  typography,
} as const;

// One polished light theme ships today. Consumers read semantic roles so a
// future provider can swap the palette without touching component APIs.
export const theme = lightTheme;

export type AppTheme = typeof lightTheme;
