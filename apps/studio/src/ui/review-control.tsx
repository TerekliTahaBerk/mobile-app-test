type ReviewControlProps = {
  onChange: (status: string) => void;
  provenance: Readonly<Record<string, unknown>>;
  reviewer: string;
};

const STATUS_LABELS: Readonly<Record<string, string>> = {
  approved: 'Onaylandı',
  draft: 'Taslak',
  reviewed: 'İncelendi',
};

/**
 * Review status, with the one rule the repository will not bend on: only a
 * human subject-matter review may move content past draft. The control refuses
 * to stamp a status without a named reviewer, and records who and when, because
 * an unattributable approval is not a review.
 */
export function ReviewControl({ onChange, provenance, reviewer }: ReviewControlProps) {
  const status = String(provenance.reviewStatus ?? 'draft');
  const reviewedBy = provenance.reviewedBy;
  const reviewedAt = provenance.reviewedAt;
  const named = reviewer.trim().length > 0;

  return (
    <section className="review">
      <h3>İnceleme durumu</h3>
      <div className="row">
        {(['draft', 'reviewed', 'approved'] as const).map((candidate) => (
          <button
            className={status === candidate ? 'status-active' : undefined}
            disabled={candidate !== 'draft' && !named}
            key={candidate}
            onClick={() => onChange(candidate)}
            type="button"
          >
            {STATUS_LABELS[candidate]}
          </button>
        ))}
      </div>
      {named ? null : (
        <p className="warning">
          İncelendi ve onaylandı durumları için üstteki alana inceleyen kişinin adını yaz. Yalnızca
          bir insan alan uzmanı içeriği taslağın ötesine taşıyabilir.
        </p>
      )}
      {typeof reviewedBy === 'string' && typeof reviewedAt === 'string' ? (
        <p className="muted">
          {reviewedBy} · {new Date(reviewedAt).toLocaleString('tr-TR')}
        </p>
      ) : (
        <p className="muted">Henüz incelenmedi.</p>
      )}
    </section>
  );
}
