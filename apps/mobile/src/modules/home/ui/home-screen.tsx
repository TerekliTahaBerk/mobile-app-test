import { useState } from 'react';
import { ScrollView, StyleSheet } from 'react-native';

import { homePreviewData } from '@/modules/home/model/home-preview-data';
import { BottomTabBar, type AppTabKey } from '@/modules/home/ui/bottom-tab-bar';
import { LevelPath } from '@/modules/home/ui/level-path';
import { PathHud } from '@/modules/home/ui/path-hud';
import { UnitBanner } from '@/modules/home/ui/unit-banner';
import { Screen } from '@/shared/ui/components/screen';
import { theme } from '@/shared/ui/theme/tokens';

type HomeScreenProps = {
  onOpenQuests: () => void;
  onStartLevel: () => void;
};

/**
 * Home is the learning journey, not a dashboard. The learner should read one
 * thing off this screen: buradan devam et.
 */
export function HomeScreen({ onOpenQuests, onStartLevel }: HomeScreenProps) {
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);

  const toggleNode = (nodeId: string) => {
    setSelectedNodeId((current) => (current === nodeId ? null : nodeId));
  };

  const onSelectTab = (tab: AppTabKey) => {
    if (tab === 'gorev') {
      onOpenQuests();
    }
  };

  return (
    <Screen includeBottomInset={false} testID="home-screen">
      <PathHud hud={homePreviewData.hud} />
      <UnitBanner unit={homePreviewData.unit} />

      <ScrollView
        contentContainerStyle={styles.pathContent}
        showsVerticalScrollIndicator={false}
        style={styles.pathScroll}
      >
        <LevelPath
          companion={homePreviewData.companion}
          level={homePreviewData.currentLevel}
          nodes={homePreviewData.nodes}
          onSelectNode={toggleNode}
          onStartLevel={onStartLevel}
          selectedNodeId={selectedNodeId}
        />
      </ScrollView>

      <BottomTabBar activeTab="yol" onSelectTab={onSelectTab} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  pathContent: {
    paddingBottom: theme.spacing.huge,
    paddingTop: theme.spacing.sm,
  },
  pathScroll: {
    flex: 1,
  },
});
