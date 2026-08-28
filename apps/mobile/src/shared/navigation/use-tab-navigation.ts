import { useRouter } from 'expo-router';

import type { AppTabKey } from '@/shared/ui/navigation/bottom-tab-bar';

const TAB_ROUTES = {
  anasayfa: '/',
  lig: '/lig',
  ogren: '/ogren',
  profil: '/profil',
} as const satisfies Record<AppTabKey, string>;

/**
 * Maps the shell's four tabs onto routes. Tabs replace rather than push so the
 * shell never stacks on itself when the learner moves between sections.
 */
export function useTabNavigation(activeTab: AppTabKey) {
  const router = useRouter();

  return (tab: AppTabKey) => {
    if (tab === activeTab) {
      return;
    }
    router.replace(TAB_ROUTES[tab]);
  };
}
