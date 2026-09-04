import type { ContentBundle, Provenance } from '@/modules/curriculum/domain/content-types';
import {
  ContentValidationError,
  type ContentIssue,
  validateContentBundle,
} from '@/modules/curriculum/domain/validate-content-bundle';

function isApproved(provenance: Provenance): boolean {
  return (
    provenance.reviewStatus === 'approved' &&
    typeof provenance.reviewerId === 'string' &&
    provenance.reviewerId.trim().length > 0 &&
    typeof provenance.reviewedBy === 'string' &&
    provenance.reviewedBy.trim().length > 0 &&
    typeof provenance.reviewedAt === 'string' &&
    provenance.reviewedAt.trim().length > 0 &&
    provenance.reviewedContentVersion.trim().length > 0 &&
    provenance.reviewedCurriculumVersion.trim().length > 0 &&
    provenance.priorReview !== undefined
  );
}

/**
 * Builds the closed learner-facing subset of an authored bundle.
 *
 * Only approved lessons are roots. Their exercises and taxonomy are retained
 * so an incomplete approval fails validation instead of silently publishing a
 * shortened lesson. Catalogue subjects and units without an approved lesson
 * are removed as well.
 */
export function buildProductionContentBundle(source: ContentBundle): ContentBundle {
  const lessons = source.lessons.filter((lesson) => isApproved(lesson.provenance));
  const lessonIds = new Set(lessons.map((lesson) => lesson.id));
  const exerciseIds = new Set(lessons.flatMap((lesson) => lesson.exerciseIds));
  const exercises = source.exercises.filter((exercise) => exerciseIds.has(exercise.id));
  const skillIds = new Set(exercises.flatMap((exercise) => exercise.skillIds));
  const skills = source.skills.filter((skill) => skillIds.has(skill.id));
  const topicIds = new Set([
    ...lessons.map((lesson) => lesson.topicId),
    ...skills.map((skill) => skill.topicId),
  ]);
  const topics = source.topics
    .filter((topic) => topicIds.has(topic.id))
    .map((topic) => ({
      ...topic,
      conceptIds: topic.conceptIds.filter((id) => source.concepts.some((concept) => concept.id === id)),
      skillIds: topic.skillIds.filter((id) => skillIds.has(id)),
    }));
  const conceptIds = new Set(topics.flatMap((topic) => topic.conceptIds));
  const concepts = source.concepts.filter((concept) => conceptIds.has(concept.id));
  const unitIds = new Set(topics.map((topic) => topic.unitId));
  const units = source.units
    .filter((unit) => unitIds.has(unit.id))
    .map((unit) => ({ ...unit, topicIds: unit.topicIds.filter((id) => topicIds.has(id)) }));
  const subjectIds = new Set(units.map((unit) => unit.subjectId));
  const subjects = source.subjects
    .filter((subject) => subjectIds.has(subject.id))
    .map((subject) => ({ ...subject, unitIds: subject.unitIds.filter((id) => unitIds.has(id)) }));
  const examIds = new Set(subjects.map((subject) => subject.examId));
  const exams = source.exams
    .filter((exam) => examIds.has(exam.id))
    .map((exam) => ({ ...exam, subjectIds: exam.subjectIds.filter((id) => subjectIds.has(id)) }));
  const pathNodes = source.pathNodes
    .filter((node) => node.lessonId !== undefined && lessonIds.has(node.lessonId))
    .map((node) => ({ ...node, prerequisiteIds: [] }));

  return {
    ...source,
    concepts,
    exams,
    exercises,
    lessons,
    pathNodes,
    skills,
    subjects,
    topics,
    units,
  };
}

export function validateProductionContentBundle(bundle: ContentBundle): readonly ContentIssue[] {
  const issues = [...validateContentBundle(bundle)];
  const check = (kind: 'exercises' | 'lessons', index: number, provenance: Provenance) => {
    if (!isApproved(provenance)) {
      issues.push({
        at: `${kind}[${index}].provenance`,
        code: 'productionReviewRequired',
        message: 'Production içeriği doğrulanabilir reviewer ve sürüm metadata’sıyla approved olmalı.',
      });
    }
  };

  bundle.lessons.forEach((lesson, index) => check('lessons', index, lesson.provenance));
  bundle.exercises.forEach((exercise, index) => check('exercises', index, exercise.provenance));
  return issues;
}

export function assertProductionContentBundle(bundle: ContentBundle): ContentBundle {
  const issues = validateProductionContentBundle(bundle);
  if (issues.length > 0) {
    throw new ContentValidationError(issues);
  }
  return bundle;
}
