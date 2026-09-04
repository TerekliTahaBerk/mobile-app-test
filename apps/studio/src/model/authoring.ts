import type { ExerciseKind } from '@/modules/curriculum/domain/content-types';

/**
 * Creating content, as pure functions.
 *
 * Ids are opaque and must survive reordering, so they are derived once from the
 * title and then never rewritten. Everything created here is complete enough to
 * pass the content gates on the spot: a half-formed record would stop the whole
 * bundle from loading and take the rest of the tool down with it, so new
 * records are obvious placeholders rather than broken ones.
 */

const TURKISH: Readonly<Record<string, string>> = {
  ç: 'c', ğ: 'g', ı: 'i', ö: 'o', ş: 's', ü: 'u',
  Ç: 'c', Ğ: 'g', İ: 'i', I: 'i', Ö: 'o', Ş: 's', Ü: 'u',
};

export function slugify(title: string): string {
  const mapped = [...title].map((letter) => TURKISH[letter] ?? letter).join('');

  return (
    mapped
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 40) || 'yeni'
  );
}

/** Appends `-2`, `-3`… only when the natural id is already taken. */
export function uniqueId(candidate: string, taken: ReadonlySet<string>): string {
  if (!taken.has(candidate)) {
    return candidate;
  }
  for (let suffix = 2; ; suffix += 1) {
    const next = `${candidate}-${suffix}`;
    if (!taken.has(next)) {
      return next;
    }
  }
}

/** `001`, `002`… within a parent, so ordering reads at a glance. */
function numbered(prefix: string, taken: ReadonlySet<string>): string {
  for (let index = 1; ; index += 1) {
    const next = `${prefix}.${String(index).padStart(3, '0')}`;
    if (!taken.has(next)) {
      return next;
    }
  }
}

export const KIND_ABBREVIATIONS: Readonly<Record<ExerciseKind, string>> = {
  fillBlank: 'blank',
  flashcard: 'card',
  matching: 'match',
  multipleChoice: 'mcq',
  ordering: 'order',
  trueFalse: 'tf',
};

export function unitIdFor(subjectId: string, title: string, taken: ReadonlySet<string>): string {
  return uniqueId(`${subjectId}.${slugify(title)}`, taken);
}

export function topicIdFor(unitId: string, title: string, taken: ReadonlySet<string>): string {
  return uniqueId(`${unitId}.${slugify(title)}`, taken);
}

export function skillIdFor(topicId: string, title: string, taken: ReadonlySet<string>): string {
  return uniqueId(`skill.${topicId.split('.').slice(-2).join('.')}.${slugify(title)}`, taken);
}

export function lessonIdFor(topicId: string, taken: ReadonlySet<string>): string {
  return numbered(`lesson.${topicId.split('.').slice(-2).join('.')}`, taken);
}

export function exerciseIdFor(
  lessonId: string,
  kind: ExerciseKind,
  taken: ReadonlySet<string>,
): string {
  const prefix = lessonId.replace(/^lesson\./, 'exercise.');
  for (let index = 1; ; index += 1) {
    const next = `${prefix}.${KIND_ABBREVIATIONS[kind]}${String(index).padStart(2, '0')}`;
    if (!taken.has(next)) {
      return next;
    }
  }
}

export function pathNodeIdFor(unitId: string, order: number): string {
  return `path.${unitId.split('.').slice(-1)[0]}.${String(order).padStart(2, '0')}`;
}

const DRAFT = {
  author: 'Tekrarla engineering',
  note: 'Stüdyoda yazıldı. Akademik incelemeden geçmedi.',
  reviewStatus: 'draft',
};

export type NewExerciseInput = {
  id: string;
  kind: ExerciseKind;
  skillId: string;
  tag: string;
};

/** A complete, obviously-placeholder question of the requested kind. */
export function newExercise({ id, kind, skillId, tag }: NewExerciseInput): Record<string, unknown> {
  const base = {
    difficulty: 2,
    explanation: 'Açıklama yazılacak.',
    id,
    kind,
    provenance: DRAFT,
    skillIds: [skillId],
  };

  switch (kind) {
    case 'multipleChoice':
      return {
        ...base,
        correctOptionId: 'opt-1',
        options: [1, 2, 3, 4].map((index) => ({
          id: `opt-${index}`,
          label: `Seçenek ${index}`,
        })),
        prompt: 'Yeni soru',
        tag,
      };
    case 'trueFalse':
      return { ...base, correctAnswer: true, statement: 'Yeni ifade', tag };
    case 'fillBlank':
      return {
        ...base,
        bank: [1, 2, 3].map((index) => ({ id: `w-${index}`, label: `kelime${index}` })),
        hint: 'İpucu yazılacak',
        solutionTokenIds: ['w-1', 'w-2'],
        title: 'Boşluğu doldur',
      };
    case 'matching':
      return {
        ...base,
        pairs: [1, 2, 3].map((index) => ({
          id: `pair-${index}`,
          left: `Kavram ${index}`,
          right: `Karşılık ${index}`,
        })),
        subtitle: 'Kavramı karşılığıyla birleştir.',
        tag,
        title: 'Eşleştir',
      };
    case 'ordering':
      return {
        ...base,
        correctOrder: ['item-1', 'item-2', 'item-3'],
        items: [1, 2, 3].map((index) => ({ id: `item-${index}`, label: `Öğe ${index}` })),
        prompt: 'Sırala',
        tag,
      };
    case 'flashcard':
      return {
        ...base,
        cards: [1, 2].map((index) => ({
          back: `Tanım ${index}`,
          front: `Kavram ${index}`,
          hint: 'İpucu',
          id: `card-${index}`,
        })),
        tag,
      };
  }
}

export function newLesson(id: string, title: string, topicId: string): Record<string, unknown> {
  return {
    estimatedMinutes: 3,
    exerciseIds: [],
    id,
    provenance: DRAFT,
    subtitle: 'Alt başlık yazılacak',
    title,
    topicId,
  };
}

export function newPathNode(
  id: string,
  lessonId: string,
  title: string,
  unitId: string,
  order: number,
  previousNodeId: string | null,
): Record<string, unknown> {
  return {
    id,
    kind: 'lesson',
    lessonId,
    order,
    prerequisiteIds: previousNodeId === null ? [] : [previousNodeId],
    title,
    unitId,
  };
}

/**
 * Moves one item to another position. Out-of-range moves are refused rather
 * than clamped: dropping outside a list, or nudging past its end, should do
 * nothing rather than something the author did not ask for.
 */
export function move<T>(list: readonly T[], from: number, to: number): readonly T[] {
  if (from === to || from < 0 || to < 0 || from >= list.length || to >= list.length) {
    return list;
  }
  const next = [...list];
  next.splice(to, 0, ...next.splice(from, 1));

  return next;
}

/** Nudges one id one place within its list. */
export function reorder(ids: readonly string[], id: string, by: -1 | 1): readonly string[] {
  const from = ids.indexOf(id);

  return from === -1 ? ids : move(ids, from, from + by);
}

/**
 * Rebuilds a unit's path into a single chain.
 *
 * Takes the nodes **in the order they should be walked** and renumbers from
 * there; it must not re-sort by the old `order`, which would undo the very move
 * that called it. Node ids are left alone — they are what a learner's progress
 * records point at — so a removed or moved step never leaves a gap that blocks
 * the ones after it.
 */
export function rechainPath(
  nodes: readonly Readonly<Record<string, unknown>>[],
): Readonly<Record<string, unknown>>[] {
  return nodes.map((node, index, all) => ({
      ...node,
      order: index + 1,
      prerequisiteIds: index === 0 ? [] : [String(all[index - 1]!.id)],
    }));
}

export function newSkill(id: string, title: string, topicId: string): Record<string, unknown> {
  return { description: 'Kazanım açıklaması yazılacak.', id, title, topicId };
}

export function newTopic(id: string, title: string, unitId: string): Record<string, unknown> {
  return { conceptIds: [], id, skillIds: [], title, unitId };
}

export function newUnitFile(unitId: string): Record<string, unknown> {
  return {
    concepts: [],
    exercises: [],
    lessons: [],
    pathNodes: [],
    skills: [],
    topics: [],
    unitId,
  };
}
