import { ScrollView, StyleSheet, View } from 'react-native';

import { izPreviewData, type IzDayState } from '@/modules/iz/model/iz-preview-data';
import { AppButton } from '@/shared/ui/components/app-button';
import { AppText, type AppTextColor } from '@/shared/ui/components/app-text';
import { BottomAction } from '@/shared/ui/components/bottom-action';
import { Screen } from '@/shared/ui/components/screen';
import { TraceMark } from '@/shared/ui/components/trace-mark';
import { Cizgi } from '@/shared/ui/cizgi/cizgi';
import { theme } from '@/shared/ui/theme/tokens';

type IzCelebrationScreenProps = {
  onContinue: () => void;
  onShare?: (() => void) | undefined;
};

/**
 * Design screen 10. The week strip is the İz made visible. Each day states its
 * own status in words, so the row never depends on colour alone.
 */
export function IzCelebrationScreen({ onContinue, onShare }: IzCelebrationScreenProps) {
  return (
    <Screen includeBottomInset={false} testID="iz-celebration-screen">
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        style={styles.scroll}
      >
        <Cizgi mood={izPreviewData.mood} width={150} />
        <TraceMark size="lg" />

        <View accessible accessibilityRole="header" style={styles.count}>
          <AppText align="center" style={styles.countValue} variant="display">
            {izPreviewData.count}
          </AppText>
          <AppText align="center" color="accentStrong" variant="headingM">
            {izPreviewData.unit}
          </AppText>
        </View>

        <View style={styles.weekCard}>
          <View style={styles.weekRow}>
            {izPreviewData.week.map((day) => {
              const visual = dayVisuals[day.state];

              return (
                <View
                  accessible
                  accessibilityLabel={`${day.longLabel}: ${visual.spoken}`}
                  key={day.id}
                  style={styles.day}
                >
                  <AppText align="center" color={visual.labelColor} variant="caption">
                    {day.label}
                  </AppText>
                  <View style={[styles.dayDot, { backgroundColor: visual.dot }]}>
                    {day.state === 'upcoming' ? null : (
                      <AppText color="inverse" variant="labelS">
                        ✓
                      </AppText>
                    )}
                  </View>
                </View>
              );
            })}
          </View>

          <View style={styles.footnote}>
            <AppText align="center" color="secondary" variant="proseS">
              {izPreviewData.footnote}
            </AppText>
          </View>
        </View>
      </ScrollView>

      <BottomAction>
        <AppButton label={izPreviewData.cta} onPress={onContinue} testID="iz-continue" />
        {onShare === undefined ? null : (
          <AppButton label={izPreviewData.shareLabel} onPress={onShare} variant="ghost" />
        )}
      </BottomAction>
    </Screen>
  );
}

type DayVisual = {
  dot: string;
  labelColor: AppTextColor;
  spoken: string;
};

const dayVisuals: Record<IzDayState, DayVisual> = {
  done: {
    dot: theme.colors.trace.strong,
    labelColor: 'accentStrong',
    spoken: 'tamamlandı',
  },
  today: {
    dot: theme.colors.subject.religion.primary,
    labelColor: 'gem',
    spoken: 'bugün, tamamlandı',
  },
  upcoming: {
    dot: theme.colors.action.disabled,
    labelColor: 'faint',
    spoken: 'henüz gelmedi',
  },
};

const styles = StyleSheet.create({
  content: {
    alignItems: 'center',
    flexGrow: 1,
    gap: theme.spacing.lg,
    justifyContent: 'center',
    paddingHorizontal: theme.spacing.xxl,
    paddingVertical: theme.spacing.xl,
  },
  count: {
    alignItems: 'center',
  },
  // Baloo's descent leaves a deep well under a 96pt numeral; the pull-up keeps
  // the count and its unit reading as one block.
  countValue: {
    color: theme.colors.action.primary,
    marginBottom: -theme.spacing.xl,
  },
  day: {
    alignItems: 'center',
    gap: theme.spacing.sm + 1,
    minWidth: theme.hitTarget - 8,
  },
  dayDot: {
    alignItems: 'center',
    borderRadius: theme.radii.pill,
    height: 30,
    justifyContent: 'center',
    width: 30,
  },
  footnote: {
    borderTopColor: theme.colors.border.hairline,
    borderTopWidth: 2,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.lg - 2,
  },
  scroll: {
    flex: 1,
  },
  weekCard: {
    borderColor: theme.colors.border.hairline,
    borderRadius: theme.radii.large,
    borderWidth: 2,
    marginTop: theme.spacing.md,
    overflow: 'hidden',
    width: '100%',
  },
  weekRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
    justifyContent: 'space-around',
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.lg,
  },
});
