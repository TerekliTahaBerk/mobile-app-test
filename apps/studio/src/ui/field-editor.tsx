import type { Field } from '../model/exercise-fields';

type Choice = { label: string; value: string };

type FieldEditorProps = {
  field: Field;
  onChange: (key: string, value: unknown) => void;
  /** Choices for id fields the record cannot supply itself, such as skills. */
  externalChoices: readonly Choice[];
  record: Readonly<Record<string, unknown>>;
};

type RecordRow = Record<string, unknown>;

/** Renders one declared field. Every exercise kind is edited through this. */
export function FieldEditor({ field, onChange, externalChoices, record }: FieldEditorProps) {
  const value = record[field.key];

  switch (field.kind) {
    case 'text':
      return (
        <Labelled label={field.label}>
          <input
            onChange={(event) => onChange(field.key, event.target.value)}
            type="text"
            value={typeof value === 'string' ? value : ''}
          />
        </Labelled>
      );

    case 'prose':
      return (
        <Labelled label={field.label}>
          <textarea
            onChange={(event) => onChange(field.key, event.target.value)}
            rows={3}
            value={typeof value === 'string' ? value : ''}
          />
        </Labelled>
      );

    case 'number':
      return (
        <Labelled label={field.label}>
          <input
            max={field.max}
            min={field.min}
            onChange={(event) => onChange(field.key, Number(event.target.value))}
            type="number"
            value={typeof value === 'number' ? value : ''}
          />
        </Labelled>
      );

    case 'boolean':
      return (
        <Labelled label={field.label}>
          <select
            onChange={(event) => onChange(field.key, event.target.value === 'true')}
            value={value === true ? 'true' : 'false'}
          >
            <option value="true">Doğru</option>
            <option value="false">Yanlış</option>
          </select>
        </Labelled>
      );

    case 'choice': {
      const choices = idsOf(record[field.from]);
      return (
        <Labelled label={field.label}>
          <select
            onChange={(event) => onChange(field.key, event.target.value)}
            value={typeof value === 'string' ? value : ''}
          >
            <option value="">— seçilmedi —</option>
            {choices.map((choice) => (
              <option key={choice.value} value={choice.value}>
                {choice.label}
              </option>
            ))}
          </select>
        </Labelled>
      );
    }

    case 'idList': {
      const entries = Array.isArray(value) ? value.map(String) : [];
      const choices =
        field.from === undefined ? externalChoices : idsOf(record[field.from]);
      const update = (next: readonly string[]) => onChange(field.key, next);

      return (
        <Labelled help={field.help} label={field.label}>
          <div className="stack">
            {entries.map((entry, index) => (
              <div className="row" key={`${entry}-${index}`}>
                {choices.length === 0 ? (
                  <input
                    onChange={(event) =>
                      update(entries.map((item, i) => (i === index ? event.target.value : item)))
                    }
                    type="text"
                    value={entry}
                  />
                ) : (
                  <select
                    onChange={(event) =>
                      update(entries.map((item, i) => (i === index ? event.target.value : item)))
                    }
                    value={entry}
                  >
                    <option value="">— seçilmedi —</option>
                    {choices.map((choice) => (
                      <option key={choice.value} value={choice.value}>
                        {choice.label}
                      </option>
                    ))}
                  </select>
                )}
                <button
                  onClick={() => update(entries.filter((_item, i) => i !== index))}
                  type="button"
                >
                  Sil
                </button>
              </div>
            ))}
            <button onClick={() => update([...entries, ''])} type="button">
              + Ekle
            </button>
          </div>
        </Labelled>
      );
    }

    case 'records': {
      const rows: RecordRow[] = Array.isArray(value) ? (value as RecordRow[]) : [];
      const update = (next: readonly RecordRow[]) => onChange(field.key, next);

      return (
        <Labelled label={field.label}>
          <table className="records">
            <thead>
              <tr>
                {field.columns.map((column) => (
                  <th key={column.key}>{column.label}</th>
                ))}
                <th />
              </tr>
            </thead>
            <tbody>
              {rows.map((row, index) => (
                <tr key={index}>
                  {field.columns.map((column) => (
                    <td key={column.key}>
                      <input
                        onChange={(event) =>
                          update(
                            rows.map((item, i) =>
                              i === index ? { ...item, [column.key]: event.target.value } : item,
                            ),
                          )
                        }
                        type="text"
                        value={typeof row[column.key] === 'string' ? String(row[column.key]) : ''}
                      />
                    </td>
                  ))}
                  <td>
                    <button
                      onClick={() => update(rows.filter((_item, i) => i !== index))}
                      type="button"
                    >
                      Sil
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <button
            onClick={() =>
              update([
                ...rows,
                Object.fromEntries(field.columns.map((column) => [column.key, ''])),
              ])
            }
            type="button"
          >
            + Satır ekle
          </button>
        </Labelled>
      );
    }
  }
}

function Labelled({
  children,
  help,
  label,
}: {
  children: React.ReactNode;
  help?: string | undefined;
  label: string;
}) {
  return (
    <label className="field">
      <span className="field-label">{label}</span>
      {help === undefined ? null : <span className="field-help">{help}</span>}
      {children}
    </label>
  );
}

function idsOf(value: unknown): readonly Choice[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.flatMap((entry) => {
    if (typeof entry !== 'object' || entry === null) {
      return [];
    }
    const row = entry as RecordRow;
    const id = typeof row.id === 'string' ? row.id : '';
    if (id === '') {
      return [];
    }
    const label = ['label', 'front', 'left', 'term'].map((key) => row[key]).find(
      (candidate) => typeof candidate === 'string' && candidate !== '',
    );

    return [{ label: typeof label === 'string' ? `${id} — ${label}` : id, value: id }];
  });
}
