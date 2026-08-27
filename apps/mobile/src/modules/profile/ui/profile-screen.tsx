import { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import { BottomTabBar, type AppTabKey } from '@/modules/home/ui/bottom-tab-bar';
import { profilePreviewData } from '@/modules/profile/model/profile-preview-data';
import { LeagueBoard } from '@/modules/profile/ui/league-board';
import { ProfileOverview } from '@/modules/profile/ui/profile-overview';
import type { LocalProfileStats } from '@/modules/profile/ui/profile-overview';
import { FEATURES } from '@/shared/config/app-config';
import { AppText } from '@/shared/ui/components/app-text';
import { Screen } from '@/shared/ui/components/screen';
import { TactilePressable } from '@/shared/ui/components/tactile-pressable';
import { Cizgi } from '@/shared/ui/cizgi/cizgi';
import { theme } from '@/shared/ui/theme/tokens';

export type ProfileTab = 'league' | 'profile';

const PORTRAIT_HEIGHT = 172;

type ProfileScreenProps = {
  activeTab: AppTabKey;
  initialTab: ProfileTab;
  localStats?: LocalProfileStats | undefined;
  onSelectTab: (tab: AppTabKey) => void;
};

/**
 * Design screen 12. One screen with two segments: the learner's own overview
 * and the weekly league standing. The green portrait band only belongs to the
 * profile segment, exactly as the design specifies.
 *
 * Everything is preview copy — see the module's model for what this is not.
 */
export function ProfileScreen({ activeTab, initialTab, localStats, onSelectTab }: ProfileScreenProps) {
  const [tab, setTab] = useState<ProfileTab>(initialTab);
  const leagueAvailable = FEATURES.league && localStats === undefined;
  const isProfile = !leagueAvailable || tab === 'profile';

  return (
    <Screen includeBottomInset={false} testID="profile-screen">
      {isProfile ? (
        <View style={styles.portrait}>
          <Cizgi height={PORTRAIT_HEIGHT - theme.spacing.xxl} mood={profilePreviewData.header.mood} />
        </View>
      ) : null}

      {leagueAvailable ? <View accessibilityRole="tablist" style={styles.segments}>
        <SegmentButton
          label={profilePreviewData.tabs.profile}
          onPress={() => setTab('profile')}
          selected={isProfile}
          testID="profile-tab-profile"
        />
        <SegmentButton
          label={profilePreviewData.tabs.league}
          onPress={() => setTab('league')}
          selected={!isProfile}
          testID="profile-tab-league"
        />
      </View> : null}

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        style={styles.scroll}
      >
        {isProfile ? <ProfileOverview localStats={localStats} /> : <LeagueBoard />}
      </ScrollView>

      <BottomTabBar activeTab={activeTab} onSelectTab={onSelectTab} />
    </Screen>
  );
}

type SegmentButtonProps = {
  label: string;
  onPress: () => void;
  selected: boolean;
  testID: string;
};

function SegmentButton({ label, onPress, selected, testID }: SegmentButtonProps) {
  return (
    <TactilePressable
      accessibilityLabel={label}
      accessibilityRole="tab"
      accessibilityState={{ selected }}
      depth={0}
      depthColor="transparent"
      faceStyle={[styles.segmentFace, selected && styles.segmentFaceSelected]}
      onPress={onPress}
      radius={theme.radii.small + 1}
      style={styles.segment}
      testID={testID}
    >
      <AppText align="center" color={selected ? 'inverse' : 'muted'} variant="labelS">
        {label}
      </AppText>
    </TactilePressable>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: theme.spacing.lg,
    paddingBottom: theme.spacing.xxl,
    paddingHorizontal: theme.spacing.xl,
  },
  portrait: {
    alignItems: 'center',
    backgroundColor: theme.colors.profile.portrait,
    height: PORTRAIT_HEIGHT,
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },
  scroll: {
    flex: 1,
  },
  segment: {
    flex: 1,
  },
  segmentFace: {
    backgroundColor: theme.colors.surface.recessed,
    justifyContent: 'center',
    minHeight: theme.hitTarget,
    paddingVertical: theme.spacing.md,
  },
  segmentFaceSelected: {
    backgroundColor: theme.colors.action.primary,
  },
  segments: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
    paddingHorizontal: theme.spacing.xl,
    paddingVertical: theme.spacing.md,
  },
});
