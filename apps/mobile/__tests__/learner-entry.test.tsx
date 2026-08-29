import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import { Text } from 'react-native';

import {
  LearnerEntryGate,
  LearnerProfileProvider,
  needsOnboarding,
  useLearnerProfile,
} from '@/modules/learner/application/learner-profile-store';
import type { LearnerProfile } from '@/modules/learner/domain/learner-profile';
import type { LearnerProfileRepository } from '@/modules/progress/application/repositories';

let mockPathname = '/';

jest.mock('expo-router', () => ({
  Redirect: ({ href }: { href: string }) => {
    const { Text: NativeText } = jest.requireActual('react-native') as typeof import('react-native');
    return <NativeText testID="entry-redirect">{href}</NativeText>;
  },
  usePathname: () => mockPathname,
}));

const profile: LearnerProfile = {
  avatarId: 'initial',
  completedAtIso: '2026-08-28T10:00:00.000Z',
  dailyGoal: 3,
  displayName: 'Ege',
  exam: 'yks',
  grade: 'grade12',
  remindersEnabled: false,
  startingPoint: 'scratch',
  targetYear: 2027,
  weeklyReportDay: 0,
  track: 'verbal',
};

function SaveProfile() {
  const store = useLearnerProfile();
  return <Text onPress={() => store.save(profile)}>Kaydet</Text>;
}

function renderEntry(repository: LearnerProfileRepository, child = <Text>Ana Sayfa</Text>) {
  return render(
    <LearnerProfileProvider repository={repository}>
      <LearnerEntryGate>{child}</LearnerEntryGate>
    </LearnerProfileProvider>,
  );
}

describe('first-launch entry', () => {
  beforeEach(() => {
    mockPathname = '/';
  });

  it('waits for storage, then sends a fresh install to onboarding without showing Home', async () => {
    const repository: LearnerProfileRepository = {
      read: async () => null,
      write: async () => undefined,
    };

    await renderEntry(repository);

    expect(screen.queryByText('Ana Sayfa')).toBeNull();
    await waitFor(() => expect(screen.getByTestId('entry-redirect')).toHaveTextContent('/onboarding'));
  });

  it('opens the normal app when a supported profile already exists', async () => {
    const repository: LearnerProfileRepository = {
      read: async () => profile,
      write: async () => undefined,
    };

    await renderEntry(repository);

    await waitFor(() => expect(screen.getByText('Ana Sayfa')).toBeTruthy());
    expect(screen.queryByTestId('entry-redirect')).toBeNull();
  });

  it('persists completion before releasing onboarding', async () => {
    let stored: LearnerProfile | null = null;
    const repository: LearnerProfileRepository = {
      read: async () => stored,
      write: async (value) => {
        stored = value;
      },
    };
    mockPathname = '/onboarding';
    const first = await renderEntry(repository, <SaveProfile />);
    await waitFor(() => expect(screen.getByText('Kaydet')).toBeTruthy());
    await fireEvent.press(screen.getByText('Kaydet'));
    await waitFor(() => expect(stored).toEqual(profile));
    await waitFor(() => expect(screen.getByTestId('entry-redirect')).toHaveTextContent('/'));
    first.unmount();
  });

  it('treats unsupported legacy LGS profiles as needing onboarding', () => {
    const legacyProfile: LearnerProfile = {
      avatarId: profile.avatarId,
      completedAtIso: profile.completedAtIso,
      dailyGoal: profile.dailyGoal,
      displayName: profile.displayName,
      exam: 'lgs',
      grade: profile.grade,
      remindersEnabled: profile.remindersEnabled,
      startingPoint: profile.startingPoint,
      targetYear: profile.targetYear,
      weeklyReportDay: profile.weeklyReportDay,
    };
    expect(needsOnboarding(legacyProfile)).toBe(true);
    expect(needsOnboarding(profile)).toBe(false);
  });
});
