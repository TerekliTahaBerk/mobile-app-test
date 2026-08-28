import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

import { AppText } from '@/shared/ui/components/app-text';
import { CheckIcon } from '@/shared/ui/components/icons';
import { TactilePressable } from '@/shared/ui/components/tactile-pressable';
import { theme } from '@/shared/ui/theme/tokens';

type ChoiceRowProps = {
  /** Optional leading badge — the exam initials or the goal's round count. */
  badge?: ReactNode;
  detail?: string | undefined;
  label: string;
  onPress: () => void;
  selected: boolean;
  /** "POPÜLER" on the recommended daily goal. */
  tag?: string | undefined;
  testID?: string | undefined;
};

/** One tappable answer in the onboarding flow. */
export function ChoiceRow({
  badge,
  detail,
  label,
  onPress,
  selected,
  tag,
  testID,
}: ChoiceRowProps) {
  return (
    <TactilePressable
      accessibilityLabel={detail === undefined ? label : `${label}. ${detail}`}
      accessibilityRole="radio"
      accessibilityState={{ selected }}
      depth={theme.depth.cardBorder}
      depthColor={selected ? theme.colors.action.primary : theme.colors.border.subtle}
      onPress={onPress}
      radius={theme.radii.large + 2}
      testID={testID}
    >
      <View style={[styles.face, selected ? styles.faceSelected : null]}>
        {badge === undefined ? null : (
          <View style={[styles.badge, selected ? styles.badgeSelected : null]}>{badge}</View>
        )}
        <View style={styles.body}>
          <AppText color={selected ? 'success' : 'primary'} variant="headingXS">
            {label}
          </AppText>
          {detail === undefined ? null : (
            <AppText
              color={selected ? 'accentSoft' : 'secondary'}
              style={styles.detail}
              variant="proseS"
            >
              {detail}
            </AppText>
          )}
        </View>
        {tag === undefined ? null : (
          <View style={styles.tag}>
            <AppText color="inverse" variant="eyebrow">
              {tag}
            </AppText>
          </View>
        )}
        <View style={[styles.radio, selected ? styles.radioSelected : null]}>
          {selected ? <CheckIcon size={14} /> : null}
        </View>
      </View>
    </TactilePressable>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignItems: 'center',
    backgroundColor: theme.colors.surface.recessed,
    borderRadius: theme.radii.large,
    height: 52,
    justifyContent: 'center',
    width: 52,
  },
  badgeSelected: {
    backgroundColor: theme.colors.surface.default,
  },
  body: {
    flex: 1,
  },
  detail: {
    marginTop: theme.spacing.xxs,
  },
  face: {
    alignItems: 'center',
    backgroundColor: theme.colors.surface.default,
    borderColor: theme.colors.border.subtle,
    borderRadius: theme.radii.large + 2,
    borderWidth: 2,
    flexDirection: 'row',
    gap: theme.spacing.lg,
    paddingHorizontal: theme.spacing.lg + 4,
    paddingVertical: theme.spacing.lg + 5,
  },
  faceSelected: {
    backgroundColor: theme.colors.surface.soft,
    borderColor: theme.colors.action.primary,
  },
  radio: {
    alignItems: 'center',
    borderColor: theme.colors.border.subtle,
    borderRadius: theme.radii.pill,
    borderWidth: 2,
    height: 26,
    justifyContent: 'center',
    width: 26,
  },
  radioSelected: {
    backgroundColor: theme.colors.action.primary,
    borderColor: theme.colors.action.primary,
  },
  tag: {
    backgroundColor: theme.colors.action.primary,
    borderRadius: theme.radii.pill,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs + 2,
  },
});
