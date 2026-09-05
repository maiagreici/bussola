import type { EstadoModulo } from '../types/project';
import { StatusBadge } from './StatusBadge';

interface Props {
  titulo: string;
  descricao: string;
  estado: EstadoModulo;
  bloqueado?: boolean;
  motivoBloqueio?: string;
  onClick: () => void;
}

export function ModuleCard({ titulo, descricao, estado, bloqueado, motivoBloqueio, onClick }: Props) {
  return (
    <button type="button" className="module-card" onClick={onClick} disabled={bloqueado}>
      <div className="row-between">
        <strong>{titulo}</strong>
        <StatusBadge estado={estado} />
      </div>
      <p className="help-text" style={{ margin: 0 }}>{descricao}</p>
      {bloqueado && motivoBloqueio && <p className="help-text" style={{ margin: 0 }}>🔒 {motivoBloqueio}</p>}
    </button>
  );
}
