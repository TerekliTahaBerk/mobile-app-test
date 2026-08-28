import { StyleSheet, View } from 'react-native';

import { AppButton } from '@/shared/ui/components/app-button';
import { AppText } from '@/shared/ui/components/app-text';
import { BottomAction } from '@/shared/ui/components/bottom-action';
import {
  ChevronIcon,
  ClockIcon,
  CloseIcon,
  HeartBrokenIcon,
  HeartOutlineIcon,
} from '@/shared/ui/components/icons';
import { Screen } from '@/shared/ui/components/screen';
import { TactilePressable } from '@/shared/ui/components/tactile-pressable';
import { Dino } from '@/shared/ui/dino/dino';
import { MAX_HEARTS } from '@/modules/progress/domain/hearts-policy';
import { theme } from '@/shared/ui/theme/tokens';

type HeartsEmptyScreenProps = {
  onClose: () => void;
  onOpenPremium: () => void;
  /** `null` hides the practice route when no free practice round is available. */
  onPractice: (() => void) | null;
  onWait: () => void;
  /** "18 dk" — how long until the next heart returns. */
  waitLabel: string;
};

/**
 * Out of hearts. The learner is offered time, a free practice round, or the
 * paid way past the limit — in that order, and with no ads anywhere.
 */
export function HeartsEmptyScreen({
  onClose,
  onOpenPremium,
  onPractice,
  onWait,
  waitLabel,
}: HeartsEmptyScreenProps) {
  return (
    <Screen includeBottomInset={false} testID="hearts-empty-screen">
      <View style={styles.chrome}>
        <TactilePressable
          accessibilityLabel="Kapat"
          accessibilityRole="button"
          depth={0}
          depthColor="transparent"
          faceStyle={styles.closeFace}
          onPress={onClose}
          testID="hearts-close"
        >
          <CloseIcon />
        </TactilePressable>
      </View>

      <View style={styles.stage}>
        <View>
          <Dino size={150} tone="dimmed" />
          <View style={styles.brokenBadge}>
            <HeartBrokenIcon />
          </View>
        </View>

        <AppText accessibilityRole="header" align="center" style={styles.title} variant="headingXL">
          Canların bitti.
        </AppText>
        <AppText align="center" color="secondary" style={styles.body} variant="prose">
          Biraz sonra yeniden deneyebilirsin.
        </AppText>

        <View
          accessibilityLabel={`${MAX_HEARTS} candan hiçbiri kalmadı`}
          accessibilityRole="text"
          style={styles.emptyHearts}
        >
          {Array.from({ length: MAX_HEARTS }, (_unused, index) => (
            <HeartOutlineIcon color={theme.colors.reward.heartFaint} key={index} size={26} />
          ))}
        </View>

        <View style={styles.timer}>
          <ClockIcon />
          <AppText variant="bodyS">
            Yeni can: <AppText color="success" variant="bodyS">{waitLabel}</AppText>
          </AppText>
        </View>
      </View>

      <BottomAction>
        <TactilePressable
          accessibilityLabel="Premium ile sınırsız can"
          accessibilityRole="button"
          depth={0}
          depthColor="transparent"
          faceStyle={styles.premiumFace}
          onPress={onOpenPremium}
          testID="hearts-premium"
        >
          <View style={styles.premiumRow}>
            <View style={styles.premiumIcon}>
              <AppText style={styles.infinity} variant="headingS">
                ∞
              </AppText>
            </View>
            <View style={styles.premiumBody}>
              <AppText color="inverse" variant="bodyM">
                Sınırsız can
              </AppText>
              <AppText color="onDark" style={styles.premiumDetail} variant="proseXS">
                Premium ile hiç durmadan devam et
              </AppText>
            </View>
            <ChevronIcon color={theme.colors.text.onDark} />
          </View>
        </TactilePressable>

        {onPractice === null ? null : (
          <AppButton
            label="Pratik Yaparak 1 Can Kazan"
            onPress={onPractice}
            testID="hearts-practice"
            variant="neutral"
          />
        )}
        <AppButton
          label="Canların Dolmasını Bekle"
          onPress={onWait}
          testID="hearts-wait"
          variant="ghost"
        />
      </BottomAction>
    </Screen>
  );
}

const styles = StyleSheet.create({
  body: {
    marginTop: theme.spacing.sm,
  },
  brokenBadge: {
    alignItems: 'center',
    backgroundColor: theme.colors.reward.heartSoft,
    borderColor: theme.colors.reward.heartBorder,
    borderRadius: theme.radii.pill,
    borderWidth: 2,
    height: 52,
    justifyContent: 'center',
    position: 'absolute',
    right: -6,
    top: 6,
    width: 52,
  },
  chrome: {
    flexDirection: 'row',
    paddingHorizontal: theme.spacing.xl,
    paddingTop: theme.spacing.sm,
  },
  closeFace: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: theme.hitTarget,
    minWidth: theme.hitTarget - 14,
  },
  emptyHearts: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
    marginTop: theme.spacing.xxl,
  },
  infinity: {
    color: theme.colors.progress.gain,
  },
  premiumBody: {
    flex: 1,
  },
  premiumDetail: {
    marginTop: 1,
  },
  premiumFace: {
    backgroundColor: theme.colors.action.primaryDepth,
    borderRadius: theme.radii.large + 2,
    padding: theme.spacing.lg + 4,
  },
  premiumIcon: {
    alignItems: 'center',
    backgroundColor: theme.colors.surface.onDark,
    borderRadius: theme.radii.small + 1,
    height: 42,
    justifyContent: 'center',
    width: 42,
  },
  premiumRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: theme.spacing.md + 2,
  },
  stage: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: theme.spacing.xl,
  },
  timer: {
    alignItems: 'center',
    backgroundColor: theme.colors.surface.default,
    borderColor: theme.colors.border.subtle,
    borderRadius: theme.radii.large,
    borderWidth: 1,
    flexDirection: 'row',
    gap: theme.spacing.md + 1,
    marginTop: theme.spacing.xl,
    paddingHorizontal: theme.spacing.lg + 4,
    paddingVertical: theme.spacing.lg,
  },
  title: {
    marginTop: theme.spacing.lg,
  },
});
