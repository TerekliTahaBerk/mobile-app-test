import {
  CONTENT_SCHEMA_VERSION,
  isScoredKind,
  type ContentBundle,
  type ExerciseDefinition,
} from '@/modules/curriculum/domain/content-types';

/**
 * Content validation.
 *
 * The bundle is authored in TypeScript and compiled with the app, so its
 * *shape* is already guaranteed by `tsc`. What the compiler cannot see is
 * whether the strings that link records actually resolve, and whether an
 * exercise is answerable at all. That is what this checks, and it is why the
 * project does not carry a schema-validation dependency: it would re-verify
 * what the compiler proved and still leave every reference unchecked.
 *
 * When content later arrives from a server, a structural pass belongs in front
 * of this function — not instead of it.
 */

export type ContentIssue = {
  /** Dotted path to the offending record, e.g. `exercises[2].correctOptionId`. */
  at: string;
  code: ContentIssueCode;
  message: string;
};

export type ContentIssueCode =
  | 'brokenReference'
  | 'duplicateId'
  | 'emptyCollection'
  | 'invalidAnswer'
  | 'schemaVersionMismatch'
  | 'unsupportedExerciseKind';

export class ContentValidationError extends Error {
  readonly issues: readonly ContentIssue[];

  constructor(issues: readonly ContentIssue[]) {
    const detail = issues.map((issue) => `  • [${issue.code}] ${issue.at}: ${issue.message}`);
    super(`İçerik paketi geçersiz (${issues.length} sorun):\n${detail.join('\n')}`);
    this.name = 'ContentValidationError';
    this.issues = issues;
  }
}

/** Exercise kinds with an approved renderer. Others may exist but cannot ship in a lesson. */
const RENDERABLE_KINDS = new Set<ExerciseDefinition['kind']>([
  'fillBlank',
  'flashcard',
  'matching',
  'multipleChoice',
  'ordering',
  'trueFalse',
]);

export function validateContentBundle(bundle: ContentBundle): readonly ContentIssue[] {
  const issues: ContentIssue[] = [];
  const add = (code: ContentIssueCode, at: string, message: string) => {
    issues.push({ at, code, message });
  };

  if (bundle.schemaVersion !== CONTENT_SCHEMA_VERSION) {
    add(
      'schemaVersionMismatch',
      'schemaVersion',
      `Paket şema sürümü ${bundle.schemaVersion}, uygulama ${CONTENT_SCHEMA_VERSION} bekliyor.`,
    );
  }

  // --- identity -----------------------------------------------------------
  const seen = new Map<string, string>();
  const claim = (id: string, at: string) => {
    const previous = seen.get(id);
    if (previous !== undefined) {
      add('duplicateId', at, `"${id}" kimliği zaten ${previous} tarafından kullanılıyor.`);
      return;
    }
    seen.set(id, at);
  };

  bundle.exams.forEach((exam, i) => claim(exam.id, `exams[${i}]`));
  bundle.subjects.forEach((subject, i) => claim(subject.id, `subjects[${i}]`));
  bundle.units.forEach((unit, i) => claim(unit.id, `units[${i}]`));
  bundle.topics.forEach((topic, i) => claim(topic.id, `topics[${i}]`));
  bundle.skills.forEach((skill, i) => claim(skill.id, `skills[${i}]`));
  bundle.concepts.forEach((concept, i) => claim(concept.id, `concepts[${i}]`));
  bundle.lessons.forEach((lesson, i) => claim(lesson.id, `lessons[${i}]`));
  bundle.exercises.forEach((exercise, i) => claim(exercise.id, `exercises[${i}]`));
  bundle.pathNodes.forEach((node, i) => claim(node.id, `pathNodes[${i}]`));

  const ids = {
    concept: new Set(bundle.concepts.map((c) => c.id)),
    exam: new Set(bundle.exams.map((e) => e.id)),
    exercise: new Set(bundle.exercises.map((e) => e.id)),
    lesson: new Set(bundle.lessons.map((l) => l.id)),
    pathNode: new Set(bundle.pathNodes.map((n) => n.id)),
    skill: new Set(bundle.skills.map((s) => s.id)),
    subject: new Set(bundle.subjects.map((s) => s.id)),
    topic: new Set(bundle.topics.map((t) => t.id)),
    unit: new Set(bundle.units.map((u) => u.id)),
  };

  const ref = (set: ReadonlySet<string>, id: string, at: string, label: string) => {
    if (!set.has(id)) {
      add('brokenReference', at, `Bilinmeyen ${label}: "${id}".`);
    }
  };

  // --- hierarchy ----------------------------------------------------------
  bundle.exams.forEach((exam, i) =>
    exam.subjectIds.forEach((id, j) =>
      ref(ids.subject, id, `exams[${i}].subjectIds[${j}]`, 'ders'),
    ),
  );
  bundle.subjects.forEach((subject, i) => {
    ref(ids.exam, subject.examId, `subjects[${i}].examId`, 'sınav');
    subject.unitIds.forEach((id, j) =>
      ref(ids.unit, id, `subjects[${i}].unitIds[${j}]`, 'ünite'),
    );
  });
  bundle.units.forEach((unit, i) => {
    ref(ids.subject, unit.subjectId, `units[${i}].subjectId`, 'ders');
    unit.topicIds.forEach((id, j) => ref(ids.topic, id, `units[${i}].topicIds[${j}]`, 'konu'));
  });
  bundle.topics.forEach((topic, i) => {
    ref(ids.unit, topic.unitId, `topics[${i}].unitId`, 'ünite');
    topic.skillIds.forEach((id, j) =>
      ref(ids.skill, id, `topics[${i}].skillIds[${j}]`, 'kazanım'),
    );
    topic.conceptIds.forEach((id, j) =>
      ref(ids.concept, id, `topics[${i}].conceptIds[${j}]`, 'kavram'),
    );
  });
  bundle.skills.forEach((skill, i) => ref(ids.topic, skill.topicId, `skills[${i}].topicId`, 'konu'));
  bundle.concepts.forEach((concept, i) =>
    ref(ids.topic, concept.topicId, `concepts[${i}].topicId`, 'konu'),
  );

  // --- lessons ------------------------------------------------------------
  bundle.lessons.forEach((lesson, i) => {
    ref(ids.topic, lesson.topicId, `lessons[${i}].topicId`, 'konu');

    if (lesson.exerciseIds.length === 0) {
      add('emptyCollection', `lessons[${i}].exerciseIds`, 'Ders en az bir alıştırma içermeli.');
    }

    lesson.exerciseIds.forEach((id, j) => {
      const at = `lessons[${i}].exerciseIds[${j}]`;
      ref(ids.exercise, id, at, 'alıştırma');

      const exercise = bundle.exercises.find((candidate) => candidate.id === id);
      if (exercise !== undefined && !RENDERABLE_KINDS.has(exercise.kind)) {
        add(
          'unsupportedExerciseKind',
          at,
          `"${exercise.kind}" türünün onaylı bir ekranı yok; derse eklenemez.`,
        );
      }
    });
  });

  // --- exercises ----------------------------------------------------------
  bundle.exercises.forEach((exercise, i) => {
    const at = `exercises[${i}]`;

    if (isScoredKind(exercise.kind) && exercise.skillIds.length === 0) {
      add('emptyCollection', `${at}.skillIds`, 'Puanlanan alıştırma en az bir kazanıma bağlanmalı.');
    }
    exercise.skillIds.forEach((id, j) =>
      ref(ids.skill, id, `${at}.skillIds[${j}]`, 'kazanım'),
    );

    validateExerciseAnswerability(exercise, at, add);
  });

  // --- path ---------------------------------------------------------------
  const orderByUnit = new Map<string, Set<number>>();
  bundle.pathNodes.forEach((node, i) => {
    const at = `pathNodes[${i}]`;
    ref(ids.unit, node.unitId, `${at}.unitId`, 'ünite');

    if (node.lessonId !== undefined) {
      ref(ids.lesson, node.lessonId, `${at}.lessonId`, 'ders');
    } else if (node.kind === 'lesson') {
      add('brokenReference', `${at}.lessonId`, 'Ders düğümü bir derse bağlanmalı.');
    }

    node.prerequisiteIds.forEach((id, j) => {
      const prerequisiteAt = `${at}.prerequisiteIds[${j}]`;
      ref(ids.pathNode, id, prerequisiteAt, 'yol düğümü');
      if (id === node.id) {
        add('brokenReference', prerequisiteAt, 'Bir düğüm kendisinin ön koşulu olamaz.');
      }
    });

    const orders = orderByUnit.get(node.unitId) ?? new Set<number>();
    if (orders.has(node.order)) {
      add('duplicateId', `${at}.order`, `Bu ünitede ${node.order} sırası zaten kullanılıyor.`);
    }
    orders.add(node.order);
    orderByUnit.set(node.unitId, orders);
  });

  return issues;
}

function validateExerciseAnswerability(
  exercise: ExerciseDefinition,
  at: string,
  add: (code: ContentIssueCode, at: string, message: string) => void,
): void {
  switch (exercise.kind) {
    case 'multipleChoice': {
      if (exercise.options.length < 2) {
        add('emptyCollection', `${at}.options`, 'Çoktan seçmeli en az iki seçenek gerektirir.');
      }
      const optionIds = exercise.options.map((option) => option.id);
      if (new Set(optionIds).size !== optionIds.length) {
        add('duplicateId', `${at}.options`, 'Seçenek kimlikleri benzersiz olmalı.');
      }
      if (!optionIds.includes(exercise.correctOptionId)) {
        add(
          'invalidAnswer',
          `${at}.correctOptionId`,
          `"${exercise.correctOptionId}" seçenekler arasında yok.`,
        );
      }
      return;
    }

    case 'fillBlank': {
      const tokenIds = exercise.bank.map((token) => token.id);
      if (new Set(tokenIds).size !== tokenIds.length) {
        add('duplicateId', `${at}.bank`, 'Kelime kimlikleri benzersiz olmalı.');
      }
      if (exercise.solutionTokenIds.length === 0) {
        add('emptyCollection', `${at}.solutionTokenIds`, 'Çözüm en az bir kelime içermeli.');
      }
      exercise.solutionTokenIds.forEach((id, j) => {
        if (!tokenIds.includes(id)) {
          add(
            'invalidAnswer',
            `${at}.solutionTokenIds[${j}]`,
            `"${id}" kelime bankasında yok.`,
          );
        }
      });
      return;
    }

    case 'matching': {
      if (exercise.pairs.length < 2) {
        add('emptyCollection', `${at}.pairs`, 'Eşleştirme en az iki çift gerektirir.');
      }
      const pairIds = exercise.pairs.map((pair) => pair.id);
      if (new Set(pairIds).size !== pairIds.length) {
        add('duplicateId', `${at}.pairs`, 'Çift kimlikleri benzersiz olmalı.');
      }
      const rights = exercise.pairs.map((pair) => pair.right);
      if (new Set(rights).size !== rights.length) {
        add(
          'invalidAnswer',
          `${at}.pairs`,
          'Sağ taraf değerleri benzersiz olmalı; aksi halde eşleşme belirsizdir.',
        );
      }
      return;
    }

    case 'ordering': {
      const itemIds = exercise.items.map((item) => item.id);
      if (new Set(itemIds).size !== itemIds.length) {
        add('duplicateId', `${at}.items`, 'Öğe kimlikleri benzersiz olmalı.');
      }
      if (exercise.correctOrder.length !== exercise.items.length) {
        add(
          'invalidAnswer',
          `${at}.correctOrder`,
          'Doğru sıralama tüm öğeleri tam olarak bir kez içermeli.',
        );
      }
      exercise.correctOrder.forEach((id, j) => {
        if (!itemIds.includes(id)) {
          add('invalidAnswer', `${at}.correctOrder[${j}]`, `"${id}" öğeler arasında yok.`);
        }
      });
      return;
    }

    case 'trueFalse': {
      if (exercise.statement.trim().length === 0) {
        add('invalidAnswer', `${at}.statement`, 'Doğru–yanlış önermesi boş olamaz.');
      }
      return;
    }

    case 'flashcard': {
      if (exercise.cards.length === 0) {
        add('emptyCollection', `${at}.cards`, 'Kart destesi boş olamaz.');
      }
      const cardIds = exercise.cards.map((card) => card.id);
      if (new Set(cardIds).size !== cardIds.length) {
        add('duplicateId', `${at}.cards`, 'Kart kimlikleri benzersiz olmalı.');
      }
    }
  }
}

/**
 * Validates and returns the bundle, throwing on any issue. Content is loaded
 * once at startup, so a malformed bundle fails immediately and loudly rather
 * than rendering something subtly wrong.
 */
export function assertValidContentBundle(bundle: ContentBundle): ContentBundle {
  const issues = validateContentBundle(bundle);
  if (issues.length > 0) {
    throw new ContentValidationError(issues);
  }

  return bundle;
}
