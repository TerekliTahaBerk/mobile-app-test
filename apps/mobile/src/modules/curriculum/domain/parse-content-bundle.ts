import {
  CONTENT_SCHEMA_VERSION,
  type ContentBundle,
  type ExerciseKind,
} from '@/modules/curriculum/domain/content-types';
import {
  ContentValidationError,
  type ContentIssue,
} from '@/modules/curriculum/domain/validate-content-bundle';

/**
 * The shape gate for authored content.
 *
 * Content is authored as JSON so it can be edited, diffed and written by the
 * content tool. JSON has no types, so the compiler can no longer catch a
 * misspelled kind or a missing prompt — this does, and it reports every
 * malformed record at once rather than throwing on the first.
 *
 * It checks shape only. Referential integrity, taxonomy and answer correctness
 * remain `validateContentBundle`'s job, and that function is entitled to assume
 * the records reaching it are the shape they claim to be.
 */

const EXERCISE_KINDS: readonly ExerciseKind[] = [
  'fillBlank',
  'flashcard',
  'matching',
  'multipleChoice',
  'ordering',
  'trueFalse',
];

const REVIEW_STATUSES = ['approved', 'draft', 'reviewed'];

type Collector = {
  add: (at: string, message: string) => void;
  issues: readonly ContentIssue[];
};

/**
 * Parses raw authored data into a bundle, throwing with every malformed record
 * listed. The returned value is the same object: nothing is rewritten, because
 * silently repairing content would hide the authoring mistake.
 */
export function assertParsedContentBundle(raw: unknown): ContentBundle {
  const issues: ContentIssue[] = [];
  const collector: Collector = {
    add: (at, message) => issues.push({ at, code: 'malformedRecord', message }),
    issues,
  };

  const bundle = object(raw, 'bundle', collector);
  if (bundle !== null) {
    checkBundle(bundle, collector);
  }

  if (issues.length > 0) {
    throw new ContentValidationError(issues);
  }

  // Proved above, record by record. This is the only place authored data
  // becomes typed, and it earns the assertion rather than assuming it.
  return raw as ContentBundle;
}

function checkBundle(bundle: Readonly<Record<string, unknown>>, c: Collector): void {
  if (bundle.schemaVersion !== CONTENT_SCHEMA_VERSION) {
    c.add('schemaVersion', `Şema sürümü ${CONTENT_SCHEMA_VERSION} olmalı.`);
  }
  text(bundle.contentVersion, 'contentVersion', c);
  text(bundle.curriculumVersion, 'curriculumVersion', c);
  text(bundle.locale, 'locale', c);

  each(bundle.exams, 'exams', c, (exam, at) => {
    text(exam.id, `${at}.id`, c);
    text(exam.title, `${at}.title`, c);
    texts(exam.subjectIds, `${at}.subjectIds`, c);
  });

  each(bundle.subjects, 'subjects', c, (subject, at) => {
    text(subject.id, `${at}.id`, c);
    text(subject.examId, `${at}.examId`, c);
    text(subject.themeKey, `${at}.themeKey`, c);
    text(subject.title, `${at}.title`, c);
    texts(subject.unitIds, `${at}.unitIds`, c, { allowEmpty: true });
  });

  each(bundle.units, 'units', c, (unit, at) => {
    text(unit.id, `${at}.id`, c);
    text(unit.subjectId, `${at}.subjectId`, c);
    text(unit.title, `${at}.title`, c);
    texts(unit.topicIds, `${at}.topicIds`, c);
  });

  each(bundle.topics, 'topics', c, (topic, at) => {
    text(topic.id, `${at}.id`, c);
    text(topic.title, `${at}.title`, c);
    text(topic.unitId, `${at}.unitId`, c);
    texts(topic.skillIds, `${at}.skillIds`, c);
    texts(topic.conceptIds, `${at}.conceptIds`, c, { allowEmpty: true });
  });

  each(bundle.skills, 'skills', c, (skill, at) => {
    text(skill.id, `${at}.id`, c);
    text(skill.title, `${at}.title`, c);
    text(skill.description, `${at}.description`, c);
    text(skill.topicId, `${at}.topicId`, c);
  });

  each(bundle.concepts, 'concepts', c, (concept, at) => {
    text(concept.id, `${at}.id`, c);
    text(concept.term, `${at}.term`, c);
    text(concept.definition, `${at}.definition`, c);
    text(concept.topicId, `${at}.topicId`, c);
  });

  each(bundle.lessons, 'lessons', c, (lesson, at) => {
    text(lesson.id, `${at}.id`, c);
    text(lesson.title, `${at}.title`, c);
    text(lesson.subtitle, `${at}.subtitle`, c);
    text(lesson.topicId, `${at}.topicId`, c);
    integer(lesson.estimatedMinutes, `${at}.estimatedMinutes`, c);
    texts(lesson.exerciseIds, `${at}.exerciseIds`, c);
    provenance(lesson.provenance, `${at}.provenance`, c);
  });

  each(bundle.pathNodes, 'pathNodes', c, (node, at) => {
    text(node.id, `${at}.id`, c);
    text(node.kind, `${at}.kind`, c);
    text(node.title, `${at}.title`, c);
    text(node.unitId, `${at}.unitId`, c);
    integer(node.order, `${at}.order`, c);
    texts(node.prerequisiteIds, `${at}.prerequisiteIds`, c, { allowEmpty: true });
    if (node.lessonId !== undefined) {
      text(node.lessonId, `${at}.lessonId`, c);
    }
  });

  each(bundle.exercises, 'exercises', c, (exercise, at) => {
    text(exercise.id, `${at}.id`, c);
    text(exercise.explanation, `${at}.explanation`, c);
    texts(exercise.skillIds, `${at}.skillIds`, c);
    provenance(exercise.provenance, `${at}.provenance`, c);
    if (
      typeof exercise.difficulty !== 'number' ||
      !Number.isInteger(exercise.difficulty) ||
      exercise.difficulty < 1 ||
      exercise.difficulty > 5
    ) {
      c.add(`${at}.difficulty`, 'Zorluk 1 ile 5 arasında bir tam sayı olmalı.');
    }
    checkExerciseKind(exercise, at, c);
  });
}

function checkExerciseKind(
  exercise: Readonly<Record<string, unknown>>,
  at: string,
  c: Collector,
): void {
  const kind = exercise.kind;
  if (typeof kind !== 'string' || !EXERCISE_KINDS.includes(kind as ExerciseKind)) {
    c.add(`${at}.kind`, `Bilinmeyen alıştırma türü: ${JSON.stringify(kind)}.`);
    return;
  }

  switch (kind as ExerciseKind) {
    case 'multipleChoice':
      text(exercise.prompt, `${at}.prompt`, c);
      text(exercise.tag, `${at}.tag`, c);
      text(exercise.correctOptionId, `${at}.correctOptionId`, c);
      each(exercise.options, `${at}.options`, c, (option, optionAt) => {
        text(option.id, `${optionAt}.id`, c);
        text(option.label, `${optionAt}.label`, c);
      });
      return;
    case 'trueFalse':
      text(exercise.statement, `${at}.statement`, c);
      text(exercise.tag, `${at}.tag`, c);
      if (typeof exercise.correctAnswer !== 'boolean') {
        c.add(`${at}.correctAnswer`, 'Doğru cevap true veya false olmalı.');
      }
      return;
    case 'fillBlank':
      text(exercise.title, `${at}.title`, c);
      text(exercise.hint, `${at}.hint`, c);
      texts(exercise.solutionTokenIds, `${at}.solutionTokenIds`, c);
      each(exercise.bank, `${at}.bank`, c, (token, tokenAt) => {
        text(token.id, `${tokenAt}.id`, c);
        text(token.label, `${tokenAt}.label`, c);
      });
      return;
    case 'matching':
      text(exercise.title, `${at}.title`, c);
      text(exercise.subtitle, `${at}.subtitle`, c);
      text(exercise.tag, `${at}.tag`, c);
      each(exercise.pairs, `${at}.pairs`, c, (pair, pairAt) => {
        text(pair.id, `${pairAt}.id`, c);
        text(pair.left, `${pairAt}.left`, c);
        text(pair.right, `${pairAt}.right`, c);
      });
      return;
    case 'ordering':
      text(exercise.prompt, `${at}.prompt`, c);
      text(exercise.tag, `${at}.tag`, c);
      texts(exercise.correctOrder, `${at}.correctOrder`, c);
      each(exercise.items, `${at}.items`, c, (item, itemAt) => {
        text(item.id, `${itemAt}.id`, c);
        text(item.label, `${itemAt}.label`, c);
      });
      return;
    case 'flashcard':
      text(exercise.tag, `${at}.tag`, c);
      each(exercise.cards, `${at}.cards`, c, (card, cardAt) => {
        text(card.id, `${cardAt}.id`, c);
        text(card.front, `${cardAt}.front`, c);
        text(card.back, `${cardAt}.back`, c);
        text(card.hint, `${cardAt}.hint`, c);
      });
      return;
  }
}

function provenance(value: unknown, at: string, c: Collector): void {
  const record = object(value, at, c);
  if (record === null) {
    return;
  }
  text(record.author, `${at}.author`, c);
  if (typeof record.reviewStatus !== 'string' || !REVIEW_STATUSES.includes(record.reviewStatus)) {
    c.add(`${at}.reviewStatus`, `İnceleme durumu ${REVIEW_STATUSES.join(', ')} olmalı.`);
  } else if (record.reviewStatus !== 'draft') {
    text(record.reviewedBy, `${at}.reviewedBy`, c);
    text(record.reviewedAt, `${at}.reviewedAt`, c);
  }
}

function object(value: unknown, at: string, c: Collector): Readonly<Record<string, unknown>> | null {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    c.add(at, 'Bir kayıt nesnesi bekleniyordu.');
    return null;
  }

  return value as Readonly<Record<string, unknown>>;
}

function each(
  value: unknown,
  at: string,
  c: Collector,
  check: (record: Readonly<Record<string, unknown>>, at: string) => void,
): void {
  if (!Array.isArray(value)) {
    c.add(at, 'Bir liste bekleniyordu.');
    return;
  }
  value.forEach((entry, index) => {
    const record = object(entry, `${at}[${index}]`, c);
    if (record !== null) {
      check(record, `${at}[${index}]`);
    }
  });
}

function text(value: unknown, at: string, c: Collector): void {
  if (typeof value !== 'string' || value.trim().length === 0) {
    c.add(at, 'Boş olmayan bir metin bekleniyordu.');
  }
}

function texts(
  value: unknown,
  at: string,
  c: Collector,
  options: { allowEmpty?: boolean } = {},
): void {
  if (!Array.isArray(value)) {
    c.add(at, 'Bir metin listesi bekleniyordu.');
    return;
  }
  if (value.length === 0 && options.allowEmpty !== true) {
    c.add(at, 'En az bir değer gerekiyor.');
  }
  value.forEach((entry, index) => text(entry, `${at}[${index}]`, c));
}

function integer(value: unknown, at: string, c: Collector): void {
  if (typeof value !== 'number' || !Number.isInteger(value) || value < 0) {
    c.add(at, 'Negatif olmayan bir tam sayı bekleniyordu.');
  }
}
