import type { EstadoModulo } from '../types/project';

const rotulos: Record<EstadoModulo, string> = {
  nao_iniciado: 'Não iniciado',
  em_andamento: 'Em andamento',
  precisa_revisao: 'Precisa de revisão',
  concluido: 'Concluído',
};

export function StatusBadge({ estado }: { estado: EstadoModulo }) {
  return <span className={`badge ${estado}`}>{rotulos[estado]}</span>;
}
