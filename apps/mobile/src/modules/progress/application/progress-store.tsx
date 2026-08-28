import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import type { ProgressRepositories } from '@/modules/progress/application/repositories';
import { openDatabase } from '@/modules/progress/infrastructure/database';
import { createSqliteRepositories } from '@/modules/progress/infrastructure/sqlite-repositories';
import { MessageScreen } from '@/shared/ui/feedback/message-screen';

/**
 * Composition root for durable progress.
 *
 * Opening and migrating the database is the one startup step that can fail in a
 * way the learner must know about, so the state is branded: screens render only
 * once storage is `ready`, and a failure is surfaced rather than silently
 * degraded into a fake empty profile.
 */

export type ProgressStorageState =
  | { repositories: ProgressRepositories; status: 'ready' }
  | { error: Error; status: 'failed' }
  | { status: 'initializing' };

type ProgressStoreValue = ProgressStorageState & { retry: () => void };

const ProgressStoreContext = createContext<ProgressStoreValue | null>(null);

export type ProgressProviderProps = {
  children: ReactNode;
  /** Test seam: supplies repositories directly instead of opening SQLite. */
  repositories?: ProgressRepositories | undefined;
};

export function ProgressProvider({ children, repositories }: ProgressProviderProps) {
  const [state, setState] = useState<ProgressStorageState>(() =>
    repositories === undefined
      ? { status: 'initializing' }
      : { repositories, status: 'ready' },
  );
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    if (repositories !== undefined) {
      return;
    }

    let cancelled = false;

    openDatabase()
      .then((db) => {
        if (!cancelled) {
          setState({ repositories: createSqliteRepositories(db), status: 'ready' });
        }
      })
      .catch((cause: unknown) => {
        if (!cancelled) {
          setState({
            error: cause instanceof Error ? cause : new Error(String(cause)),
            status: 'failed',
          });
        }
      });

    return () => {
      cancelled = true;
    };
  }, [attempt, repositories]);

  const retry = useCallback(() => {
    setState({ status: 'initializing' });
    setAttempt((value) => value + 1);
  }, []);

  const value = useMemo<ProgressStoreValue>(() => ({ ...state, retry }), [retry, state]);

  return (
    <ProgressStoreContext.Provider value={value}>{children}</ProgressStoreContext.Provider>
  );
}

/** Prevents learner-state screens from flashing fixture or zero values before SQLite is ready. */
export function ProgressStartupGate({ children }: { children: ReactNode }) {
  const storage = useProgressStorage();

  if (storage.status === 'initializing') {
    return (
      <MessageScreen
        body="Bu cihazdaki ilerlemen hazırlanıyor."
        heading="Hazırlanıyor"
        testID="progress-initializing"
        tone="muted"
      />
    );
  }

  if (storage.status === 'failed') {
    return (
      <MessageScreen
        action={{ label: 'Tekrar dene', onPress: storage.retry }}
        body="İlerlemen açılamadı. Hiçbir kayıt silinmedi; tekrar deneyebilirsin."
        detail={__DEV__ ? storage.error.message : undefined}
        heading="İlerleme açılamadı"
        testID="progress-failed"
        tone="dimmed"
      />
    );
  }

  return children;
}

export function useProgressStorage(): ProgressStoreValue {
  const value = useContext(ProgressStoreContext);
  if (value === null) {
    throw new Error('useProgressStorage must be used within a ProgressProvider.');
  }

  return value;
}

/**
 * Repositories, or a throw. Use only below a boundary that has already checked
 * `status === 'ready'`.
 */
export function useRepositories(): ProgressRepositories {
  const value = useProgressStorage();
  if (value.status !== 'ready') {
    throw new Error('Repositories are not available until storage is ready.');
  }

  return value.repositories;
}
