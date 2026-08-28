import { fireEvent, render, screen } from '@testing-library/react-native';

import { buildMistakeNotebookViewModel } from '@/modules/profile/model/build-mistake-notebook-view-model';
import { MistakeNotebookScreen } from '@/modules/profile/ui/mistake-notebook-screen';
import type { MistakeEntry, MistakeNotebook } from '@/modules/progress/domain/mistake-notebook';

function entry(overrides: Partial<MistakeEntry> = {}): MistakeEntry {
  return {
    correctAnswer: 'Ay yılı esaslı olması',
    explanation: 'Hicri takvim ay yılı esaslıdır.',
    exerciseId: 'exercise.history.time.001.mcq01',
    givenAnswer: 'Güneş yılı esaslı olması',
    id: 'mistake:session-1:skill',
    lastSeenAt: '2026-08-27T09:00:00.000Z',
    mainTopicTitle: 'Tarih ve Zaman',
    openedAt: '2026-08-20T09:00:00.000Z',
    prompt: 'Hicri takvimi miladi takvimden ayıran temel özellik nedir?',
    resolvedAt: null,
    skillId: 'skill.history.calendar',
    skillTitle: 'Takvim türlerini ayırt etme',
    status: 'open',
    subtopicId: 'tyt.history.time-and-history.measuring-time',
    subtopicTitle: 'Zamanı Ölçmek',
    wrongCount: 2,
    ...overrides,
  };
}

function notebookOf(entries: readonly MistakeEntry[]): MistakeNotebook {
  return {
    entries,
    learnedCount: entries.filter((item) => item.status === 'learned').length,
    openCount: entries.filter((item) => item.status === 'open').length,
  };
}

function renderNotebook(
  entries: readonly MistakeEntry[],
  overrides: Partial<Parameters<typeof MistakeNotebookScreen>[0]> = {},
) {
  return render(
    <MistakeNotebookScreen
      onBack={jest.fn()}
      onStartPractice={jest.fn()}
      viewModel={buildMistakeNotebookViewModel(notebookOf(entries))}
      {...overrides}
    />,
  );
}

describe('mistake notebook', () => {
  it('shows the question with both answers and the explanation', async () => {
    await renderNotebook([entry()]);

    expect(
      screen.getByText('Hicri takvimi miladi takvimden ayıran temel özellik nedir?'),
    ).toBeTruthy();
    expect(screen.getByText('Güneş yılı esaslı olması')).toBeTruthy();
    expect(screen.getByText('Ay yılı esaslı olması')).toBeTruthy();
    expect(screen.getByText('Hicri takvim ay yılı esaslıdır.')).toBeTruthy();
    expect(screen.getByText('Tarih ve Zaman · Zamanı Ölçmek')).toBeTruthy();
    expect(screen.getByText('2 kez yanlış')).toBeTruthy();
  });

  it('offers no way to delete a mistake and says how one closes', async () => {
    await renderNotebook([entry()]);

    expect(
      screen.getByText(
        'Bir yanlış silinmez. Aynı kazanımda temiz bir tekrar cevabı verdiğinde kendiliğinden kapanır.',
      ),
    ).toBeTruthy();
    expect(screen.queryByText('Sil')).toBeNull();
    expect(screen.queryByText('Artık öğrendim olarak işaretle')).toBeNull();
  });

  it('separates what is still open from what was closed by a clean answer', async () => {
    await renderNotebook([
      entry(),
      entry({
        id: 'learned',
        resolvedAt: '2026-08-27T09:00:00.000Z',
        status: 'learned',
      }),
    ]);

    expect(screen.getByText('Çalışılacak yanlışlar')).toBeTruthy();
    expect(screen.getByText('Artık öğrendiklerin')).toBeTruthy();
    expect(screen.getByText('Artık öğrendim')).toBeTruthy();
    expect(screen.getByText('Tekrar gerekli')).toBeTruthy();
  });

  it('opens a similar question from the subtopic the mistake belongs to', async () => {
    const onStartPractice = jest.fn();

    await renderNotebook([entry()], { onStartPractice });
    await fireEvent.press(screen.getByTestId('mistake-practice-mistake:session-1:skill'));

    expect(onStartPractice).toHaveBeenCalledWith('tyt.history.time-and-history.measuring-time');
  });

  it('omits the answer row when the stored answer can no longer be read', async () => {
    await renderNotebook([entry({ givenAnswer: null })]);

    expect(screen.queryByText('Senin cevabın')).toBeNull();
    expect(screen.getByText('Doğru cevap')).toBeTruthy();
  });

  it('says the notebook is empty rather than showing an empty list', async () => {
    await renderNotebook([]);

    expect(screen.getByTestId('mistake-notebook-empty')).toBeTruthy();
  });
});
