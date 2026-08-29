export type ConfirmSpec = {
  confirmLabel: string;
  /** Exactly what disappears, counted rather than implied. */
  detail: string;
  title: string;
};

type ConfirmDialogProps = {
  onCancel: () => void;
  onConfirm: () => void;
  spec: ConfirmSpec;
};

/**
 * Deleting says what goes before it goes. The repository is the store, so a
 * deletion is a deletion in git and recoverable there — which the dialog says,
 * because a learner-facing warning that overstates the danger is its own kind
 * of lie.
 */
export function ConfirmDialog({ onCancel, onConfirm, spec }: ConfirmDialogProps) {
  return (
    <div className="scrim" role="dialog">
      <div className="dialog">
        <h2>{spec.title}</h2>
        <p>{spec.detail}</p>
        <p className="muted">
          Değişiklik kaydedilene kadar dosyalara yazılmaz; kaydettikten sonra da git geçmişinden
          geri alınabilir.
        </p>
        <div className="row dialog-actions">
          <button className="danger" onClick={onConfirm} type="button">
            {spec.confirmLabel}
          </button>
          <button onClick={onCancel} type="button">
            Vazgeç
          </button>
        </div>
      </div>
    </div>
  );
}
