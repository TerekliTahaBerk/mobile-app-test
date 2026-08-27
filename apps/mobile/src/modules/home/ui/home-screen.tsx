import { useRef, useState } from 'react';
import { ScrollView, StyleSheet, type LayoutChangeEvent } from 'react-native';

import { homePreviewData } from '@/modules/home/model/home-preview-data';
import { BottomTabBar, type AppTabKey } from '@/modules/home/ui/bottom-tab-bar';
import { LevelPath } from '@/modules/home/ui/level-path';
import { PathHud } from '@/modules/home/ui/path-hud';
import { UnitBanner } from '@/modules/home/ui/unit-banner';
import { Screen } from '@/shared/ui/components/screen';
import { theme } from '@/shared/ui/theme/tokens';

type HomeScreenProps = {
  onSelectTab: (tab: AppTabKey) => void;
  onStartLevel: () => void;
};

/**
 * Home is the learning journey, not a dashboard. The learner should read one
 * thing off this screen: buradan devam et.
 */
export function HomeScreen({ onSelectTab, onStartLevel }: HomeScreenProps) {
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const scrollRef = useRef<ScrollView>(null);
  const viewportHeight = useRef(0);

  const toggleNode = (nodeId: string) => {
    setSelectedNodeId((current) => (current === nodeId ? null : nodeId));
  };

  /**
   * On a short screen the detail panel can open below the fold, hiding its own
   * CTA. Scroll just far enough to bring the whole panel into view.
   */
  const revealPanel = (panelBottom: number) => {
    const target = panelBottom + theme.spacing.xxl - viewportHeight.current;
    if (target > 0) {
      scrollRef.current?.scrollTo({ animated: true, y: target });
    }
  };

  return (
    <Screen includeBottomInset={false} testID="home-screen">
      <PathHud hud={homePreviewData.hud} />
      <UnitBanner unit={homePreviewData.unit} />

      <ScrollView
        contentContainerStyle={styles.pathContent}
        onLayout={(event: LayoutChangeEvent) => {
          viewportHeight.current = event.nativeEvent.layout.height;
        }}
        ref={scrollRef}
        showsVerticalScrollIndicator={false}
        style={styles.pathScroll}
      >
        <LevelPath
          companion={homePreviewData.companion}
          level={homePreviewData.currentLevel}
          nodes={homePreviewData.nodes}
          onPanelMeasured={revealPanel}
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
