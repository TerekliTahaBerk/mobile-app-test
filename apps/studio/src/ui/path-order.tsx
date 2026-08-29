import { useReorder } from './reorderable';

export type PathStepRow = {
  id: string;
  lessonTitle: string;
  questionCount: number;
  topicTitle: string;
};

type PathOrderProps = {
  onMove: (unitId: string, from: number, to: number) => void;
  units: readonly { id: string; steps: readonly PathStepRow[]; title: string }[];
};

/**
 * The order the learner meets the unit in.
 *
 * A unit's path is one chain across all its topics, so it cannot be reordered
 * from inside a topic without lying about what the list is. It gets its own
 * view, where the question is only "what comes after what".
 */
export function PathOrder({ onMove, units }: PathOrderProps) {
  return (
    <section className="path-order">
      <h2>Yol sırası</h2>
      <p className="muted">
        Öğrencinin adımları bu sırayla açar. Sürükleyerek ya da oklarla değiştir; her adım bir
        önceki tamamlanınca açılır.
      </p>
      {units.map((unit) => (
        <UnitPath key={unit.id} onMove={onMove} unit={unit} />
      ))}
    </section>
  );
}

function UnitPath({
  onMove,
  unit,
}: {
  onMove: (unitId: string, from: number, to: number) => void;
  unit: { id: string; steps: readonly PathStepRow[]; title: string };
}) {
  const dragProps = useReorder((from, to) => onMove(unit.id, from, to));

  return (
    <article>
      <h3>{unit.title}</h3>
      {unit.steps.length === 0 ? (
        <p className="tree-empty">Bu ünitede henüz adım yok.</p>
      ) : (
        <ol className="steps">
          {unit.steps.map((step, index) => {
            const { className, ...handlers } = dragProps(index);

            return (
              <li className={className} key={step.id} {...handlers}>
                <span className="step-index">{index + 1}</span>
                <span className="step-body">
                  <strong>{step.lessonTitle}</strong>
                  <span className="muted">
                    {step.topicTitle} · {step.questionCount} soru
                  </span>
                </span>
                <span className="row">
                  <button
                    aria-label="Yukarı taşı"
                    className="icon"
                    disabled={index === 0}
                    onClick={() => onMove(unit.id, index, index - 1)}
                    title="Yukarı taşı"
                    type="button"
                  >
                    ↑
                  </button>
                  <button
                    aria-label="Aşağı taşı"
                    className="icon"
                    disabled={index === unit.steps.length - 1}
                    onClick={() => onMove(unit.id, index, index + 1)}
                    title="Aşağı taşı"
                    type="button"
                  >
                    ↓
                  </button>
                </span>
              </li>
            );
          })}
        </ol>
      )}
    </article>
  );
}
