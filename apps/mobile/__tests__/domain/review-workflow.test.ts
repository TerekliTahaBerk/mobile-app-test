import type { Provenance, Reviewer } from '@/modules/curriculum/domain/content-types';
import { transitionReview } from '@/modules/curriculum/domain/review-workflow';

const draft: Provenance = { author: 'AI-assisted draft', reviewStatus: 'draft' };
const reviewer: Reviewer = {
  displayName: 'Test Alan Uzmanı',
  id: 'reviewer.test.sme',
  status: 'active',
  subjectIds: ['tyt.history'],
  type: 'humanSubjectMatterExpert',
};
const version = {
  contentVersion: '1.2.3',
  curriculumVersion: '2027.1',
  subjectId: 'tyt.history',
};
const at = '2026-09-04T09:00:00.000Z';

describe('academic review workflow', () => {
  it('rejects an unattributed review', () => {
    expect(() => transitionReview(draft, 'reviewed', null, at, version)).toThrow(
      'aktif bir insan alan uzmanı',
    );
  });

  it('does not let an AI or engineering draft jump directly to approved', () => {
    expect(() => transitionReview(draft, 'approved', reviewer, at, version)).toThrow(
      'doğrudan onaylanamaz',
    );
  });

  it('rejects a reviewer outside their registered subject', () => {
    expect(() =>
      transitionReview(draft, 'reviewed', reviewer, at, { ...version, subjectId: 'tyt.religion' }),
    ).toThrow('alanı için yetkili değil');
  });

  it('records stable identity, display-name snapshot, time and versions', () => {
    expect(transitionReview(draft, 'reviewed', reviewer, at, version)).toEqual({
      author: draft.author,
      reviewStatus: 'reviewed',
      reviewedAt: at,
      reviewedBy: reviewer.displayName,
      reviewedContentVersion: version.contentVersion,
      reviewedCurriculumVersion: version.curriculumVersion,
      reviewerId: reviewer.id,
    });
  });

  it('allows approval only after the human review step', () => {
    const reviewed = transitionReview(draft, 'reviewed', reviewer, at, version);
    expect(
      transitionReview(reviewed, 'approved', reviewer, '2026-09-04T10:00:00.000Z', version),
    ).toMatchObject({ reviewStatus: 'approved', reviewerId: reviewer.id });
  });
});
