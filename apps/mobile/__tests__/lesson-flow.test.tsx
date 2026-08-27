import { fireEvent, screen } from '@testing-library/react-native';
import { useEffect } from 'react';

import { KURULTAY_LESSON_ID, KURULTAY_PATH_NODE_ID } from '@/modules/curriculum/content/tyt-social-draft-bundle';
import { useLessonSession } from '@/modules/learning/application/lesson-session-store';
import { LessonScreen } from '@/modules/learning/ui/lesson-screen';
import { renderWithSession } from './support/render-with-session';

/** Opens the real lesson, then hands over to the lesson screen. */
function LessonHarness({
  onComplete = jest.fn(),
  onExit = jest.fn(),
}: {
  onComplete?: () => void;
  onExit?: () => void;
}) {
  const { begin, lesson } = useLessonSession();

  useEffect(() => {
    begin(KURULTAY_LESSON_ID, KURULTAY_PATH_NODE_ID);
  }, [begin]);

  if (lesson === null) {
    return null;
  }

  return <LessonScreen onComplete={onComplete} onExit={onExit} />;
}

/** Works through the opening flashcard deck to reach the first scored exercise. */
async function clearFlashcardDeck() {
  for (let i = 0; i < 3; i += 1) {
    await fireEvent.press(screen.getByTestId('flashcard-known'));
  }
  await fireEvent.press(screen.getByTestId('flashcard-continue'));
}

describe('lesson flow on real content', () => {
  it('opens on the real flashcard deck with its HUD', async () => {
    await renderWithSession(<LessonHarness />);

    expect(screen.getByText('TARİH · KAVRAMLAR')).toBeTruthy();
    expect(screen.getByText('Kurultay')).toBeTruthy();
    expect(screen.getByLabelText('Ders ilerlemesi')).toBeTruthy();
  });

  it('reaches the real multiple choice after the deck', async () => {
    await renderWithSession(<LessonHarness />);
    await clearFlashcardDeck();

    expect(screen.getByText(/kurultayın temel işlevi/)).toBeTruthy();
    expect(screen.getByLabelText('4 can kaldı')).toBeTruthy();
  });

  it('arms the check action only after an answer is chosen, then evaluates it', async () => {
    await renderWithSession(<LessonHarness />);
    await clearFlashcardDeck();

    expect(screen.getByTestId('mc-action').props.accessibilityState).toMatchObject({
      disabled: true,
    });
    expect(screen.queryByTestId('feedback-panel')).toBeNull();

    await fireEvent.press(screen.getByTestId('mc-option-A'));
    await fireEvent.press(screen.getByTestId('mc-action'));

    expect(screen.getByTestId('feedback-panel')).toBeTruthy();
    expect(screen.getByText('Doğru!')).toBeTruthy();
    // The verdict is spoken, not only coloured.
    expect(screen.getByLabelText(/Devlet işlerinin görüşülüp karara bağlanması\. Doğru yanıt/)).toBeTruthy();
  });

  it('names the right answer when the learner misses', async () => {
    await renderWithSession(<LessonHarness />);
    await clearFlashcardDeck();

    await fireEvent.press(screen.getByTestId('mc-option-D'));
    await fireEvent.press(screen.getByTestId('mc-action'));

    expect(screen.getByText(/Doğrusu: Devlet işlerinin görüşülüp karara bağlanması/)).toBeTruthy();
    // The explanation comes from the content record, not the screen.
    expect(screen.getByText(/yürütmenin görevidir/)).toBeTruthy();
  });

  it('advances from the choice exercise to the real fill-blank exercise', async () => {
    await renderWithSession(<LessonHarness />);
    await clearFlashcardDeck();

    await fireEvent.press(screen.getByTestId('mc-option-A'));
    await fireEvent.press(screen.getByTestId('mc-action'));
    await fireEvent.press(screen.getByTestId('mc-action'));

    expect(screen.getByText('Cümleyi tamamla')).toBeTruthy();
    expect(screen.getByText('Kurultayın tanımı')).toBeTruthy();
  });

  it('confirms before leaving and only then exits', async () => {
    const onExit = jest.fn();

    await renderWithSession(<LessonHarness onExit={onExit} />);

    expect(screen.queryByTestId('exit-confirm-sheet')).toBeNull();

    await fireEvent.press(screen.getByTestId('lesson-close'));
    expect(screen.getByTestId('exit-confirm-sheet')).toBeTruthy();
    expect(onExit).not.toHaveBeenCalled();

    await fireEvent.press(screen.getByTestId('exit-stay'));
    expect(screen.queryByTestId('exit-confirm-sheet')).toBeNull();

    await fireEvent.press(screen.getByTestId('lesson-close'));
    await fireEvent.press(screen.getByTestId('exit-confirm'));

    expect(onExit).toHaveBeenCalledTimes(1);
  });
});
