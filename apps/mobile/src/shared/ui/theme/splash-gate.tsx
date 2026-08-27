import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useState, type ReactNode } from 'react';

import { useAppTypographyReady } from '@/shared/ui/theme/typography-provider';

/**
 * How long the splash may wait for brand fonts before the app is shown in the
 * system fallback anyway. Rendering must never be blocked indefinitely.
 */
const MAX_WAIT_MS = 3000;

SplashScreen.preventAutoHideAsync().catch(() => {
  // The splash may already be gone (fast refresh, or a platform without one).
});

type SplashGateProps = {
  children: ReactNode;
};

/**
 * Holds the native splash until the brand fonts are ready, so the first frame
 * the learner sees is already typeset rather than snapping from system fonts.
 * A timeout guarantees the app still appears if font loading stalls.
 */
export function SplashGate({ children }: SplashGateProps) {
  const typographyReady = useAppTypographyReady();
  const [waitedTooLong, setWaitedTooLong] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setWaitedTooLong(true), MAX_WAIT_MS);

    return () => clearTimeout(timer);
  }, []);

  const canReveal = typographyReady || waitedTooLong;

  useEffect(() => {
    if (canReveal) {
      SplashScreen.hideAsync().catch(() => {
        // Already hidden; nothing to do.
      });
    }
  }, [canReveal]);

  return children;
}
