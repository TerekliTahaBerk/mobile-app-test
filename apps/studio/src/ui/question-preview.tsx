import type { ExerciseDefinition, ExerciseKind } from '@/modules/curriculum/domain/content-types';
import {
  describeCorrectAnswer,
  describePrompt,
} from '@/modules/learning/domain/evaluator-registry';

import { EXERCISE_KIND_LABELS } from '../model/exercise-fields';

type Row = Readonly<Record<string, unknown>>;

/**
 * The question as it will be asked.
 *
 * Deliberately not a picture of the app: reproducing the native screens on the
 * web would be a second renderer that drifts from the first. This shows what
 * the learner is asked, what counts as correct, and why — read from the app's
 * own describers, so the tool and the feedback sheet cannot disagree.
 */
export function QuestionPreview({ exercise }: { exercise: Row }) {
  const kind = String(exercise.kind) as ExerciseKind;
  const described = describe(exercise);

  return (
    <div className="preview">
      <header>
        <span className="kind">{EXERCISE_KIND_LABELS[kind] ?? kind}</span>
        <span className="muted">Önizleme · sorulan içerik, uygulamanın görseli değil</span>
      </header>

      {described === null ? (
        <p className="warning">
          Bu kayıt henüz okunabilir değil. Doğrulama sorunlarını giderdiğinde önizleme açılır.
        </p>
      ) : (
        <>
          <h2>{described.prompt}</h2>
          <Body exercise={exercise} kind={kind} />
          <section className="answer">
            <span className="field-label">Doğru cevap</span>
            <p>{described.correctAnswer === '' ? 'Puanlanmıyor' : described.correctAnswer}</p>
          </section>
        </>
      )}

      <section className="answer">
        <span className="field-label">Açıklama</span>
        <p>{String(exercise.explanation ?? '—')}</p>
      </section>
    </div>
  );
}

function Body({ exercise, kind }: { exercise: Row; kind: ExerciseKind }) {
  switch (kind) {
    case 'multipleChoice':
      return (
        <ol className="choices">
          {rows(exercise.options).map((option, index) => (
            <li
              className={option.id === exercise.correctOptionId ? 'right' : undefined}
              key={`${String(option.id)}-${index}`}
            >
              {String(option.label ?? '')}
            </li>
          ))}
        </ol>
      );

    case 'trueFalse':
      return (
        <ol className="choices">
          <li className={exercise.correctAnswer === true ? 'right' : undefined}>Doğru</li>
          <li className={exercise.correctAnswer === false ? 'right' : undefined}>Yanlış</li>
        </ol>
      );

    case 'fillBlank':
      return (
        <>
          <p className="muted">{String(exercise.hint ?? '')}</p>
          <ul className="chips">
            {rows(exercise.bank).map((token, index) => (
              <li key={`${String(token.id)}-${index}`}>{String(token.label ?? '')}</li>
            ))}
          </ul>
        </>
      );

    case 'matching':
      return (
        <table className="records">
          <tbody>
            {rows(exercise.pairs).map((pair, index) => (
              <tr key={`${String(pair.id)}-${index}`}>
                <td>{String(pair.left ?? '')}</td>
                <td className="muted">→</td>
                <td>{String(pair.right ?? '')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      );

    case 'ordering':
      return (
        <ul className="chips">
          {rows(exercise.items).map((item, index) => (
            <li key={`${String(item.id)}-${index}`}>{String(item.label ?? '')}</li>
          ))}
        </ul>
      );

    case 'flashcard':
      return (
        <table className="records">
          <thead>
            <tr>
              <th>Ön yüz</th>
              <th>Arka yüz</th>
              <th>İpucu</th>
            </tr>
          </thead>
          <tbody>
            {rows(exercise.cards).map((card, index) => (
              <tr key={`${String(card.id)}-${index}`}>
                <td>{String(card.front ?? '')}</td>
                <td>{String(card.back ?? '')}</td>
                <td className="muted">{String(card.hint ?? '')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      );

    default:
      return null;
  }
}

/**
 * Reads the question and its answer through the app's describers. A record that
 * is still being written may not survive them, which is not an error worth
 * shouting about — the validation panel is already saying so.
 */
function describe(exercise: Row): { correctAnswer: string; prompt: string } | null {
  try {
    const typed = exercise as unknown as ExerciseDefinition;

    return { correctAnswer: describeCorrectAnswer(typed), prompt: describePrompt(typed) };
  } catch {
    return null;
  }
}

function rows(value: unknown): readonly Row[] {
  return Array.isArray(value) ? (value.filter((entry) => typeof entry === 'object' && entry !== null) as Row[]) : [];
}
