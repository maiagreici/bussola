import type { ItemKB } from '../knowledge';
import { Accordion } from './Accordion';

interface Props {
  item: ItemKB;
  selecionado: boolean;
  onToggle: () => void;
  multipla?: boolean;
}

export function KBCard({ item, selecionado, onToggle, multipla = true }: Props) {
  return (
    <div className="card kb-card" style={{ borderColor: selecionado ? 'var(--primary)' : undefined }}>
      <div className="row-between">
        <div>
          <strong>{item.nome}</strong>
          <p className="help-text" style={{ margin: '4px 0 0' }}>{item.definicao_curta}</p>
        </div>
        <button
          type="button"
          className={`btn ${selecionado ? '' : 'secondary'}`}
          aria-pressed={selecionado}
          onClick={onToggle}
        >
          {selecionado ? 'Selecionado' : multipla ? 'Selecionar' : 'Escolher'}
        </button>
      </div>
      <Accordion titulo="Quero entender melhor">
        <p><strong>Quando faz sentido: </strong>{item.quando_usar}</p>
        <p><strong>Exemplo: </strong>{item.exemplo}</p>
        <p>{item.explicacao}</p>
        {item.alertas.length > 0 && (
          <ul>
            {item.alertas.map((a, i) => <li key={i}>{a}</li>)}
          </ul>
        )}
        <p className="help-text"><strong>Referência metodológica: </strong>{item.referencias.join('; ')}</p>
      </Accordion>
    </div>
  );
}
