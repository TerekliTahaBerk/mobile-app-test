import type {
  Provenance,
  Reviewer,
  ReviewStatus,
  Timestamp,
} from '@/modules/curriculum/domain/content-types';

export type ContentReviewVersion = {
  readonly contentVersion: string;
  readonly curriculumVersion: string;
  readonly subjectId: string;
};

/**
 * The only supported status transition for Studio-authored review changes.
 * Requiring an intermediate human review makes a draft—especially an AI or
 * engineering draft—impossible to approve in one click.
 */
export function transitionReview(
  provenance: Provenance,
  nextStatus: ReviewStatus,
  reviewer: Reviewer | null,
  reviewedAt: Timestamp,
  version: ContentReviewVersion,
): Provenance {
  const authorship = provenance.note === undefined
    ? { author: provenance.author }
    : { author: provenance.author, note: provenance.note };
  if (nextStatus === 'draft') {
    return { ...authorship, reviewStatus: 'draft' };
  }
  if (reviewer === null || reviewer.status !== 'active' || reviewer.type !== 'humanSubjectMatterExpert') {
    throw new Error('İnceleme için aktif bir insan alan uzmanı seçilmeli.');
  }
  if (!reviewer.subjectIds.includes(version.subjectId)) {
    throw new Error(`Seçilen inceleyen "${version.subjectId}" alanı için yetkili değil.`);
  }
  if (nextStatus === 'reviewed') {
    return {
      ...authorship,
      reviewStatus: 'reviewed',
      reviewedAt,
      reviewedBy: reviewer.displayName,
      reviewedContentVersion: version.contentVersion,
      reviewedCurriculumVersion: version.curriculumVersion,
      reviewerId: reviewer.id,
    };
  }
  if (provenance.reviewStatus !== 'reviewed') {
    throw new Error('İçerik taslaktan doğrudan onaylanamaz; önce insan alan uzmanı incelemeli.');
  }

  return {
    ...authorship,
    priorReview: {
      reviewedAt: provenance.reviewedAt,
      reviewedBy: provenance.reviewedBy,
      reviewedContentVersion: provenance.reviewedContentVersion,
      reviewedCurriculumVersion: provenance.reviewedCurriculumVersion,
      reviewerId: provenance.reviewerId,
    },
    reviewStatus: 'approved',
    reviewedAt,
    reviewedBy: reviewer.displayName,
    reviewedContentVersion: version.contentVersion,
    reviewedCurriculumVersion: version.curriculumVersion,
    reviewerId: reviewer.id,
  };
}
