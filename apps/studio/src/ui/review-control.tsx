import type { Reviewer, ReviewStatus } from '@/modules/curriculum/domain/content-types';

type ReviewControlProps = {
  onChange: (status: ReviewStatus) => void;
  provenance: Readonly<Record<string, unknown>>;
  reviewer: Reviewer | null;
  subjectId: string;
};

const STATUS_LABELS: Readonly<Record<string, string>> = {
  approved: 'Onaylandı',
  draft: 'Taslak',
  reviewed: 'İncelendi',
};

/**
 * Review status, with the one rule the repository will not bend on: only a
 * human subject-matter review may move content past draft. The control refuses
 * to stamp a status without a registry-backed reviewer, and records who and when, because
 * an unattributable approval is not a review.
 */
export function ReviewControl({ onChange, provenance, reviewer, subjectId }: ReviewControlProps) {
  const status = String(provenance.reviewStatus ?? 'draft');
  const reviewedBy = provenance.reviewedBy;
  const reviewedAt = provenance.reviewedAt;
  const authorized =
    reviewer?.status === 'active' &&
    reviewer.type === 'humanSubjectMatterExpert' &&
    reviewer.subjectIds.includes(subjectId);

  return (
    <section className="review">
      <h3>İnceleme durumu</h3>
      <div className="row">
        {(['draft', 'reviewed', 'approved'] as const).map((candidate) => (
          <button
            className={status === candidate ? 'status-active' : undefined}
            disabled={
              candidate !== 'draft' &&
              (!authorized || (candidate === 'approved' && status !== 'reviewed'))
            }
            key={candidate}
            onClick={() => onChange(candidate)}
            type="button"
          >
            {STATUS_LABELS[candidate]}
          </button>
        ))}
      </div>
      {authorized ? null : (
        <p className="warning">
          İncelendi ve onaylandı durumları için registry’de kayıtlı, aktif bir insan alan uzmanı
          seç. Serbest metinle onay verilemez.
        </p>
      )}
      {authorized && status === 'draft' ? (
        <p className="muted">Taslak doğrudan onaylanamaz; önce “İncelendi” durumuna getir.</p>
      ) : null}
      {typeof reviewedBy === 'string' && typeof reviewedAt === 'string' ? (
        <p className="muted">
          {reviewedBy} · {String(provenance.reviewerId)} ·{' '}
          {new Date(reviewedAt).toLocaleString('tr-TR')}
        </p>
      ) : (
        <p className="muted">Henüz incelenmedi.</p>
      )}
    </section>
  );
}
