import { Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { FEATURES } from '@/shared/config/app-config';
import { AppText } from '@/shared/ui/components/app-text';
import { TraceMark } from '@/shared/ui/components/trace-mark';
import { theme } from '@/shared/ui/theme/tokens';

export type AppTabKey = 'gorev' | 'lig' | 'magaza' | 'profil' | 'yol';

type BottomTabBarProps = {
  activeTab: AppTabKey;
  onSelectTab: (tab: AppTabKey) => void;
};

type TabDefinition = {
  /** Tabs behind an unfinished feature are hidden rather than disabled. */
  enabled: boolean;
  key: AppTabKey;
  label: string;
};

const TABS: readonly TabDefinition[] = [
  { enabled: true, key: 'yol', label: 'Yol' },
  { enabled: true, key: 'gorev', label: 'Görev' },
  { enabled: FEATURES.league, key: 'lig', label: 'Lig' },
  { enabled: FEATURES.plus, key: 'magaza', label: 'Mağaza' },
  { enabled: true, key: 'profil', label: 'Profil' },
];

/**
 * The persistent shell navigation from the design. In a production pilot the
 * Lig and Mağaza tabs are absent, because neither feature works yet.
 */
export function BottomTabBar({ activeTab, onSelectTab }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.bar, { paddingBottom: Math.max(insets.bottom, theme.spacing.sm) }]}>
      {TABS.filter((tab) => tab.enabled).map((tab) => {
        const isActive = tab.key === activeTab;

        return (
          <Pressable
            accessibilityLabel={tab.label}
            accessibilityRole="tab"
            accessibilityState={{ selected: isActive }}
            key={tab.key}
            onPress={() => onSelectTab(tab.key)}
            style={[styles.tab, isActive && styles.tabActive]}
            testID={`tab-${tab.key}`}
          >
            <TabIcon active={isActive} tab={tab.key} />
            <AppText
              align="center"
              color={isActive ? 'accent' : 'muted'}
              style={styles.tabLabel}
              variant="eyebrow"
            >
              {tab.label}
            </AppText>
          </Pressable>
        );
      })}
    </View>
  );
}

type TabIconProps = {
  active: boolean;
  tab: AppTabKey;
};

function TabIcon({ active, tab }: TabIconProps) {
  const tint = active ? theme.colors.action.primary : theme.colors.text.faint;

  if (tab === 'yol') {
    return <TraceMark size="xs" />;
  }

  if (tab === 'gorev') {
    return (
      <View style={[styles.icon, styles.ring, { borderColor: tint }]}>
        <View style={[styles.ringCore, { backgroundColor: tint }]} />
      </View>
    );
  }

  if (tab === 'lig') {
    return (
      <View style={styles.icon}>
        <View style={[styles.shieldBody, { backgroundColor: tint }]} />
        <View style={[styles.shieldFoot, { backgroundColor: tint }]} />
      </View>
    );
  }

  if (tab === 'magaza') {
    return (
      <View style={styles.icon}>
        <View style={[styles.bagBody, { backgroundColor: tint }]} />
        <View style={[styles.bagHandle, { borderColor: tint }]} />
      </View>
    );
  }

  return (
    <View style={styles.icon}>
      <View style={[styles.avatarHead, { backgroundColor: tint }]} />
      <View style={[styles.avatarBody, { backgroundColor: tint }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  avatarBody: {
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    bottom: 0,
    height: 8,
    position: 'absolute',
    width: 17,
  },
  avatarHead: {
    borderRadius: theme.radii.pill,
    height: 9,
    left: 4,
    position: 'absolute',
    top: 0,
    width: 9,
  },
  bagBody: {
    borderBottomLeftRadius: 5,
    borderBottomRightRadius: 5,
    bottom: 0,
    height: 11,
    position: 'absolute',
    width: 17,
  },
  bagHandle: {
    borderTopLeftRadius: 6,
    borderTopRightRadius: 6,
    borderLeftWidth: 3,
    borderRightWidth: 3,
    borderTopWidth: 3,
    height: 7,
    left: 4,
    position: 'absolute',
    top: 0,
    width: 9,
  },
  bar: {
    backgroundColor: theme.colors.navigation.surface,
    borderTopColor: theme.colors.navigation.hairline,
    borderTopWidth: 2,
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: theme.spacing.xs,
    paddingTop: theme.spacing.sm,
  },
  icon: {
    alignItems: 'center',
    height: 17,
    justifyContent: 'center',
    position: 'relative',
    width: 17,
  },
  ring: {
    borderRadius: theme.radii.pill,
    borderWidth: 3,
  },
  ringCore: {
    borderRadius: theme.radii.pill,
    height: 5,
    width: 5,
  },
  shieldBody: {
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
    borderTopLeftRadius: 3,
    borderTopRightRadius: 3,
    height: 11,
    position: 'absolute',
    top: 0,
    width: 15,
  },
  shieldFoot: {
    borderRadius: 2,
    bottom: 0,
    height: 4,
    position: 'absolute',
    width: 9,
  },
  tab: {
    alignItems: 'center',
    borderColor: 'transparent',
    borderRadius: theme.radii.small + 1,
    borderWidth: 2,
    gap: theme.spacing.sm - 2,
    justifyContent: 'center',
    minHeight: theme.hitTarget,
    minWidth: theme.hitTarget + 8,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.sm - 1,
  },
  tabActive: {
    backgroundColor: theme.colors.navigation.activeSurface,
    borderColor: theme.colors.navigation.activeBorder,
  },
  tabLabel: {
    fontSize: 10.5,
    letterSpacing: 0,
  },
});
