import type { ResearchProject } from '../types/project';
import type { DimensaoDiagnostico, ItemPrioridadeInterno } from '../rules/diagnostico';

const ROTULO_SEMAFORO: Record<string, string> = { verde: '🟢', amarelo: '🟡', vermelho: '🔴' };

export function gerarTextoDiagnostico(
  p: ResearchProject,
  dimensoes: DimensaoDiagnostico[],
  prioridades: ItemPrioridadeInterno[],
): string {
  const linhas: string[] = [];
  linhas.push('DIAGNÓSTICO DE MATURIDADE DA PESQUISA — Bússola');
  linhas.push(`Título provisório: ${p.tituloProvisorio}`);
  linhas.push(`Estudante: ${p.perfil.nome} (${p.perfil.curso}, ${p.perfil.nivel})`);
  linhas.push(`Gerado em: ${new Date().toLocaleString('pt-BR')}`);
  linhas.push('');
  linhas.push('DIMENSÕES');
  dimensoes.forEach((d) => {
    linhas.push(`${ROTULO_SEMAFORO[d.estado]} ${d.nome} — ${d.criterio}`);
  });
  linhas.push('');
  linhas.push('AS TRÊS COISAS QUE EU FARIA ANTES DE ENVIAR AO ORIENTADOR');
  prioridades.slice(0, 3).forEach((p2, i) => {
    linhas.push(`${i + 1}. ${p2.titulo} — ${p2.explicacao}`);
  });
  if (prioridades.length > 3) {
    linhas.push('');
    linhas.push('OUTRAS MELHORIAS');
    prioridades.slice(3).forEach((p2) => linhas.push(`- ${p2.titulo} — ${p2.explicacao}`));
  }
  return linhas.join('\n');
}

export function baixarComoArquivo(nomeArquivo: string, conteudo: string) {
  const blob = new Blob([conteudo], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = nomeArquivo;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
