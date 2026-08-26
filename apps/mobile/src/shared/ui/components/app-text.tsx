import { StyleSheet, Text, type TextProps } from 'react-native';

import { theme, type TypographyRole } from '@/shared/ui/theme/tokens';
import { useAppTypographyReady } from '@/shared/ui/theme/typography-provider';

export type AppTextColor =
  | 'accent'
  | 'danger'
  | 'inverse'
  | 'muted'
  | 'primary'
  | 'secondary'
  | 'success'
  | 'warning';

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
        typographyReady && fontFamilyStyles[fontFamilyRoleByVariant[variant]],
        colorStyles[color],
        alignmentStyles[align],
        style,
      ]}
      {...textProps}
    />
  );
}

const fontFamilyStyles = StyleSheet.create({
  body: { fontFamily: 'Nunito_400Regular' },
  displayBold: { fontFamily: 'Baloo2_700Bold' },
  displayExtraBold: { fontFamily: 'Baloo2_800ExtraBold' },
  label: { fontFamily: 'Nunito_700Bold' },
});

const fontFamilyRoleByVariant = {
  bodyL: 'body',
  bodyM: 'body',
  bodyS: 'body',
  caption: 'label',
  display: 'displayExtraBold',
  headingL: 'displayExtraBold',
  headingM: 'displayBold',
  headingXL: 'displayExtraBold',
  labelL: 'label',
  labelM: 'label',
} as const satisfies Record<TypographyRole, keyof typeof fontFamilyStyles>;

const colorStyles = StyleSheet.create({
  accent: { color: theme.colors.text.accent },
  danger: { color: theme.colors.status.danger },
  inverse: { color: theme.colors.text.inverse },
  muted: { color: theme.colors.text.muted },
  primary: { color: theme.colors.text.primary },
  secondary: { color: theme.colors.text.secondary },
  success: { color: theme.colors.status.success },
  warning: { color: theme.colors.status.warning },
});

const alignmentStyles = StyleSheet.create({
  center: { textAlign: 'center' },
  left: { textAlign: 'left' },
  right: { textAlign: 'right' },
});
