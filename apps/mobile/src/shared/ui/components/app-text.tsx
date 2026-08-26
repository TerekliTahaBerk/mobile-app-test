import { StyleSheet, Text, type TextProps } from 'react-native';

import { theme, type TypographyRole } from '@/shared/ui/theme/tokens';
import { useAppTypographyReady } from '@/shared/ui/theme/typography-provider';

export type AppTextColor =
  | 'accent'
  | 'accentStrong'
  | 'body'
  | 'checkpoint'
  | 'danger'
  | 'disabled'
  | 'eyebrow'
  | 'faint'
  | 'gem'
  | 'heart'
  | 'inverse'
  | 'muted'
  | 'primary'
  | 'secondary'
  | 'subjectHistory'
  | 'subjectPhilosophy'
  | 'success'
  | 'xp';

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
  display: { fontFamily: 'Baloo2_800ExtraBold' },
  prose: { fontFamily: 'Nunito_400Regular' },
  proseSemi: { fontFamily: 'Nunito_600SemiBold' },
  body: { fontFamily: 'Nunito_700Bold' },
  label: { fontFamily: 'Nunito_800ExtraBold' },
  hud: { fontFamily: 'Nunito_900Black' },
});

const fontFamilyByVariant = {
  display: 'display',
  headingXXL: 'display',
  headingXL: 'display',
  headingL: 'display',
  headingM: 'display',
  headingS: 'display',
  headingXS: 'display',
  numeric: 'display',

  question: 'body',
  bodyL: 'body',
  bodyM: 'body',
  bodyS: 'body',
  prose: 'prose',
  proseS: 'proseSemi',

  labelL: 'label',
  labelM: 'label',
  labelS: 'label',
  caption: 'label',
  eyebrow: 'label',
  hud: 'hud',
} as const satisfies Record<TypographyRole, keyof typeof fontFamilyStyles>;

const colorStyles = StyleSheet.create({
  accent: { color: theme.colors.text.accent },
  accentStrong: { color: theme.colors.text.accentStrong },
  body: { color: theme.colors.text.body },
  checkpoint: { color: theme.colors.reward.xpInk },
  danger: { color: theme.colors.status.dangerInk },
  disabled: { color: theme.colors.text.disabled },
  eyebrow: { color: theme.colors.text.eyebrow },
  faint: { color: theme.colors.text.faint },
  gem: { color: theme.colors.reward.gemInk },
  heart: { color: theme.colors.reward.heartInk },
  inverse: { color: theme.colors.text.inverse },
  muted: { color: theme.colors.text.muted },
  primary: { color: theme.colors.text.primary },
  secondary: { color: theme.colors.text.secondary },
  subjectHistory: { color: theme.colors.subject.history.ink },
  subjectPhilosophy: { color: theme.colors.subject.philosophy.ink },
  success: { color: theme.colors.status.successInk },
  xp: { color: theme.colors.reward.xpNumber },
});

const alignmentStyles = StyleSheet.create({
  center: { textAlign: 'center' },
  left: { textAlign: 'left' },
  right: { textAlign: 'right' },
});
