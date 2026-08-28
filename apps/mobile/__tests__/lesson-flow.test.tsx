import { fireEvent, screen } from '@testing-library/react-native';
import { useEffect } from 'react';

import { useLessonSession } from '@/modules/learning/application/lesson-session-store';
import { LessonScreen } from '@/modules/learning/ui/lesson-screen';
import { renderWithSession } from './support/render-with-session';

/** Opens a real lesson from the bundle, then hands over to the lesson screen. */
function LessonHarness({
  lessonId = 'lesson.history.states.001',
  onComplete = jest.fn(),
  onExit = jest.fn(),
  onWrongAnswer,
}: {
  lessonId?: string;
  onComplete?: () => void;
  onExit?: () => void;
  onWrongAnswer?: () => void;
}) {
  const { begin, lesson } = useLessonSession();

  useEffect(() => {
    begin(lessonId, 'path.history.first-turkish-states.01');
  }, [begin, lessonId]);

  if (lesson === null) {
    return null;
  }

  return (
    <LessonScreen
      hearts={5}
      onComplete={onComplete}
      onExit={onExit}
      onWrongAnswer={onWrongAnswer}
    />
  );
}

/** Works through the opening flashcard deck to reach the first scored exercise. */
async function clearFlashcardDeck(cards: number) {
  for (let i = 0; i < cards; i += 1) {
    await fireEvent.press(screen.getByTestId('flashcard-known'));
  }
}

describe('lesson flow on real content', () => {
  it('opens on the real flashcard deck with its chrome', async () => {
    await renderWithSession(<LessonHarness />);

    expect(screen.getByText('TARİH · DEVLETLER')).toBeTruthy();
    expect(screen.getByText('ASYA HUN DEVLETİ')).toBeTruthy();
    expect(screen.getByLabelText('Çalışma ilerlemesi')).toBeTruthy();
    // The deck counts cards rather than hearts: a self-reported card is not
    // scored, so it can never cost one.
    expect(screen.getByText('1 / 3')).toBeTruthy();
  });

  it('flips a card without scoring it', async () => {
    await renderWithSession(<LessonHarness />);

    await fireEvent.press(screen.getByTestId('flashcard'));

    expect(screen.getByText(/Mete Han döneminde ordu düzeniyle/)).toBeTruthy();
    expect(screen.queryByTestId('feedback-sheet')).toBeNull();
  });

  it('reaches the real multiple choice after the deck', async () => {
    await renderWithSession(<LessonHarness />);
    await clearFlashcardDeck(3);

    expect(screen.getByText('Orhun Yazıtları hangi Türk devletine aittir?')).toBeTruthy();
  });

  it('arms the check action only after an answer is chosen, then evaluates it', async () => {
    await renderWithSession(<LessonHarness />);
    await clearFlashcardDeck(3);

    expect(screen.getByTestId('check-answer').props.accessibilityState).toMatchObject({
      disabled: true,
    });
    expect(screen.queryByTestId('feedback-sheet')).toBeNull();

    await fireEvent.press(screen.getByTestId('option-opt-gokturk'));
    await fireEvent.press(screen.getByTestId('check-answer'));

    expect(screen.getByTestId('feedback-sheet')).toBeTruthy();
    expect(screen.getByText('Doğru!')).toBeTruthy();
    // The verdict is spoken, not only coloured.
    expect(screen.getByLabelText(/II\. Göktürk Devleti\. doğru cevap/)).toBeTruthy();
  });

  it('names the right answer and its reason when the learner misses', async () => {
    const onWrongAnswer = jest.fn();

    await renderWithSession(<LessonHarness onWrongAnswer={onWrongAnswer} />);
    await clearFlashcardDeck(3);

    await fireEvent.press(screen.getByTestId('option-opt-uygur'));
    await fireEvent.press(screen.getByTestId('check-answer'));

    expect(screen.getByText('Olmadı.')).toBeTruthy();
    expect(screen.getByText(/Doğru cevap: II\. Göktürk Devleti/)).toBeTruthy();
    // The explanation comes from the content record, not the screen.
    expect(screen.getByText(/Göktürk alfabesiyle yazılmıştır/)).toBeTruthy();
    expect(onWrongAnswer).not.toHaveBeenCalled();

    await fireEvent.press(screen.getByTestId('feedback-continue'));

    expect(onWrongAnswer).toHaveBeenCalledTimes(1);
  });

  it('confirms before leaving and only then exits', async () => {
    const onExit = jest.fn();

    await renderWithSession(<LessonHarness onExit={onExit} />);

    expect(screen.queryByTestId('exit-confirm-sheet')).toBeNull();

    await fireEvent.press(screen.getByTestId('lesson-exit'));
    expect(screen.getByTestId('exit-confirm-sheet')).toBeTruthy();
    expect(onExit).not.toHaveBeenCalled();

    await fireEvent.press(screen.getByTestId('exit-cancel'));
    expect(screen.queryByTestId('exit-confirm-sheet')).toBeNull();

    await fireEvent.press(screen.getByTestId('lesson-exit'));
    await fireEvent.press(screen.getByTestId('exit-confirm'));

    expect(onExit).toHaveBeenCalledTimes(1);
  });
});

describe('true/false and ordering renderers', () => {
  it('scores a true/false statement and explains the verdict', async () => {
    await renderWithSession(<LessonHarness lessonId="lesson.history.time.001" />);
    await clearFlashcardDeck(3);

    // Skip the multiple choice that sits between the deck and the statement.
    await fireEvent.press(screen.getByTestId('option-opt-moon'));
    await fireEvent.press(screen.getByTestId('check-answer'));
    await fireEvent.press(screen.getByTestId('feedback-continue'));

    expect(screen.getByText('Hicri yıl ile miladi yıl aynı uzunluktadır.')).toBeTruthy();

    await fireEvent.press(screen.getByTestId('truefalse-false'));
    await fireEvent.press(screen.getByTestId('check-answer'));

    expect(screen.getByText('Doğru!')).toBeTruthy();
  });

  it('holds the ordering check until every slot is filled', async () => {
    await renderWithSession(<LessonHarness lessonId="lesson.history.chronology.001" />);

    expect(screen.getByTestId('check-answer').props.accessibilityState).toMatchObject({
      disabled: true,
    });

    await fireEvent.press(screen.getByTestId('order-item-item-hun'));
    await fireEvent.press(screen.getByTestId('order-item-item-gokturk'));

    expect(screen.getByTestId('check-answer').props.accessibilityState).toMatchObject({
      disabled: true,
    });

    await fireEvent.press(screen.getByTestId('order-item-item-uygur'));
    await fireEvent.press(screen.getByTestId('check-answer'));

    expect(screen.getByText('Doğru!')).toBeTruthy();
  });
});
