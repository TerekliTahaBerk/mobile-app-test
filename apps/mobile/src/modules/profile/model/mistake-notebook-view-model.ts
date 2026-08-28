export type MistakeCard = {
  correctAnswer: string;
  explanation: string;
  /** Absent when the stored answer can no longer be read back. */
  givenAnswer: string | null;
  id: string;
  lastSeenLabel: string | null;
  learned: boolean;
  openedLabel: string;
  prompt: string;
  skillTitle: string;
  statusLabel: string;
  subtopicId: string;
  /** "İlk ve Orta Çağlarda Türk Dünyası · Kut ve Töre" */
  taxonomyLabel: string;
  /** "2 kez yanlış" */
  wrongCountLabel: string;
};

export type MistakeNotebookViewModel = {
  /** Mistakes still to be closed, most-missed first. */
  open: readonly MistakeCard[];
  /** Closed by a clean repeat answer, not by the learner. */
  learned: readonly MistakeCard[];
  /** "3 açık · 5 öğrenildi" */
  headline: string;
  /** How a mistake closes, said plainly so the missing delete button reads as a rule. */
  note: string;
};
