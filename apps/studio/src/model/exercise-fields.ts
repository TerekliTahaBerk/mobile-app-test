import type { ExerciseKind } from '@/modules/curriculum/domain/content-types';

/**
 * What each exercise kind offers an author, declared as data.
 *
 * One generic form renders these, so a new exercise kind is a contract, an
 * evaluator, a renderer and an entry here — not a bespoke editor screen that
 * drifts from the other five.
 */

export type FieldColumn = {
  key: string;
  label: string;
};

export type Field =
  | { key: string; kind: 'boolean'; label: string }
  /** A single choice among the ids held by another field's records. */
  | { from: string; key: string; kind: 'choice'; label: string }
  /** `from` names a sibling records field whose ids are the allowed values. */
  | { from?: string; help?: string; key: string; kind: 'idList'; label: string }
  | { key: string; kind: 'number'; label: string; max: number; min: number }
  | { key: string; kind: 'prose' | 'text'; label: string }
  | { columns: readonly FieldColumn[]; key: string; kind: 'records'; label: string };

/** Fields every exercise carries, whatever its kind. */
export const COMMON_FIELDS: readonly Field[] = [
  { key: 'explanation', kind: 'prose', label: 'Açıklama (cevaptan sonra gösterilir)' },
  { key: 'difficulty', kind: 'number', label: 'Zorluk (1 hatırlama – 5 sınav zorluğu)', max: 5, min: 1 },
  {
    help: 'Bu sorunun ölçtüğü kazanımlar. Hepsi aynı ana konuya bağlı olmalı.',
    key: 'skillIds',
    kind: 'idList',
    label: 'Kazanımlar',
  },
];

const OPTION_COLUMNS: readonly FieldColumn[] = [
  { key: 'id', label: 'Kimlik' },
  { key: 'label', label: 'Metin' },
];

export const FIELDS_BY_KIND: Readonly<Record<ExerciseKind, readonly Field[]>> = {
  fillBlank: [
    { key: 'title', kind: 'text', label: 'Başlık' },
    { key: 'hint', kind: 'text', label: 'İpucu' },
    { columns: OPTION_COLUMNS, key: 'bank', kind: 'records', label: 'Kelime bankası' },
    {
      from: 'bank',
      help: 'Doğru cümleyi oluşturan kelimeler, sırasıyla.',
      key: 'solutionTokenIds',
      kind: 'idList',
      label: 'Çözüm sırası',
    },
  ],
  flashcard: [
    { key: 'tag', kind: 'text', label: 'Etiket' },
    {
      columns: [
        { key: 'id', label: 'Kimlik' },
        { key: 'front', label: 'Ön yüz' },
        { key: 'back', label: 'Arka yüz' },
        { key: 'hint', label: 'İpucu' },
      ],
      key: 'cards',
      kind: 'records',
      label: 'Kartlar',
    },
  ],
  matching: [
    { key: 'title', kind: 'text', label: 'Başlık' },
    { key: 'subtitle', kind: 'text', label: 'Alt başlık' },
    { key: 'tag', kind: 'text', label: 'Etiket' },
    {
      columns: [
        { key: 'id', label: 'Kimlik' },
        { key: 'left', label: 'Sol' },
        { key: 'right', label: 'Sağ' },
      ],
      key: 'pairs',
      kind: 'records',
      label: 'Eşleşmeler',
    },
  ],
  multipleChoice: [
    { key: 'prompt', kind: 'prose', label: 'Soru' },
    { key: 'tag', kind: 'text', label: 'Etiket' },
    { columns: OPTION_COLUMNS, key: 'options', kind: 'records', label: 'Seçenekler' },
    { from: 'options', key: 'correctOptionId', kind: 'choice', label: 'Doğru seçenek' },
  ],
  ordering: [
    { key: 'prompt', kind: 'prose', label: 'Soru' },
    { key: 'tag', kind: 'text', label: 'Etiket' },
    { columns: OPTION_COLUMNS, key: 'items', kind: 'records', label: 'Öğeler' },
    {
      from: 'items',
      help: 'Öğe kimlikleri, doğru sırayla.',
      key: 'correctOrder',
      kind: 'idList',
      label: 'Doğru sıra',
    },
  ],
  trueFalse: [
    { key: 'statement', kind: 'prose', label: 'İfade' },
    { key: 'tag', kind: 'text', label: 'Etiket' },
    { key: 'correctAnswer', kind: 'boolean', label: 'İfade doğru mu?' },
  ],
};

export const EXERCISE_KIND_LABELS: Readonly<Record<ExerciseKind, string>> = {
  fillBlank: 'Boşluk doldurma',
  flashcard: 'Bilgi kartı',
  matching: 'Eşleştirme',
  multipleChoice: 'Çoktan seçmeli',
  ordering: 'Sıralama',
  trueFalse: 'Doğru / yanlış',
};
