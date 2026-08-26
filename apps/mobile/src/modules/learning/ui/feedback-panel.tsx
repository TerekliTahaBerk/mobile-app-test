import { StyleSheet, View } from 'react-native';

import { AppText } from '@/shared/ui/components/app-text';
import { theme } from '@/shared/ui/theme/tokens';

export type FeedbackKind = 'correct' | 'wrong';

type FeedbackPanelProps = {
  detail?: string | undefined;
  kind: FeedbackKind;
  title: string;
};

/**
 * The verdict that rises above the bottom action after a check. The badge
 * glyph and the title text both state the outcome, so colour is never the only
 * signal.
 */
export function FeedbackPanel({ detail, kind, title }: FeedbackPanelProps) {
  const isCorrect = kind === 'correct';

  return (
    <View accessible accessibilityLiveRegion="polite" style={styles.panel} testID="feedback-panel">
      <View
        style={[
          styles.badge,
          { backgroundColor: isCorrect ? theme.colors.status.success : theme.colors.status.danger },
        ]}
      >
        <AppText color="inverse" variant="labelM">
          {isCorrect ? '✓' : '!'}
        </AppText>
      </View>

      <View style={styles.copy}>
        <AppText color={isCorrect ? 'success' : 'danger'} variant="headingS">
          {title}
        </AppText>
        {detail === undefined ? null : (
          <AppText color="secondary" variant="bodyS">
            {detail}
          </AppText>
        )}
      </View>
    </View>
  );
}

export const feedbackSurface: Record<FeedbackKind, string> = {
  correct: theme.colors.status.successSurface,
  wrong: theme.colors.status.dangerSurface,
};

const styles = StyleSheet.create({
  badge: {
    alignItems: 'center',
    borderRadius: theme.radii.pill,
    height: 34,
    justifyContent: 'center',
    width: 34,
  },
  copy: {
    flex: 1,
    gap: theme.spacing.xs,
  },
  panel: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: theme.spacing.md - 1,
  },
});
