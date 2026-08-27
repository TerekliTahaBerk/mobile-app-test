import { StyleSheet, View } from 'react-native';

import { AppButton } from '@/shared/ui/components/app-button';
import { AppText } from '@/shared/ui/components/app-text';
import { BottomAction } from '@/shared/ui/components/bottom-action';
import { Screen } from '@/shared/ui/components/screen';
import { Cizgi } from '@/shared/ui/cizgi/cizgi';
import { theme } from '@/shared/ui/theme/tokens';
import type { CizgiMood } from '@/shared/ui/cizgi/cizgi-assets';

type MessageScreenProps = {
  action?: { label: string; onPress: () => void } | undefined;
  body: string;
  heading: string;
  mood: CizgiMood;
  /** Small monospace-ish detail shown under the body, e.g. an error summary. */
  detail?: string | undefined;
  secondaryAction?: { label: string; onPress: () => void } | undefined;
  testID?: string | undefined;
};

/**
 * The shared full-screen message layout behind every dead end: a crash, an
 * unknown link, an empty path. The design has no frame for these, so the
 * composition follows the celebration screens — ÇİZGİ, a heading, one short
 * explanation, and a single obvious way back.
 */
export function MessageScreen({
  action,
  body,
  detail,
  heading,
  mood,
  secondaryAction,
  testID,
}: MessageScreenProps) {
  return (
    <Screen includeBottomInset={false} testID={testID}>
      <View style={styles.stage}>
        <Cizgi mood={mood} width={150} />

        <View style={styles.copy}>
          <AppText accessibilityRole="header" align="center" variant="headingL">
            {heading}
          </AppText>
          <AppText align="center" color="secondary" variant="prose">
            {body}
          </AppText>
          {detail === undefined ? null : (
            <AppText align="center" color="faint" numberOfLines={3} variant="bodyS">
              {detail}
            </AppText>
          )}
        </View>
      </View>

      {action === undefined && secondaryAction === undefined ? null : (
        <BottomAction>
          {action === undefined ? null : (
            <AppButton label={action.label} onPress={action.onPress} testID="message-action" />
          )}
          {secondaryAction === undefined ? null : (
            <AppButton
              label={secondaryAction.label}
              onPress={secondaryAction.onPress}
              testID="message-secondary-action"
              variant="ghost"
            />
          )}
        </BottomAction>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  copy: {
    gap: theme.spacing.md,
    maxWidth: 320,
  },
  stage: {
    alignItems: 'center',
    flex: 1,
    gap: theme.spacing.xxl,
    justifyContent: 'center',
    paddingHorizontal: theme.spacing.xxxl,
  },
});
