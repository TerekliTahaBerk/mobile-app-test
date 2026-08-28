import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';

import type { HeartsRepository } from '@/modules/progress/application/repositories';
import {
  fullHearts,
  grantHeart,
  readHearts,
  spendHeart,
  type HeartsRecord,
  type HeartsStatus,
} from '@/modules/progress/domain/hearts-policy';
import { systemClock, type Clock } from '@/shared/time/clock';
import { reportError } from '@/shared/observability/observability';

/**
 * The hearts economy, wired to storage.
 *
 * The record is the source of truth and the balance is always derived from it,
 * so the count is correct after an app restart, a long sleep, or a timezone
 * change — the store never runs a countdown of its own.
 */

type HeartsStoreValue = HeartsStatus & {
  grant: () => void;
  /** Re-derives the balance from the stored record; call when a screen focuses. */
  refresh: () => void;
  spend: () => void;
};

const HeartsContext = createContext<HeartsStoreValue | null>(null);

type HeartsProviderProps = {
  children: ReactNode;
  clock?: Clock;
  /** Omitted in pure UI tests; production supplies the SQLite repository. */
  repository?: HeartsRepository | undefined;
  /** True while the learner holds an entitlement that removes the limit. */
  unlimited?: boolean;
};

export function HeartsProvider({
  children,
  clock = systemClock,
  repository,
  unlimited = false,
}: HeartsProviderProps) {
  const [record, setRecord] = useState<HeartsRecord>(() => fullHearts(clock.now()));
  const [tick, setTick] = useState(0);
  const recordRef = useRef(record);

  const write = useCallback(
    (next: HeartsRecord) => {
      recordRef.current = next;
      setRecord(next);
      void repository?.write(next).catch((cause: unknown) => {
        // A failed heart write is not worth interrupting a lesson over; the
        // durable learning record is unaffected. Report it for diagnostics;
        // the stored value stays where it was and re-derives next launch.
        reportError(asError(cause), { operation: 'hearts.write' });
      });
    },
    [repository],
  );

  useEffect(() => {
    if (repository === undefined) {
      return;
    }

    let cancelled = false;
    repository
      .read()
      .then((stored) => {
        if (cancelled) {
          return;
        }
        const next = stored ?? fullHearts(clock.now());
        recordRef.current = next;
        setRecord(next);
        if (stored === null) {
          void repository.write(next).catch((cause: unknown) => {
            reportError(asError(cause), { operation: 'hearts.initialize' });
          });
        }
      })
      .catch((cause: unknown) => {
        // Design-preview economy state is non-critical to learning. Production
        // uses unlimited studying and never depends on this fallback.
        reportError(asError(cause), { operation: 'hearts.read' });
      });

    return () => {
      cancelled = true;
    };
  }, [clock, repository]);

  const value = useMemo<HeartsStoreValue>(() => {
    // `tick` is an explicit recompute signal from `refresh()`.
    void tick;
    const status = readHearts(record, clock.now(), { unlimited });

    return {
      ...status,
      grant: () => write(grantHeart(recordRef.current, clock.now())),
      refresh: () => setTick((value) => value + 1),
      spend: () => {
        if (!unlimited) {
          write(spendHeart(recordRef.current, clock.now()));
        }
      },
    };
  }, [clock, record, tick, unlimited, write]);

  return <HeartsContext.Provider value={value}>{children}</HeartsContext.Provider>;
}

export function useHearts(): HeartsStoreValue {
  const value = useContext(HeartsContext);
  if (value === null) {
    throw new Error('useHearts, HeartsProvider içinde çağrılmalı.');
  }

  return value;
}

function asError(cause: unknown): Error {
  return cause instanceof Error ? cause : new Error(String(cause));
}
