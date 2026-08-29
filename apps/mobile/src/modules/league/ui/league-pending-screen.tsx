import { StyleSheet, View } from 'react-native';

import { AppText } from '@/shared/ui/components/app-text';
import { LeagueIcon, StarIcon } from '@/shared/ui/components/icons';
import { Screen } from '@/shared/ui/components/screen';
import { BottomTabBar, type AppTabKey } from '@/shared/ui/navigation/bottom-tab-bar';
import { theme } from '@/shared/ui/theme/tokens';

type LeaguePendingScreenProps = {
  onSelectTab: (tab: AppTabKey) => void;
};

/** The honest production shell while weekly standings have no backend. */
export function LeaguePendingScreen({ onSelectTab }: LeaguePendingScreenProps) {
  return (
    <Screen includeBottomInset={false} testID="league-pending">
      <View style={styles.stage}>
        <View style={styles.tiers}>
          <View style={styles.tierQuiet} />
          <View style={styles.tierCurrent}>
            <StarIcon color={theme.colors.text.inverse} size={30} />
          </View>
          <View style={styles.tierQuiet} />
        </View>
        <View style={styles.icon}>
          <LeagueIcon color={theme.colors.action.primary} size={34} />
        </View>
        <View style={styles.copy}>
          <AppText accessibilityRole="header" align="center" variant="headingL">
            Lig hazırlanıyor
          </AppText>
          <AppText align="center" color="secondary" variant="prose">
            Haftalık XP sıralaması açıldığında çalışmaların seni buraya taşıyacak.
          </AppText>
        </View>
        <View style={styles.note}>
          <AppText align="center" color="accentSoft" variant="proseS">
            Sıralama hazır olana kadar XP ve ilerlemen cihazında güvenle birikmeye devam eder.
          </AppText>
        </View>
      </View>

      <BottomTabBar activeTab="lig" onSelectTab={onSelectTab} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  copy: { gap: theme.spacing.md, maxWidth: 330 },
  icon: {
    alignItems: 'center',
    backgroundColor: theme.colors.surface.soft,
    borderRadius: theme.radii.pill,
    height: 72,
    justifyContent: 'center',
    width: 72,
  },
  note: {
    backgroundColor: theme.colors.surface.soft,
    borderColor: theme.colors.border.accent,
    borderRadius: theme.radii.large,
    borderWidth: 1,
    maxWidth: 340,
    padding: theme.spacing.lg,
  },
  stage: {
    alignItems: 'center',
    flex: 1,
    gap: theme.spacing.xl,
    justifyContent: 'center',
    paddingHorizontal: theme.spacing.xl,
  },
  tierCurrent: {
    alignItems: 'center',
    backgroundColor: theme.colors.action.primaryDepth,
    borderRadius: theme.radii.large,
    height: 58,
    justifyContent: 'center',
    width: 58,
  },
  tierQuiet: {
    backgroundColor: theme.colors.surface.recessed,
    borderRadius: theme.radii.medium,
    height: 42,
    width: 42,
  },
  tiers: { alignItems: 'center', flexDirection: 'row', gap: theme.spacing.sm },
});
