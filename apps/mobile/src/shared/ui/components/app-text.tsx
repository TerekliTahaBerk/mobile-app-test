import { StyleSheet, Text, type TextProps } from 'react-native';

import { theme, type TypographyRole } from '@/shared/ui/theme/tokens';
import { useAppTypographyReady } from '@/shared/ui/theme/typography-provider';

export type AppTextColor =
  | 'accent'
  | 'accentSoft'
  | 'accentStrong'
  | 'badge'
  | 'body'
  | 'danger'
  | 'dangerDeep'
  | 'disabled'
  | 'faint'
  | 'heart'
  | 'inverse'
  | 'muted'
  | 'onDark'
  | 'onDarkFaint'
  | 'primary'
  | 'secondary'
  | 'streak'
  | 'subjectHistory'
  | 'subjectHistoryDeep'
  | 'success';

type AppTextProps = TextProps & {
  align?: 'center' | 'left' | 'right';
  color?: AppTextColor;
  variant?: TypographyRole;
};

export function AppText({
  align = 'left',
  allowFontScaling = true,
  color = 'primary',
  style,
  variant = 'bodyM',
  ...textProps
}: AppTextProps) {
  const typographyReady = useAppTypographyReady();

  return (
    <Text
      allowFontScaling={allowFontScaling}
      style={[
        theme.typography[variant],
        typographyReady && fontFamilyStyles[fontFamilyByVariant[variant]],
        colorStyles[color],
        alignmentStyles[align],
        style,
      ]}
      {...textProps}
    />
  );
}

const fontFamilyStyles = StyleSheet.create({
  bold: { fontFamily: 'Manrope_700Bold' },
  extraBold: { fontFamily: 'Manrope_800ExtraBold' },
  mono: { fontFamily: 'JetBrainsMono_500Medium' },
  regular: { fontFamily: 'Manrope_400Regular' },
});

const fontFamilyByVariant = {
  display: 'extraBold',
  headingXXL: 'extraBold',
  headingXL: 'extraBold',
  headingL: 'extraBold',
  headingM: 'extraBold',
  headingS: 'extraBold',
  headingXS: 'extraBold',
  numeric: 'extraBold',

  question: 'extraBold',
  questionS: 'extraBold',

  bodyL: 'bold',
  bodyM: 'extraBold',
  bodyS: 'bold',
  prose: 'regular',
  proseS: 'regular',
  proseXS: 'regular',

  labelL: 'extraBold',
  labelM: 'extraBold',
  labelS: 'extraBold',
  caption: 'extraBold',
  eyebrow: 'extraBold',
  hud: 'extraBold',
  mono: 'mono',
  monoM: 'mono',
} as const satisfies Record<TypographyRole, keyof typeof fontFamilyStyles>;

const colorStyles = StyleSheet.create({
  accent: { color: theme.colors.text.accent },
  accentSoft: { color: theme.colors.text.accentSoft },
  accentStrong: { color: theme.colors.text.accentStrong },
  badge: { color: theme.colors.reward.badge },
  body: { color: theme.colors.text.body },
  danger: { color: theme.colors.status.dangerInk },
  dangerDeep: { color: theme.colors.status.dangerDeep },
  disabled: { color: theme.colors.text.disabled },
  faint: { color: theme.colors.text.faint },
  heart: { color: theme.colors.reward.heartInk },
  inverse: { color: theme.colors.text.inverse },
  muted: { color: theme.colors.text.muted },
  onDark: { color: theme.colors.text.onDark },
  onDarkFaint: { color: theme.colors.text.onDarkFaint },
  primary: { color: theme.colors.text.primary },
  secondary: { color: theme.colors.text.secondary },
  streak: { color: theme.colors.reward.streakInk },
  subjectHistory: { color: theme.colors.subject.history.ink },
  subjectHistoryDeep: { color: theme.colors.subject.history.deep },
  success: { color: theme.colors.status.successInk },
});

const alignmentStyles = StyleSheet.create({
  center: { textAlign: 'center' },
  left: { textAlign: 'left' },
  right: { textAlign: 'right' },
});
