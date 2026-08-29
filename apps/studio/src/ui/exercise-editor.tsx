import type { ExerciseKind } from '@/modules/curriculum/domain/content-types';

import {
  COMMON_FIELDS,
  EXERCISE_KIND_LABELS,
  FIELDS_BY_KIND,
} from '../model/exercise-fields';
import { FieldEditor } from './field-editor';
import { ReviewControl } from './review-control';

type ExerciseEditorProps = {
  exercise: Readonly<Record<string, unknown>>;
  /** Which lesson asks this question, and where else it could move. */
  lesson: {
    choices: readonly { label: string; value: string }[];
    onChange: (lessonId: string) => void;
    selected: string;
  };
  onChange: (next: Readonly<Record<string, unknown>>) => void;
  reviewer: string;
  /** The unit's skills, so a question is mapped by picking rather than typing. */
  skills: readonly { id: string; title: string }[];
};

export function ExerciseEditor({
  exercise,
  lesson,
  onChange,
  reviewer,
  skills,
}: ExerciseEditorProps) {
  const kind = String(exercise.kind) as ExerciseKind;
  const fields = FIELDS_BY_KIND[kind];
  const setField = (key: string, value: unknown) => onChange({ ...exercise, [key]: value });

  const provenance =
    typeof exercise.provenance === 'object' && exercise.provenance !== null
      ? (exercise.provenance as Readonly<Record<string, unknown>>)
      : {};

  return (
    <div className="editor">
      <header>
        <span className="kind">{EXERCISE_KIND_LABELS[kind] ?? kind}</span>
        {/* The id is the reference every lesson and attempt record points at, so
            it is shown rather than edited: renaming it here would silently
            orphan history the tool cannot see. */}
        <code className="identity">{String(exercise.id)}</code>
      </header>

      <label className="field">
        <span className="field-label">Ders</span>
        <span className="field-help">
          Bu sorunun sorulduğu ders. Değiştirmek soruyu o dersin sonuna taşır.
        </span>
        <select onChange={(event) => lesson.onChange(event.target.value)} value={lesson.selected}>
          {lesson.selected === '' ? <option value="">— derse bağlı değil —</option> : null}
          {lesson.choices.map((choice) => (
            <option key={choice.value} value={choice.value}>
              {choice.label}
            </option>
          ))}
        </select>
      </label>

      {fields === undefined ? (
        <p className="warning">
          &quot;{kind}&quot; türü için tanımlı bir form yok. Bu tür sözleşmede eksik olabilir.
        </p>
      ) : (
        [...fields, ...COMMON_FIELDS].map((field) => (
          <FieldEditor
            externalChoices={skills.map((skill) => ({
              label: `${skill.title}`,
              value: skill.id,
            }))}
            field={field}
            key={field.key}
            onChange={setField}
            record={exercise}
          />
        ))
      )}

      <ReviewControl
        onChange={(status) =>
          onChange({
            ...exercise,
            provenance:
              status === 'draft'
                ? { author: provenance.author, note: provenance.note, reviewStatus: 'draft' }
                : {
                    ...provenance,
                    reviewStatus: status,
                    reviewedAt: new Date().toISOString(),
                    reviewedBy: reviewer.trim(),
                  },
          })
        }
        provenance={provenance}
        reviewer={reviewer}
      />
    </div>
  );
}
