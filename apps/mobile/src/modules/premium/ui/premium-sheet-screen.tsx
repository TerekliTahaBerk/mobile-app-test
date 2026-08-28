import { ScrollView, StyleSheet, View } from 'react-native';

import { AppButton } from '@/shared/ui/components/app-button';
import { AppText } from '@/shared/ui/components/app-text';
import { RepeatIcon, UnlockedIcon } from '@/shared/ui/components/icons';
import { Screen } from '@/shared/ui/components/screen';
import { Dino } from '@/shared/ui/dino/dino';
import { theme } from '@/shared/ui/theme/tokens';

type PremiumBenefit = {
  detail: string;
  id: string;
  title: string;
};

const BENEFITS: readonly PremiumBenefit[] = [
  { detail: 'Yanlış yapsan da durmazsın', id: 'hearts', title: 'Sınırsız can' },
  { detail: 'Her ders, her challenge açık', id: 'units', title: 'Tüm üniteler' },
  { detail: 'Sınırsız tekrar turu', id: 'review', title: 'Yanlışlarını tekrarla' },
];

type PremiumSheetScreenProps = {
  /**
   * False until real in-app purchases exist. The sheet still explains what
   * Premium is, but it must not offer a purchase that cannot be made.
   */
  purchasable: boolean;
  onDismiss: () => void;
  onPurchase: () => void;
};

/**
 * The paywall. It names exactly what money buys — and states plainly what it
 * does not: XP, streak and league standing are earned, never bought.
 */
export function PremiumSheetScreen({
  onDismiss,
  onPurchase,
  purchasable,
}: PremiumSheetScreenProps) {
  return (
    <Screen background="premium" includeBottomInset={false} testID="premium-screen">
      <View style={styles.spacer} />

      <ScrollView
        contentContainerStyle={styles.sheetContent}
        showsVerticalScrollIndicator={false}
        style={styles.sheet}
      >
        <View style={styles.grabber} />

        <View style={styles.hero}>
          <Dino size={104} />
          <AppText accessibilityRole="header" align="center" style={styles.title} variant="headingXL">
            Sınırsız devam et.
          </AppText>
        </View>

        <View style={styles.benefits}>
          {BENEFITS.map((benefit) => (
            <View key={benefit.id} style={styles.benefit}>
              <View style={styles.benefitIcon}>
                <BenefitIcon id={benefit.id} />
              </View>
              <View style={styles.benefitBody}>
                <AppText color="success" variant="bodyM">
                  {benefit.title}
                </AppText>
                <AppText color="accentSoft" style={styles.benefitDetail} variant="proseXS">
                  {benefit.detail}
                </AppText>
              </View>
            </View>
          ))}
        </View>

        <AppText align="center" color="secondary" style={styles.disclaimer} variant="proseXS">
          XP, seri ve lig sıralaması satın alınamaz.
        </AppText>

        {purchasable ? (
          <AppButton label="Premium'u İncele" onPress={onPurchase} testID="premium-purchase" />
        ) : (
          <View style={styles.pending}>
            <AppText align="center" color="secondary" variant="bodyS">
              Premium henüz satışta değil. Hazır olduğunda buradan açılacak.
            </AppText>
          </View>
        )}
        <AppButton
          label="Şimdilik değil"
          onPress={onDismiss}
          testID="premium-dismiss"
          variant="ghost"
        />
      </ScrollView>
    </Screen>
  );
}

function BenefitIcon({ id }: { id: string }) {
  if (id === 'hearts') {
    return (
      <AppText color="accent" variant="headingS">
        ∞
      </AppText>
    );
  }

  return id === 'units' ? <UnlockedIcon /> : <RepeatIcon />;
}

const styles = StyleSheet.create({
  benefit: {
    alignItems: 'center',
    backgroundColor: theme.colors.surface.soft,
    borderRadius: theme.radii.large,
    flexDirection: 'row',
    gap: theme.spacing.md + 2,
    padding: theme.spacing.lg + 1,
  },
  benefitBody: {
    flex: 1,
  },
  benefitDetail: {
    marginTop: 1,
  },
  benefitIcon: {
    alignItems: 'center',
    backgroundColor: theme.colors.surface.default,
    borderRadius: theme.radii.small,
    height: 38,
    justifyContent: 'center',
    width: 38,
  },
  benefits: {
    gap: theme.spacing.md,
    marginTop: theme.spacing.xl,
  },
  disclaimer: {
    marginBottom: theme.spacing.lg,
    marginTop: theme.spacing.lg,
  },
  grabber: {
    alignSelf: 'center',
    backgroundColor: theme.colors.border.subtle,
    borderRadius: theme.radii.pill,
    height: 5,
    marginBottom: theme.spacing.lg + 4,
    width: 44,
  },
  hero: {
    alignItems: 'center',
  },
  pending: {
    backgroundColor: theme.colors.surface.recessed,
    borderRadius: theme.radii.large,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.lg + 2,
  },
  sheet: {
    ...theme.elevation.sheet,
    backgroundColor: theme.colors.surface.sheet,
    borderTopLeftRadius: theme.radii.sheet,
    borderTopRightRadius: theme.radii.sheet,
    flexGrow: 0,
  },
  sheetContent: {
    paddingBottom: theme.spacing.xxxl,
    paddingHorizontal: theme.spacing.xl,
    paddingTop: theme.spacing.md,
  },
  spacer: {
    flex: 1,
  },
  title: {
    marginTop: theme.spacing.xs + 2,
  },
});
