import { useState } from 'react';

export interface ItemPrioridade {
  titulo: string;
  explicacao: string;
}

export function PriorityList({ titulo, prioritarias, outras }: { titulo?: string; prioritarias: ItemPrioridade[]; outras: ItemPrioridade[] }) {
  const [aberto, setAberto] = useState(false);
  return (
    <div className="stack">
      <h3 style={{ margin: 0 }}>{titulo ?? 'As três coisas que eu faria antes de enviar ao orientador'}</h3>
      {prioritarias.length === 0 && (
        <p className="help-text">Nenhuma prioridade crítica identificada com os critérios atuais — bom sinal.</p>
      )}
      {prioritarias.map((p, i) => (
        <div className="priority-item" key={i}>
          <span className="priority-num" aria-hidden="true">{i + 1}</span>
          <div>
            <strong>{p.titulo}</strong>
            <p className="help-text" style={{ margin: '2px 0 0' }}>{p.explicacao}</p>
          </div>
        </div>
      ))}
      {outras.length > 0 && (
        <div className="accordion">
          <button
            type="button"
            className="btn ghost"
            style={{ width: '100%', justifyContent: 'space-between', padding: '12px 14px' }}
            aria-expanded={aberto}
            onClick={() => setAberto((v) => !v)}
          >
            Outras melhorias ({outras.length}) {aberto ? '▲' : '▼'}
          </button>
          {aberto && (
            <div className="accordion-body stack">
              {outras.map((o, i) => (
                <div key={i}>
                  <strong>{o.titulo}</strong>
                  <p className="help-text" style={{ margin: '2px 0 0' }}>{o.explicacao}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
