import { Redirect, usePathname } from 'expo-router';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import type { LearnerProfile } from '@/modules/learner/domain/learner-profile';
import type { LearnerProfileRepository } from '@/modules/progress/application/repositories';
import { MessageScreen } from '@/shared/ui/feedback/message-screen';

type LearnerProfileState =
  | { status: 'loading' }
  | { error: Error; status: 'failed' }
  | { profile: LearnerProfile | null; status: 'ready' };

type LearnerProfileStore = LearnerProfileState & {
  refresh: () => void;
  save: (profile: LearnerProfile) => Promise<void>;
};

const LearnerProfileContext = createContext<LearnerProfileStore | null>(null);

export function LearnerProfileProvider({
  children,
  repository,
}: {
  children: ReactNode;
  repository: LearnerProfileRepository;
}) {
  const [state, setState] = useState<LearnerProfileState>({ status: 'loading' });
  const [revision, setRevision] = useState(0);

  useEffect(() => {
    let cancelled = false;

    repository
      .read()
      .then((profile) => {
        if (!cancelled) {
          setState({ profile, status: 'ready' });
        }
      })
      .catch((cause: unknown) => {
        if (!cancelled) {
          setState({ error: asError(cause), status: 'failed' });
        }
      });

    return () => {
      cancelled = true;
    };
  }, [repository, revision]);

  const refresh = useCallback(() => {
    setState({ status: 'loading' });
    setRevision((value) => value + 1);
  }, []);
  const save = useCallback(
    async (profile: LearnerProfile) => {
      await repository.write(profile);
      setState({ profile, status: 'ready' });
    },
    [repository],
  );
  const value = useMemo<LearnerProfileStore>(
    () => ({ ...state, refresh, save }),
    [refresh, save, state],
  );

  return <LearnerProfileContext.Provider value={value}>{children}</LearnerProfileContext.Provider>;
}

/**
 * Resolves first launch only after SQLite and the profile read are ready.
 * Legacy LGS profiles are sent through onboarding again because the current
 * pilot has no coherent LGS curriculum; saving the supported YKS choice
 * replaces that unsupported preference without touching learning history.
 */
export function LearnerEntryGate({ children }: { children: ReactNode }) {
  const store = useLearnerProfile();
  const pathname = usePathname();

  if (store.status === 'loading') {
    return (
      <MessageScreen
        body="Bu cihazdaki profilin kontrol ediliyor."
        heading="Hazırlanıyor"
        testID="profile-startup-loading"
        tone="muted"
      />
    );
  }

  if (store.status === 'failed') {
    return (
      <MessageScreen
        action={{ label: 'Tekrar dene', onPress: store.refresh }}
        body="Profilin okunamadı. Kayıtların silinmedi; tekrar deneyebilirsin."
        detail={__DEV__ ? store.error.message : undefined}
        heading="Profil açılamadı"
        testID="profile-startup-failed"
        tone="dimmed"
      />
    );
  }

  const onboardingRequired = needsOnboarding(store.profile);
  if (onboardingRequired && pathname !== '/onboarding') {
    return <Redirect href="/onboarding" />;
  }
  if (!onboardingRequired && pathname === '/onboarding') {
    return <Redirect href="/" />;
  }

  return children;
}

export function needsOnboarding(profile: LearnerProfile | null): boolean {
  return profile === null || profile.exam !== 'yks';
}

export function useLearnerProfile(): LearnerProfileStore {
  const value = useContext(LearnerProfileContext);
  if (value === null) {
    throw new Error('useLearnerProfile must be used within a LearnerProfileProvider.');
  }

  return value;
}

function asError(cause: unknown): Error {
  return cause instanceof Error ? cause : new Error(String(cause));
}
