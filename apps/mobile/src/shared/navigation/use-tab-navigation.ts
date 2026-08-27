import { useRouter } from 'expo-router';

import type { AppTabKey } from '@/modules/home/ui/bottom-tab-bar';

const TAB_ROUTES = {
  gorev: '/gorevler',
  lig: '/lig',
  magaza: '/magaza',
  profil: '/profil',
  yol: '/',
} as const satisfies Record<AppTabKey, string>;

/**
 * Maps the shell's five tabs onto routes. Tabs replace rather than push so the
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
