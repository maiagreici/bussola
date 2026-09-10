interface Props {
  valor: number; // 0-100
  rotulo?: string;
}

export function ProgressBar({ valor, rotulo }: Props) {
  const clamped = Math.max(0, Math.min(100, Math.round(valor)));
  return (
    <div>
      {rotulo && (
        <div className="row-between" style={{ marginBottom: 6 }}>
          <span className="help-text">{rotulo}</span>
          <span className="help-text">{clamped}%</span>
        </div>
      )}
      <div
        className="progress-track"
        role="progressbar"
        aria-valuenow={clamped}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={rotulo ?? 'Progresso'}
      >
        <div className="progress-fill" style={{ width: `${clamped}%` }} />
      </div>
    </div>
  );
}
