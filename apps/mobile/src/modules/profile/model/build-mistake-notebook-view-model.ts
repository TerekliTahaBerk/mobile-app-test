import type {
  MistakeCard,
  MistakeNotebookViewModel,
} from '@/modules/profile/model/mistake-notebook-view-model';
import type { MistakeEntry, MistakeNotebook } from '@/modules/progress/domain/mistake-notebook';

export function buildMistakeNotebookViewModel(
  notebook: MistakeNotebook,
): MistakeNotebookViewModel {
  const cards = notebook.entries.map(toCard);

  return {
    headline: `${notebook.openCount} açık · ${notebook.learnedCount} öğrenildi`,
    learned: cards.filter((card) => card.learned),
    note: 'Bir yanlış silinmez. Aynı kazanımda temiz bir tekrar cevabı verdiğinde kendiliğinden kapanır.',
    open: cards.filter((card) => !card.learned),
  };
}

function toCard(entry: MistakeEntry): MistakeCard {
  return {
    correctAnswer: entry.correctAnswer,
    explanation: entry.explanation,
    givenAnswer: entry.givenAnswer,
    id: entry.id,
    lastSeenLabel: entry.lastSeenAt === null ? null : `Son çalışma ${shortDate(entry.lastSeenAt)}`,
    learned: entry.status === 'learned',
    openedLabel:
      entry.status === 'learned' && entry.resolvedAt !== null
        ? `${shortDate(entry.resolvedAt)} tarihinde kapandı`
        : `${shortDate(entry.openedAt)} tarihinde açıldı`,
    prompt: entry.prompt,
    skillTitle: entry.skillTitle,
    statusLabel: entry.status === 'learned' ? 'Artık öğrendim' : 'Tekrar gerekli',
    subtopicId: entry.subtopicId,
    taxonomyLabel: `${entry.mainTopicTitle} · ${entry.subtopicTitle}`,
    wrongCountLabel: `${entry.wrongCount} kez yanlış`,
  };
}

function shortDate(atIso: string): string {
  return new Intl.DateTimeFormat('tr-TR', { day: 'numeric', month: 'short' }).format(
    new Date(atIso),
  );
}
