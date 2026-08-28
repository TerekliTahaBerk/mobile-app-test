import { render } from '@testing-library/react-native';
import type { ReactElement } from 'react';

import { HeartsProvider } from '@/modules/hearts/application/hearts-store';
import { LessonSessionProvider } from '@/modules/learning/application/lesson-session-store';

let tick = 0;

/** Fixed clock so rendered flows stay as deterministic as the domain tests. */
export function testClock(): string {
  tick += 1;

  return `2026-01-01T10:00:${String(tick).padStart(2, '0')}.000Z`;
}

/**
 * Renders a tree inside a live lesson session and hearts store, the way the app
 * mounts it. Neither provider is given a repository, so nothing touches SQLite.
 */
export function renderWithSession(ui: ReactElement) {
  return render(
    <LessonSessionProvider clock={testClock}>
      <HeartsProvider>{ui}</HeartsProvider>
    </LessonSessionProvider>,
  );
}
