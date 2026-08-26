import type { TextStyle, ViewStyle } from 'react-native';

/**
 * Raw palette imported from the approved Claude Design project
 * "TEKRARLA Ekranlar v2" (pastel pass). Components never read this object;
 * they consume the semantic roles below.
 */
const palette = {
  coral: '#F2794F',
  coralDark: '#C2552F',
  coralDeep: '#B9491F',
  coralInk: '#E2683A',
  coralTint: '#FFF3EC',
  coralSoft: '#FFE7DB',
  coral300: '#F9B79B',
  coral400: '#F7A183',
  coral200: '#FAC6B1',
  coral100: '#FAD8C8',
  coral050: '#FADCD0',

  ink: '#2E2A26',
  inkSoft: '#3A342F',
  slate: '#5B534B',
  stone: '#9C938B',
  stoneSoft: '#ABA29A',
  stoneDim: '#8A827A',
  ash: '#C6BEB6',

  paper: '#FFFCFA',
  white: '#FFFFFF',
  canvas: '#EFEAE4',
  bone: '#F4EDE6',
  linen: '#F5F0EA',
  hairline: '#F3ECE5',
  border: '#EFE7E0',
  borderStrong: '#E4DBD2',

  off: '#F0EAE3',
  offDark: '#DBD3CA',
  offInk: '#B6ADA4',

  lockFace: '#EDE6DE',
  lockShadow: '#DCD3CA',
  lockGlyph: '#B4ABA1',

  history: '#E0A876',
  historyDark: '#C08850',
  historySoft: '#FBE7D6',
  historyInk: '#A9662F',
  historyDeep: '#7A4A22',
  unitBanner: '#F0D3B4',
  unitBannerShadow: '#DDB98F',

  geography: '#86C9A6',
  geographySoft: '#DFF3E8',
  geographyInk: '#34785A',

  philosophy: '#A79BE6',
  philosophySoft: '#EAE5FB',
  philosophyTrack: '#E9E3FA',
  philosophyInk: '#5C4CB0',
  philosophyDim: '#BDB2DE',
  philosophyCanvas: '#F8F5FF',

  religion: '#8FBBE8',
  religionSoft: '#E3EFFB',
  religionInk: '#3A6D9E',

  xp: '#F6CE7C',
  xpDark: '#DDA93F',
  xpSoft: '#FDF0D9',
  xpInk: '#8A6314',
  xpNumber: '#B98A24',

  heart: '#F2857F',
  heartInk: '#C4544E',

  success: '#5FB78E',
  successDark: '#3D8E68',
  successSoft: '#EFF9F4',
  successSurface: '#F3FAF6',
  successInk: '#2F6E52',

  tabActive: '#FFF1EA',
  tabActiveBorder: '#FAD3C1',

  event: '#C97BA8',
  eventSoft: '#F3DDEB',
  eventSurface: '#FDF4F9',
  eventBorder: '#EFD6E6',
  eventInk: '#A85C8A',
  eventMuted: '#B98CA8',

  danger: '#EF8078',
  dangerBorder: '#F2A9A3',
  dangerSoft: '#FDF1F0',
  dangerSurface: '#FEF6F5',
  dangerInk: '#C4544E',
} as const;

const colors = {
  background: {
    app: palette.paper,
    lesson: palette.white,
    flashcard: palette.philosophyCanvas,
    subtle: palette.linen,
    canvas: palette.canvas,
    scrim: 'rgba(46, 42, 38, 0.42)',
    ground: palette.bone,
  },
  surface: {
    default: palette.white,
    soft: palette.coralTint,
    recessed: palette.linen,
    sheet: palette.white,
  },
  text: {
    primary: palette.ink,
    body: palette.inkSoft,
    secondary: palette.slate,
    muted: palette.stone,
    faint: palette.ash,
    eyebrow: palette.stoneDim,
    inverse: palette.white,
    accent: palette.coralDeep,
    accentStrong: palette.coralInk,
    disabled: palette.offInk,
  },
  border: {
    hairline: palette.hairline,
    subtle: palette.border,
    strong: palette.borderStrong,
    accent: palette.coral,
  },
  action: {
    primary: palette.coral,
    primaryDepth: palette.coralDark,
    primarySoft: palette.coralSoft,
    primaryTint: palette.coralTint,
    success: palette.success,
    successDepth: palette.successDark,
    danger: palette.danger,
    dangerDepth: palette.dangerInk,
    neutral: palette.white,
    neutralDepth: palette.borderStrong,
    disabled: palette.off,
    disabledDepth: palette.offDark,
    ghost: 'transparent',
    onPrimary: palette.white,
    onDisabled: palette.offInk,
  },
  progress: {
    track: palette.hairline,
    fill: palette.xp,
    gloss: 'rgba(255, 255, 255, 0.45)',
  },
  status: {
    success: palette.success,
    successSoft: palette.successSoft,
    successSurface: palette.successSurface,
    successInk: palette.successInk,
    danger: palette.danger,
    dangerBorder: palette.dangerBorder,
    dangerSoft: palette.dangerSoft,
    dangerSurface: palette.dangerSurface,
    dangerInk: palette.dangerInk,
  },
  reward: {
    xp: palette.xp,
    xpDepth: palette.xpDark,
    xpSoft: palette.xpSoft,
    xpInk: palette.xpInk,
    xpNumber: palette.xpNumber,
    gem: palette.religion,
    gemInk: palette.religionInk,
    heart: palette.heart,
    heartInk: palette.heartInk,
  },
  // İz is the learner-facing habit trace. The tapering bar set is its mark.
  trace: {
    strong: palette.coral,
    mid: palette.coral400,
    soft: palette.coral200,
    faint: palette.coral050,
    ring: palette.coral100,
    surface: palette.coralTint,
    border: palette.coral100,
    ink: palette.coralInk,
  },
  event: {
    accent: palette.event,
    soft: palette.eventSoft,
    surface: palette.eventSurface,
    border: palette.eventBorder,
    ink: palette.eventInk,
    muted: palette.eventMuted,
  },
  navigation: {
    surface: palette.white,
    hairline: palette.hairline,
    activeSurface: palette.tabActive,
    activeBorder: palette.tabActiveBorder,
  },
  path: {
    lockedFace: palette.lockFace,
    lockedDepth: palette.lockShadow,
    lockedGlyph: palette.lockGlyph,
    currentFace: palette.coral,
    currentDepth: palette.coralDark,
    currentRing: palette.coral100,
    checkpointFace: palette.xp,
    checkpointDepth: palette.xpDark,
    checkpointGlyph: palette.xpInk,
    unitFace: palette.unitBanner,
    unitDepth: palette.unitBannerShadow,
  },
  subject: {
    history: {
      primary: palette.history,
      depth: palette.historyDark,
      soft: palette.historySoft,
      ink: palette.historyInk,
      deep: palette.historyDeep,
    },
    geography: {
      primary: palette.geography,
      depth: palette.geographyInk,
      soft: palette.geographySoft,
      ink: palette.geographyInk,
      deep: palette.geographyInk,
    },
    philosophy: {
      primary: palette.philosophy,
      depth: palette.philosophyInk,
      soft: palette.philosophySoft,
      ink: palette.philosophyInk,
      deep: palette.philosophyInk,
      track: palette.philosophyTrack,
      dim: palette.philosophyDim,
    },
    religion: {
      primary: palette.religion,
      depth: palette.religionInk,
      soft: palette.religionSoft,
      ink: palette.religionInk,
      deep: palette.religionInk,
    },
  },
} as const;

export type SubjectKey = keyof typeof colors.subject;

/**
 * Type roles mirror the design's `font:` shorthands. Display roles render in
 * Baloo 2; interface and body roles render in Nunito.
 */
export const typography = {
  display: { fontSize: 96, fontWeight: '800', lineHeight: 100 },
  headingXXL: { fontSize: 40, fontWeight: '800', lineHeight: 46 },
  headingXL: { fontSize: 34, fontWeight: '800', lineHeight: 39 },
  headingL: { fontSize: 26, fontWeight: '800', lineHeight: 32 },
  headingM: { fontSize: 22, fontWeight: '800', lineHeight: 29 },
  headingS: { fontSize: 19, fontWeight: '800', lineHeight: 23 },
  headingXS: { fontSize: 17, fontWeight: '800', lineHeight: 20 },
  numeric: { fontSize: 23, fontWeight: '800', lineHeight: 26 },

  question: { fontSize: 19, fontWeight: '700', lineHeight: 27 },
  bodyL: { fontSize: 17, fontWeight: '700', lineHeight: 25 },
  bodyM: { fontSize: 16, fontWeight: '700', lineHeight: 21 },
  bodyS: { fontSize: 13.5, fontWeight: '700', lineHeight: 20 },
  prose: { fontSize: 15.5, fontWeight: '400', lineHeight: 25 },
  proseS: { fontSize: 13.5, fontWeight: '600', lineHeight: 20 },

  labelL: { fontSize: 16, fontWeight: '800', letterSpacing: 0.96, lineHeight: 20 },
  labelM: { fontSize: 15, fontWeight: '800', lineHeight: 19 },
  labelS: { fontSize: 13, fontWeight: '800', lineHeight: 17 },
  caption: { fontSize: 12, fontWeight: '800', letterSpacing: 0.6, lineHeight: 16 },
  eyebrow: { fontSize: 10.5, fontWeight: '800', letterSpacing: 1.5, lineHeight: 14 },
  hud: { fontSize: 17, fontWeight: '900', lineHeight: 20 },
} as const satisfies Record<string, TextStyle>;

export type TypographyRole = keyof typeof typography;

export const spacing = {
  xxs: 2,
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
  huge: 40,
} as const;

export const radii = {
  xs: 9,
  small: 13,
  medium: 16,
  large: 20,
  xlarge: 26,
  sheet: 30,
  pill: 999,
} as const;

/**
 * The design expresses physical depth two ways: a solid offset shadow under a
 * pressable face (buttons, path nodes) and a thickened bottom border on cards.
 */
export const depth = {
  button: 5,
  node: 8,
  nodeSmall: 6,
  panel: 6,
  banner: 4,
  cardBorder: 4,
  cardBorderThick: 5,
  cardBorderXL: 6,
} as const;

export const elevation = {
  raised: {
    boxShadow: '0 8px 18px rgba(72, 43, 29, 0.09)',
    elevation: 3,
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
