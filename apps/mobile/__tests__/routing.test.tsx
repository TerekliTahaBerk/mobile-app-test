import { fireEvent, render, screen } from '@testing-library/react-native';

import GorevlerRoute from '@/app/gorevler';
import IndexRoute from '@/app/index';
import IzRoute from '@/app/iz';
import LessonCompleteRoute from '@/app/lesson-complete';
import LessonIntroRoute from '@/app/lesson-intro';

const mockBack = jest.fn();
const mockDismissTo = jest.fn();
const mockPush = jest.fn();
const mockReplace = jest.fn();

jest.mock('expo-router', () => ({
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

  it('sends the home path CTA into the lesson intro', async () => {
    await render(<IndexRoute />);

    await fireEvent.press(screen.getByTestId('path-node-node-tanzimat-fermani'));
    await fireEvent.press(screen.getByTestId('level-detail-cta'));

    expect(mockPush).toHaveBeenCalledWith('/lesson-intro');
  });

  it('opens the quest board from the tab bar', async () => {
    await render(<IndexRoute />);

    await fireEvent.press(screen.getByTestId('tab-gorev'));

    expect(mockPush).toHaveBeenCalledWith('/gorevler');
  });

  it('continues from the lesson intro into the lesson and back to the path', async () => {
    await render(<LessonIntroRoute />);

    await fireEvent.press(screen.getByTestId('lesson-intro-cta'));
    expect(mockReplace).toHaveBeenCalledWith('/lesson');

    await fireEvent.press(screen.getByTestId('lesson-intro-back'));
    expect(mockBack).toHaveBeenCalledTimes(1);
  });

  it('collects the lesson reward and moves on to the İz celebration', async () => {
    await render(<LessonCompleteRoute />);

    await fireEvent.press(screen.getByTestId('lesson-complete-cta'));

    expect(mockReplace).toHaveBeenCalledWith('/iz');
  });

  it('returns to the path from the İz celebration', async () => {
    await render(<IzRoute />);

    await fireEvent.press(screen.getByTestId('iz-continue'));

    expect(mockDismissTo).toHaveBeenCalledWith('/');
  });

  it('closes the quest board back to where it came from', async () => {
    await render(<GorevlerRoute />);

    await fireEvent.press(screen.getByTestId('quests-close'));

    expect(mockBack).toHaveBeenCalledTimes(1);
  });
});
