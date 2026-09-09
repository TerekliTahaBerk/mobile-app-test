import {
  CONTENT_SCHEMA_VERSION,
  CURRICULUM_MANIFEST_SCHEMA_VERSION,
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
  | 'invalidReviewer'
  | 'invalidTaxonomy'
  | 'malformedRecord'
  | 'productionReviewRequired'
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
  if (bundle.manifest.schemaVersion !== CURRICULUM_MANIFEST_SCHEMA_VERSION) {
    add(
      'schemaVersionMismatch',
      'manifest.schemaVersion',
      `Manifest şema sürümü ${bundle.manifest.schemaVersion}, uygulama ${CURRICULUM_MANIFEST_SCHEMA_VERSION} bekliyor.`,
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

  claim(bundle.manifest.id, 'manifest');
  bundle.manifest.exams.forEach((exam, i) => claim(exam.id, `manifest.exams[${i}]`));
  bundle.manifest.programs.forEach((program, i) =>
    claim(program.id, `manifest.programs[${i}]`),
  );
  bundle.manifest.subjects.forEach((subject, i) =>
    claim(subject.id, `manifest.subjects[${i}]`),
  );
  bundle.manifest.units.forEach((unit, i) => claim(unit.id, `manifest.units[${i}]`));
  bundle.topics.forEach((topic, i) => claim(topic.id, `topics[${i}]`));
  bundle.skills.forEach((skill, i) => claim(skill.id, `skills[${i}]`));
  bundle.concepts.forEach((concept, i) => claim(concept.id, `concepts[${i}]`));
  bundle.lessons.forEach((lesson, i) => claim(lesson.id, `lessons[${i}]`));
  bundle.exercises.forEach((exercise, i) => claim(exercise.id, `exercises[${i}]`));
  bundle.pathNodes.forEach((node, i) => claim(node.id, `pathNodes[${i}]`));
  bundle.reviewers.forEach((reviewer, i) => claim(reviewer.id, `reviewers[${i}]`));

  const ids = {
    concept: new Set(bundle.concepts.map((c) => c.id)),
    exam: new Set(bundle.manifest.exams.map((e) => e.id)),
    exercise: new Set(bundle.exercises.map((e) => e.id)),
    lesson: new Set(bundle.lessons.map((l) => l.id)),
    pathNode: new Set(bundle.pathNodes.map((n) => n.id)),
    skill: new Set(bundle.skills.map((s) => s.id)),
    program: new Set(bundle.manifest.programs.map((p) => p.id)),
    subject: new Set(bundle.manifest.subjects.map((s) => s.id)),
    topic: new Set(bundle.topics.map((t) => t.id)),
    unit: new Set(bundle.manifest.units.map((u) => u.id)),
  };

  const ref = (set: ReadonlySet<string>, id: string, at: string, label: string) => {
    if (!set.has(id)) {
      add('brokenReference', at, `Bilinmeyen ${label}: "${id}".`);
    }
  };

  const checkReview = (provenance: ContentBundle['lessons'][number]['provenance'], at: string, subjectId?: string) => {
    if (provenance.reviewStatus === 'draft') {
      return;
    }
    const reviewer = bundle.reviewers.find((candidate) => candidate.id === provenance.reviewerId);
    if (reviewer === undefined) {
      add('invalidReviewer', `${at}.reviewerId`, `İnceleyen kimliği registry içinde bulunamadı: "${provenance.reviewerId}".`);
      return;
    }
    if (reviewer.status !== 'active' || reviewer.type !== 'humanSubjectMatterExpert') {
      add('invalidReviewer', `${at}.reviewerId`, 'Yalnızca aktif insan alan uzmanı inceleme yapabilir.');
    }
    if (reviewer.displayName !== provenance.reviewedBy) {
      add('invalidReviewer', `${at}.reviewedBy`, 'İnceleyen adı registry kaydıyla eşleşmiyor.');
    }
    if (subjectId !== undefined && !reviewer.subjectIds.includes(subjectId)) {
      add('invalidReviewer', `${at}.reviewerId`, `İnceleyen kişi "${subjectId}" alanı için yetkili değil.`);
    }
    if (
      provenance.reviewedContentVersion !== bundle.contentVersion ||
      provenance.reviewedCurriculumVersion !== bundle.manifest.version
    ) {
      add('invalidReviewer', at, 'İnceleme kaydı mevcut content/curriculum sürümleriyle eşleşmiyor.');
    }
    if (Number.isNaN(Date.parse(provenance.reviewedAt))) {
      add('invalidReviewer', `${at}.reviewedAt`, 'İnceleme zamanı geçerli bir ISO-8601 zaman damgası olmalı.');
    }
    if (provenance.reviewStatus === 'approved') {
      const prior = provenance.priorReview;
      const priorReviewer = bundle.reviewers.find((candidate) => candidate.id === prior.reviewerId);
      if (
        priorReviewer === undefined ||
        priorReviewer.status !== 'active' ||
        priorReviewer.type !== 'humanSubjectMatterExpert' ||
        priorReviewer.displayName !== prior.reviewedBy ||
        (subjectId !== undefined && !priorReviewer.subjectIds.includes(subjectId))
      ) {
        add('invalidReviewer', `${at}.priorReview`, 'Onay öncesi inceleme geçerli bir insan alan uzmanına ait değil.');
      }
      if (
        prior.reviewedContentVersion !== bundle.contentVersion ||
        prior.reviewedCurriculumVersion !== bundle.manifest.version ||
        Number.isNaN(Date.parse(prior.reviewedAt))
      ) {
        add('invalidReviewer', `${at}.priorReview`, 'Onay öncesi inceleme zamanı veya sürümleri geçersiz.');
      }
    }
  };

  // --- hierarchy ----------------------------------------------------------
  bundle.manifest.exams.forEach((exam, i) => {
    checkRepeatedReferences(exam.programIds, `manifest.exams[${i}].programIds`, add);
    exam.programIds.forEach((id, j) =>
      ref(ids.program, id, `manifest.exams[${i}].programIds[${j}]`, 'program'),
    );
  });
  bundle.manifest.programs.forEach((program, i) => {
    ref(ids.exam, program.examId, `manifest.programs[${i}].examId`, 'sınav');
    checkRepeatedReferences(program.subjectIds, `manifest.programs[${i}].subjectIds`, add);
    program.subjectIds.forEach((id, j) =>
      ref(ids.subject, id, `manifest.programs[${i}].subjectIds[${j}]`, 'ders'),
    );
    const owner = bundle.manifest.exams.find((exam) => exam.programIds.includes(program.id));
    if (owner === undefined && ids.exam.has(program.examId)) {
      add(
        'invalidTaxonomy',
        `manifest.programs[${i}].examId`,
        `Sahip sınav "${program.examId}" bu programı programIds içinde listelemiyor.`,
      );
    } else if (owner !== undefined && owner.id !== program.examId) {
      add(
        'invalidTaxonomy',
        `manifest.programs[${i}].examId`,
        `Program "${owner.id}" sınavında listeleniyor ancak "${program.examId}" sınavını sahip olarak gösteriyor.`,
      );
    }
  });
  bundle.manifest.subjects.forEach((subject, i) => {
    const at = `manifest.subjects[${i}]`;
    ref(ids.program, subject.programId, `${at}.programId`, 'program');
    const owner = bundle.manifest.programs.find((program) =>
      program.subjectIds.includes(subject.id),
    );
    if (owner === undefined && ids.program.has(subject.programId)) {
      add(
        'invalidTaxonomy',
        `${at}.programId`,
        `Sahip program "${subject.programId}" bu dersi subjectIds içinde listelemiyor.`,
      );
    } else if (owner !== undefined && owner.id !== subject.programId) {
      add(
        'invalidTaxonomy',
        `${at}.programId`,
        `Ders "${owner.id}" programında listeleniyor ancak "${subject.programId}" programını sahip olarak gösteriyor.`,
      );
    }
    checkRepeatedReferences(subject.prerequisiteSubjectIds, `${at}.prerequisiteSubjectIds`, add);
    subject.prerequisiteSubjectIds.forEach((id, j) => {
      ref(ids.subject, id, `${at}.prerequisiteSubjectIds[${j}]`, 'ön koşul ders');
      if (id === subject.id) {
        add(
          'brokenReference',
          `${at}.prerequisiteSubjectIds[${j}]`,
          'Bir ders kendisinin ön koşulu olamaz.',
        );
      }
    });
    if (subject.availability === 'available' && subject.unitIds.length === 0) {
      add('invalidTaxonomy', `${at}.availability`, 'Kullanılabilir bir ders en az bir ünite içermeli.');
    }
    if (subject.availability === 'planned' && subject.unitIds.length > 0) {
      add('invalidTaxonomy', `${at}.availability`, 'Planlanan bir ders yayımlanmış ünite içeremez.');
    }
    checkRepeatedReferences(subject.unitIds, `${at}.unitIds`, add);
    subject.unitIds.forEach((id, j) =>
      ref(ids.unit, id, `${at}.unitIds[${j}]`, 'ünite'),
    );
  });
  validateSubjectPrerequisiteCycles(bundle, add);
  bundle.manifest.units.forEach((unit, i) => {
    ref(ids.subject, unit.subjectId, `manifest.units[${i}].subjectId`, 'ders');
    const owner = bundle.manifest.subjects.find((subject) => subject.unitIds.includes(unit.id));
    if (owner === undefined && ids.subject.has(unit.subjectId)) {
      add(
        'invalidTaxonomy',
        `manifest.units[${i}].subjectId`,
        `Sahip ders "${unit.subjectId}" bu üniteyi unitIds içinde listelemiyor.`,
      );
    } else if (owner !== undefined && owner.id !== unit.subjectId) {
      add(
        'invalidTaxonomy',
        `manifest.units[${i}].subjectId`,
        `Ünite "${owner.id}" dersinde listeleniyor ancak "${unit.subjectId}" dersini sahip olarak gösteriyor.`,
      );
    }
    checkRepeatedReferences(unit.topicIds, `manifest.units[${i}].topicIds`, add);
    unit.topicIds.forEach((id, j) =>
      ref(ids.topic, id, `manifest.units[${i}].topicIds[${j}]`, 'konu'),
    );
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
    const topic = bundle.topics.find((candidate) => candidate.id === lesson.topicId);
    const unit = bundle.manifest.units.find((candidate) => candidate.id === topic?.unitId);
    checkReview(lesson.provenance, `lessons[${i}].provenance`, unit?.subjectId);

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

    const unitIds = new Set(
      exercise.skillIds.flatMap((skillId) => {
        const skill = bundle.skills.find((candidate) => candidate.id === skillId);
        const topic = bundle.topics.find((candidate) => candidate.id === skill?.topicId);
        return topic === undefined ? [] : [topic.unitId];
      }),
    );
    const firstUnitId = unitIds.values().next().value as string | undefined;
    const firstUnit = bundle.manifest.units.find((candidate) => candidate.id === firstUnitId);
    checkReview(exercise.provenance, `${at}.provenance`, firstUnit?.subjectId);
    if (unitIds.size > 1) {
      add(
        'invalidTaxonomy',
        `${at}.skillIds`,
        'Bir alıştırmanın kazanımları tek bir ana konuya (üniteye) ait olmalı.',
      );
    }

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

function checkRepeatedReferences(
  references: readonly string[],
  at: string,
  add: (code: ContentIssueCode, at: string, message: string) => void,
): void {
  const seen = new Set<string>();
  references.forEach((id, index) => {
    if (seen.has(id)) {
      add('duplicateId', `${at}[${index}]`, `"${id}" kimliği bu listede birden fazla kez kullanılıyor.`);
    }
    seen.add(id);
  });
}

function validateSubjectPrerequisiteCycles(
  bundle: ContentBundle,
  add: (code: ContentIssueCode, at: string, message: string) => void,
): void {
  const subjects = new Map(bundle.manifest.subjects.map((subject) => [subject.id, subject]));
  const indexes = new Map(bundle.manifest.subjects.map((subject, index) => [subject.id, index]));
  const visiting = new Set<string>();
  const visited = new Set<string>();

  const visit = (id: string, trail: readonly string[]): void => {
    if (visited.has(id)) return;
    const subject = subjects.get(id);
    if (subject === undefined) return;

    visiting.add(id);
    subject.prerequisiteSubjectIds.forEach((prerequisiteId, prerequisiteIndex) => {
      if (visiting.has(prerequisiteId)) {
        add(
          'invalidTaxonomy',
          `manifest.subjects[${indexes.get(id)!}].prerequisiteSubjectIds[${prerequisiteIndex}]`,
          `Ders ön koşullarında döngü var: ${[...trail, id, prerequisiteId].join(' → ')}.`,
        );
        return;
      }
      visit(prerequisiteId, [...trail, id]);
    });
    visiting.delete(id);
    visited.add(id);
  };

  bundle.manifest.subjects.forEach((subject) => visit(subject.id, []));
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
