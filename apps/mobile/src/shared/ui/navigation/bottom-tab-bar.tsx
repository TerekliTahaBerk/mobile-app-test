import { Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppText } from '@/shared/ui/components/app-text';
import {
  HomeIcon,
  LeagueIcon,
  LearnIcon,
  ProfileIcon,
} from '@/shared/ui/components/icons';
import { theme } from '@/shared/ui/theme/tokens';
import { FEATURES } from '@/shared/config/app-config';

export type AppTabKey = 'anasayfa' | 'lig' | 'ogren' | 'profil';

type BottomTabBarProps = {
  activeTab: AppTabKey;
  onSelectTab: (tab: AppTabKey) => void;
};

const TABS: readonly { key: AppTabKey; label: string }[] = [
  { key: 'anasayfa', label: 'Ana Sayfa' },
  { key: 'ogren', label: 'Öğren' },
  { key: 'lig', label: 'Lig' },
  { key: 'profil', label: 'Profil' },
];

/**
 * The persistent shell navigation. Preview-only destinations are removed from
 * the production information architecture.
 */
export function BottomTabBar({ activeTab, onSelectTab }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.bar, { paddingBottom: Math.max(insets.bottom, theme.spacing.xxl) }]}>
      {TABS.filter((tab) => tab.key !== 'lig' || FEATURES.league).map((tab) => {
        const isActive = tab.key === activeTab;
        const tint = isActive ? theme.colors.navigation.active : theme.colors.navigation.inactive;

        return (
          <Pressable
            accessibilityLabel={tab.label}
            accessibilityRole="tab"
            accessibilityState={{ selected: isActive }}
            key={tab.key}
            onPress={() => onSelectTab(tab.key)}
            style={styles.tab}
            testID={`tab-${tab.key}`}
          >
            <TabIcon color={tint} tab={tab.key} />
            <AppText
              align="center"
              style={[styles.tabLabel, { color: tint }]}
              variant="caption"
            >
              {tab.label}
            </AppText>
          </Pressable>
        );
      })}
    </View>
  );
}

function TabIcon({ color, tab }: { color: string; tab: AppTabKey }) {
  switch (tab) {
    case 'anasayfa':
      return <HomeIcon color={color} />;
    case 'ogren':
      return <LearnIcon color={color} />;
    case 'lig':
      return <LeagueIcon color={color} />;
    case 'profil':
      return <ProfileIcon color={color} />;
  }
}

const styles = StyleSheet.create({
  bar: {
    backgroundColor: theme.colors.navigation.surface,
    borderTopColor: theme.colors.navigation.hairline,
    borderTopWidth: 1,
    flexDirection: 'row',
    paddingHorizontal: theme.spacing.md,
    paddingTop: theme.spacing.md - 1,
  },
  tab: {
    alignItems: 'center',
    flex: 1,
    gap: 5,
    justifyContent: 'center',
    minHeight: theme.hitTarget,
    paddingVertical: theme.spacing.xs + 2,
  },
  tabLabel: {
    fontSize: 11,
  },
});
