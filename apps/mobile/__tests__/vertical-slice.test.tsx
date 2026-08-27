import { fireEvent, screen } from '@testing-library/react-native';
import { useEffect, useState } from 'react';

import {
  KURULTAY_LESSON_ID,
  KURULTAY_PATH_NODE_ID,
} from '@/modules/curriculum/content/tyt-social-draft-bundle';
import { useLessonSession } from '@/modules/learning/application/lesson-session-store';
import { XP_POLICY_V1 } from '@/modules/learning/domain/xp-policy';
import { LessonCompleteScreen } from '@/modules/learning/ui/lesson-complete-screen';
import { LessonScreen } from '@/modules/learning/ui/lesson-screen';
import { renderWithSession } from './support/render-with-session';

/**
 * Drives the whole connected slice through the real screens: lesson, every
 * exercise, then the completion screen. This is the integration boundary the
 * domain tests cannot cover — that the UI hands the right answers to the engine
 * and renders back what the engine actually computed.
 */
function SliceHarness() {
  const { begin, lesson } = useLessonSession();
  const [done, setDone] = useState(false);

  useEffect(() => {
    begin(KURULTAY_LESSON_ID, KURULTAY_PATH_NODE_ID);
  }, [begin]);

  if (lesson === null) {
    return null;
  }

  if (done) {
    return <LessonCompleteScreen onCollect={jest.fn()} />;
  }

  return <LessonScreen onComplete={() => setDone(true)} onExit={jest.fn()} />;
}

async function answerFlashcards() {
  for (let i = 0; i < 3; i += 1) {
    await fireEvent.press(screen.getByTestId('flashcard-known'));
  }
  await fireEvent.press(screen.getByTestId('flashcard-continue'));
}

async function answerMultipleChoice(marker: string) {
  await fireEvent.press(screen.getByTestId(`mc-option-${marker}`));
  await fireEvent.press(screen.getByTestId('mc-action'));
  await fireEvent.press(screen.getByTestId('mc-action'));
}

async function answerFillBlank(correct: boolean) {
  const order = correct
    ? ['Kurultay', 'devlet', 'işlerinin', 'görüşüldüğü', 'meclistir']
    : ['ordunun'];

  for (const label of order) {
    await fireEvent.press(screen.getByLabelText(label));
  }
  await fireEvent.press(screen.getByTestId('word-bank-action'));
  await fireEvent.press(screen.getByTestId('word-bank-action'));
}

async function answerMatching() {
  const pairs: readonly [string, string][] = [
    ['pair-kurultay', 'Meclis'],
    ['pair-tore', 'Gelenek hukuku'],
    ['pair-kut', 'Yönetme yetkisi'],
    ['pair-ayguci', 'Vezir'],
  ];

  for (const [leftId, rightLabel] of pairs) {
    await fireEvent.press(screen.getByTestId(`match-left-${leftId}`));
    await fireEvent.press(screen.getByTestId(`match-right-${rightLabel}`));
  }
  await fireEvent.press(screen.getByTestId('matching-action'));
  await fireEvent.press(screen.getByTestId('matching-action'));
}

describe('connected vertical slice', () => {
  it('plays the whole lesson and reports the engine’s real numbers', async () => {
    await renderWithSession(<SliceHarness />);

    await answerFlashcards();
    await answerMultipleChoice('A');
    await answerFillBlank(true);
    await answerMatching();
    await answerMultipleChoice('D');

    expect(screen.getByTestId('lesson-complete-screen')).toBeTruthy();
    expect(screen.getByText('İlk Türk Devletleri · Kurultay')).toBeTruthy();

    const expectedXp = 4 * XP_POLICY_V1.correctExercise + XP_POLICY_V1.lessonCompletion;
    expect(screen.getByLabelText(`KAZANILAN XP: ${expectedXp}`)).toBeTruthy();
    expect(screen.getByLabelText('İSABET: %100')).toBeTruthy();
    expect(screen.getByLabelText('DOĞRU: 4/4')).toBeTruthy();
    expect(screen.getByLabelText('5 alıştırma tamamlandı')).toBeTruthy();
  });

  it('reports a lower score when the learner misses one, without hardcoding it', async () => {
    await renderWithSession(<SliceHarness />);

    await answerFlashcards();
    await answerMultipleChoice('B'); // wrong
    await answerFillBlank(true);
    await answerMatching();
    await answerMultipleChoice('D');

    const expectedXp = 3 * XP_POLICY_V1.correctExercise + XP_POLICY_V1.lessonCompletion;
    expect(screen.getByLabelText(`KAZANILAN XP: ${expectedXp}`)).toBeTruthy();
    expect(screen.getByLabelText('İSABET: %75')).toBeTruthy();
    expect(screen.getByLabelText('DOĞRU: 3/4')).toBeTruthy();
  });
});
