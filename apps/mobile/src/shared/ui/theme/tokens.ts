import type { TextStyle, ViewStyle } from 'react-native';

const lightColors = {
  background: {
    app: '#FFF8F4',
    subtle: '#FFEDE5',
  },
  surface: {
    default: '#FFFFFF',
    elevated: '#FFFFFF',
    soft: '#FFF3ED',
    inverted: '#2B3A67',
  },
  text: {
    primary: '#241C18',
    secondary: '#5F554F',
    muted: '#766B65',
    inverse: '#FFFFFF',
    accent: '#B9391A',
  },
  border: {
    subtle: '#EFE1D9',
    strong: '#D6C2B7',
    accent: '#F4623A',
  },
  action: {
    ghost: 'transparent',
    primary: '#F4623A',
    primaryPressed: '#B9391A',
    primarySoft: '#FFE7DE',
    secondary: '#FFEDE5',
    secondaryPressed: '#FFDBCD',
    ghostPressed: '#FFEDE5',
    disabled: '#DED5D0',
    onPrimary: '#FFFFFF',
  },
  progress: {
    track: '#EADFD8',
    fill: '#F4623A',
  },
  status: {
    success: '#147A50',
    successSurface: '#E5F6EE',
    warning: '#8A5B00',
    warningSurface: '#FFF3CF',
    danger: '#B93838',
    dangerSurface: '#FDE7E3',
  },
  reward: {
    xp: '#2D7FF9',
    xpSurface: '#EAF2FF',
    trace: '#F4623A',
    traceSoft: '#FFE7DE',
    highlight: '#FFC53D',
  },
  subject: {
    history: {
      primary: '#B4552B',
      dark: '#8A3E1D',
      soft: '#F8E7DF',
    },
    geography: {
      primary: '#1E9E6A',
      dark: '#147A50',
      soft: '#E5F6EE',
    },
    philosophy: {
      primary: '#7C5CF5',
      dark: '#5C3ED0',
      soft: '#EEE9FF',
    },
    religion: {
      primary: '#2D7FF9',
      dark: '#185FC7',
      soft: '#EAF2FF',
    },
  },
} as const;

export const typography = {
  display: {
    fontSize: 36,
    fontWeight: '800',
    letterSpacing: -0.8,
    lineHeight: 42,
  },
  headingXL: {
    fontSize: 30,
    fontWeight: '800',
    letterSpacing: -0.5,
    lineHeight: 36,
  },
  headingL: {
    fontSize: 24,
    fontWeight: '800',
    letterSpacing: -0.3,
    lineHeight: 30,
  },
  headingM: {
    fontSize: 20,
    fontWeight: '700',
    lineHeight: 26,
  },
  bodyL: {
    fontSize: 18,
    fontWeight: '400',
    lineHeight: 27,
  },
  bodyM: {
    fontSize: 16,
    fontWeight: '400',
    lineHeight: 24,
  },
  bodyS: {
    fontSize: 14,
    fontWeight: '400',
    lineHeight: 20,
  },
  labelL: {
    fontSize: 16,
    fontWeight: '700',
    lineHeight: 20,
  },
  labelM: {
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 18,
  },
  caption: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.7,
    lineHeight: 16,
  },
} as const satisfies Record<string, TextStyle>;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  xxxl: 48,
} as const;

export const radii = {
  small: 12,
  medium: 16,
  large: 24,
  pill: 999,
} as const;

export const elevation = {
  raised: {
    boxShadow: '0 8px 18px rgba(72, 43, 29, 0.09)',
    elevation: 3,
  },
} as const satisfies Record<string, ViewStyle>;

export const controlDepth = {
  primary: 6,
} as const;

export const motion = {
  duration: {
    instant: 0,
    fast: 120,
    standard: 220,
    slow: 360,
  },
  easing: {
    enter: [0.2, 0, 0, 1],
    exit: [0.4, 0, 1, 1],
  },
} as const;

export const lightTheme = {
  colors: lightColors,
  controlDepth,
  elevation,
  motion,
  radii,
  spacing,
  typography,
} as const;

// Milestone 2 ships one polished theme. Consumers use this semantic object so a
// future provider can swap it without changing component-level color roles.
export const theme = lightTheme;

export type AppTheme = typeof lightTheme;
export type TypographyRole = keyof typeof typography;
