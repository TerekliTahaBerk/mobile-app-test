import { fireEvent, render, screen } from '@testing-library/react-native';

import { LessonScreen } from '@/modules/learning/ui/lesson-screen';

describe('lesson flow', () => {
  it('renders the first exercise with its HUD', async () => {
    await render(<LessonScreen onComplete={jest.fn()} onExit={jest.fn()} />);

    expect(screen.getByText('COĞRAFYA · İKLİM')).toBeTruthy();
    expect(screen.getByText(/en yüksek olduğu bölge/)).toBeTruthy();
    expect(screen.getByLabelText('4 can kaldı')).toBeTruthy();
    expect(screen.getByLabelText('Ders ilerlemesi')).toBeTruthy();
  });

  it('arms the check action only after an answer is chosen, then reveals the verdict', async () => {
    await render(<LessonScreen onComplete={jest.fn()} onExit={jest.fn()} />);

    expect(screen.getByTestId('mc-action').props.accessibilityState).toMatchObject({
      disabled: true,
    });
    expect(screen.queryByTestId('feedback-panel')).toBeNull();

    await fireEvent.press(screen.getByTestId('mc-option-A'));
    await fireEvent.press(screen.getByTestId('mc-action'));

    expect(screen.getByTestId('feedback-panel')).toBeTruthy();
    expect(screen.getByText('Doğru!')).toBeTruthy();
    // The verdict is spoken, not only coloured.
    expect(screen.getByLabelText(/Seçenek A\. Akdeniz Bölgesi\. Doğru yanıt/)).toBeTruthy();
  });

  it('names the wrong answer instead of signalling it with colour alone', async () => {
    await render(<LessonScreen onComplete={jest.fn()} onExit={jest.fn()} />);

    await fireEvent.press(screen.getByTestId('mc-option-B'));
    await fireEvent.press(screen.getByTestId('mc-action'));

    expect(screen.getByText('Doğrusu: Akdeniz Bölgesi')).toBeTruthy();
    expect(screen.getByLabelText(/Marmara Bölgesi\. Yanlış yanıt/)).toBeTruthy();
  });

  it('advances from the choice exercise to the word bank exercise', async () => {
    await render(<LessonScreen onComplete={jest.fn()} onExit={jest.fn()} />);

    await fireEvent.press(screen.getByTestId('mc-option-A'));
    await fireEvent.press(screen.getByTestId('mc-action'));
    await fireEvent.press(screen.getByTestId('mc-action'));

    expect(screen.getByText('Cümleyi tamamla')).toBeTruthy();
  });

  it('confirms before leaving and only then exits', async () => {
    const onExit = jest.fn();

    await render(<LessonScreen onComplete={jest.fn()} onExit={onExit} />);

    expect(screen.queryByTestId('exit-confirm-sheet')).toBeNull();

    await fireEvent.press(screen.getByTestId('lesson-close'));
    expect(screen.getByTestId('exit-confirm-sheet')).toBeTruthy();
    expect(onExit).not.toHaveBeenCalled();

    // Staying keeps the learner in the lesson.
    await fireEvent.press(screen.getByTestId('exit-stay'));
    expect(screen.queryByTestId('exit-confirm-sheet')).toBeNull();

    await fireEvent.press(screen.getByTestId('lesson-close'));
    await fireEvent.press(screen.getByTestId('exit-confirm'));

    expect(onExit).toHaveBeenCalledTimes(1);
  });
});
