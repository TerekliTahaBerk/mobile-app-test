import { productionPilotBundle } from '@/modules/curriculum/content/production-pilot-bundle';
import { tytDraftBundle } from '@/modules/curriculum/content/tyt-draft-bundle';
import { createContentIndex } from '@/modules/curriculum/domain/content-index';
import type { ContentBundle, Provenance } from '@/modules/curriculum/domain/content-types';
import {
  assertProductionContentBundle,
  buildProductionContentBundle,
  validateProductionContentBundle,
} from '@/modules/curriculum/domain/production-content';

const reviewer = {
  displayName: 'Test Alan Uzmanı',
  id: 'reviewer.test.sme',
  status: 'active' as const,
  subjectIds: tytDraftBundle.subjects.map((subject) => subject.id),
  type: 'humanSubjectMatterExpert' as const,
};

function approved(): Provenance {
  const attestation = {
    reviewedAt: '2026-09-04T08:00:00.000Z',
    reviewedBy: reviewer.displayName,
    reviewedContentVersion: tytDraftBundle.contentVersion,
    reviewedCurriculumVersion: tytDraftBundle.curriculumVersion,
    reviewerId: reviewer.id,
  };
  return {
    author: 'test author',
    reviewedAt: '2026-09-04T09:00:00.000Z',
    reviewedBy: reviewer.displayName,
    reviewedContentVersion: tytDraftBundle.contentVersion,
    reviewedCurriculumVersion: tytDraftBundle.curriculumVersion,
    reviewerId: reviewer.id,
    priorReview: attestation,
    reviewStatus: 'approved',
  };
}

function withOneApprovedLesson(): ContentBundle {
  const lesson = tytDraftBundle.lessons[0]!;
  const exerciseIds = new Set(lesson.exerciseIds);
  return {
    ...tytDraftBundle,
    reviewers: [reviewer],
    exercises: tytDraftBundle.exercises.map((exercise) =>
      exerciseIds.has(exercise.id) ? { ...exercise, provenance: approved() } : exercise,
    ),
    lessons: [{ ...lesson, provenance: approved() }, ...tytDraftBundle.lessons.slice(1)],
  };
}

describe('production content gate', () => {
  it('ships only approved lessons, exercises and their visible hierarchy', () => {
    const bundle = buildProductionContentBundle(withOneApprovedLesson());

    expect(validateProductionContentBundle(bundle)).toEqual([]);
    expect(bundle.lessons).toHaveLength(1);
    expect(bundle.exercises).toHaveLength(bundle.lessons[0]!.exerciseIds.length);
    expect(bundle.lessons.every((lesson) => lesson.provenance.reviewStatus === 'approved')).toBe(true);
    expect(bundle.exercises.every((exercise) => exercise.provenance.reviewStatus === 'approved')).toBe(true);
    expect(bundle.units).toHaveLength(1);
    expect(bundle.subjects).toHaveLength(1);
    expect(bundle.subjects[0]!.unitIds).toEqual([bundle.units[0]!.id]);
  });

  it('fails when a draft exercise enters a production bundle', () => {
    const bundle = buildProductionContentBundle(withOneApprovedLesson());
    const broken = {
      ...bundle,
      exercises: [
        { ...bundle.exercises[0]!, provenance: { author: 'test', reviewStatus: 'draft' as const } },
        ...bundle.exercises.slice(1),
      ],
    };

    expect(() => assertProductionContentBundle(broken)).toThrow('productionReviewRequired');
  });

  it('fails an approval without reviewer metadata', () => {
    const bundle = buildProductionContentBundle(withOneApprovedLesson());
    const broken = JSON.parse(JSON.stringify(bundle)) as ContentBundle;
    delete (broken.lessons[0]!.provenance as { reviewedBy?: string }).reviewedBy;

    expect(validateProductionContentBundle(broken).map((issue) => issue.code)).toContain(
      'productionReviewRequired',
    );
  });

  it('cannot resolve draft content through a direct id lookup', () => {
    const index = createContentIndex(productionPilotBundle);
    const draftLessonId = tytDraftBundle.lessons[0]!.id;

    expect(() => index.getLesson(draftLessonId)).toThrow('İçerik dizininde ders bulunamadı');
    expect(index.bundle.subjects).toEqual([]);
    expect(index.bundle.units).toEqual([]);
  });
});
