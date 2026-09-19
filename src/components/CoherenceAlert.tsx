import type { AlertaCoerencia } from '../rules/coherence';

export function CoherenceAlerts({ alertas, tituloOk }: { alertas: AlertaCoerencia[]; tituloOk: string }) {
  if (alertas.length === 0) {
    return (
      <div className="alert success" role="status">
        <strong>✅ {tituloOk}</strong>
      </div>
    );
  }
  return (
    <div className="stack">
      <div className="alert warning" role="status">
        <strong>Há pontos que precisam de revisão</strong>
        <p className="help-text" style={{ margin: '4px 0 0' }}>
          Mostrando no máximo as três prioridades mais importantes agora.
        </p>
      </div>
      {alertas.map((a) => (
        <div className="alert warning" key={a.id}>
          <strong>{a.titulo}</strong>
          <p style={{ margin: '6px 0 0' }}>{a.explicacao}</p>
        </div>
      ))}
    </div>
  );
}
