import { fireEvent, render, screen } from '@testing-library/react-native';

import { KURULTAY_LESSON_ID, KURULTAY_PATH_NODE_ID } from '@/modules/curriculum/content/tyt-social-draft-bundle';
import { renderWithSession } from './support/render-with-session';

import GorevlerRoute from '@/app/gorevler';
import IndexRoute from '@/app/index';
import IzRoute from '@/app/iz';
import LessonCompleteRoute from '@/app/lesson-complete';
import LessonIntroRoute from '@/app/lesson-intro';
import LigRoute from '@/app/lig';
import MagazaRoute from '@/app/magaza';
import ProfilRoute from '@/app/profil';

const mockBack = jest.fn();
const mockDismissTo = jest.fn();
const mockPush = jest.fn();
const mockReplace = jest.fn();

jest.mock('expo-router', () => ({
  Redirect: () => null,
  useLocalSearchParams: () => ({ lessonId: 'lesson.history.kurultay.001' }),
  useRouter: () => ({
    back: mockBack,
    dismissTo: mockDismissTo,
    push: mockPush,
    replace: mockReplace,
  }),
}));

describe('routes', () => {
  beforeEach(() => {
    mockBack.mockClear();
    mockDismissTo.mockClear();
    mockPush.mockClear();
    mockReplace.mockClear();
  });

  it('sends the home path CTA into the lesson intro with the real lesson id', async () => {
    await renderWithSession(<IndexRoute />);

    await fireEvent.press(screen.getByTestId(`path-node-${KURULTAY_PATH_NODE_ID}`));
    await fireEvent.press(screen.getByTestId('level-detail-cta'));

    expect(mockPush).toHaveBeenCalledWith({
      params: { lessonId: KURULTAY_LESSON_ID },
      pathname: '/lesson-intro',
    });
  });

  it('continues from the lesson intro into the lesson and back to the path', async () => {
    await renderWithSession(<LessonIntroRoute />);

    await fireEvent.press(screen.getByTestId('lesson-intro-cta'));
    expect(mockReplace).toHaveBeenCalledWith('/lesson');

    await fireEvent.press(screen.getByTestId('lesson-intro-back'));
    expect(mockBack).toHaveBeenCalledTimes(1);
  });

  it('returns to the path from the İz celebration', async () => {
    await render(<IzRoute />);

    await fireEvent.press(screen.getByTestId('iz-continue'));

    expect(mockDismissTo).toHaveBeenCalledWith('/');
  });

  it('closes the quest board back to the path', async () => {
    await render(<GorevlerRoute />);

    await fireEvent.press(screen.getByTestId('quests-close'));

    expect(mockReplace).toHaveBeenCalledWith('/');
  });
});

describe('shell tabs', () => {
  beforeEach(() => {
    mockReplace.mockClear();
  });

  it('swaps sections rather than stacking them', async () => {
    await renderWithSession(<IndexRoute />);

    await fireEvent.press(screen.getByTestId('tab-gorev'));
    await fireEvent.press(screen.getByTestId('tab-profil'));

    expect(mockReplace.mock.calls.map(([route]) => route)).toEqual(['/gorevler', '/profil']);
  });

  it('does not re-navigate when the active tab is tapped', async () => {
    await renderWithSession(<IndexRoute />);

    await fireEvent.press(screen.getByTestId('tab-yol'));

    expect(mockReplace).not.toHaveBeenCalled();
  });

  it('routes the league and profile tabs to their own entry points', async () => {
    await render(<LigRoute />);
    await fireEvent.press(screen.getByTestId('tab-profil'));
    expect(mockReplace).toHaveBeenCalledWith('/profil');

    mockReplace.mockClear();

    await render(<ProfilRoute />);
    await fireEvent.press(screen.getByTestId('tab-lig'));
    expect(mockReplace).toHaveBeenCalledWith('/lig');
  });

  it('closes the store back to the path', async () => {
    await render(<MagazaRoute />);

    await fireEvent.press(screen.getByTestId('store-close'));

    expect(mockReplace).toHaveBeenCalledWith('/');
  });
});
