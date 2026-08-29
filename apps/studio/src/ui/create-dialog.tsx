import { useState } from 'react';

export type DialogField =
  | { key: string; kind: 'text'; label: string; placeholder?: string; value?: string }
  | { choices: readonly { label: string; value: string }[]; key: string; kind: 'choice'; label: string };

export type DialogSpec = {
  fields: readonly DialogField[];
  submitLabel: string;
  title: string;
};

type CreateDialogProps = {
  onCancel: () => void;
  onSubmit: (values: Readonly<Record<string, string>>) => void;
  spec: DialogSpec;
};

/** One small form for every "add" action, so creating things reads the same way. */
export function CreateDialog({ onCancel, onSubmit, spec }: CreateDialogProps) {
  const [values, setValues] = useState<Record<string, string>>(() =>
    Object.fromEntries(
      spec.fields.map((field) => [
        field.key,
        field.kind === 'choice' ? (field.choices[0]?.value ?? '') : (field.value ?? ''),
      ]),
    ),
  );
  const complete = spec.fields.every((field) => (values[field.key] ?? '').trim() !== '');

  return (
    <div className="scrim" role="dialog">
      <form
        className="dialog"
        onSubmit={(event) => {
          event.preventDefault();
          if (complete) {
            onSubmit(values);
          }
        }}
      >
        <h2>{spec.title}</h2>
        {spec.fields.map((field) => (
          <label className="field" key={field.key}>
            <span className="field-label">{field.label}</span>
            {field.kind === 'choice' ? (
              <select
                onChange={(event) =>
                  setValues({ ...values, [field.key]: event.target.value })
                }
                value={values[field.key] ?? ''}
              >
                {field.choices.map((choice) => (
                  <option key={choice.value} value={choice.value}>
                    {choice.label}
                  </option>
                ))}
              </select>
            ) : (
              <input
                autoFocus={field === spec.fields[0]}
                onChange={(event) =>
                  setValues({ ...values, [field.key]: event.target.value })
                }
                placeholder={field.placeholder ?? ''}
                type="text"
                value={values[field.key] ?? ''}
              />
            )}
          </label>
        ))}
        <div className="row dialog-actions">
          <button disabled={!complete} type="submit">
            {spec.submitLabel}
          </button>
          <button onClick={onCancel} type="button">
            Vazgeç
          </button>
        </div>
      </form>
    </div>
  );
}
