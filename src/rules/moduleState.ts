import type { EstadoModulo, ModuloId, ResearchProject } from '../types/project';
import { verificarCoerenciaArquiteturaPesquisa, verificarMatrizMetodologica } from './coherence';

export function estadoMarcoZero(p: ResearchProject): EstadoModulo {
  const mz = p.marcoZero;
  if (mz.concluido) return 'concluido';
  const respondidas = [mz.secoesDesenvolvidas, mz.eixoMotivacao, mz.etica.status].filter(Boolean).length;
  if (respondidas === 0) return 'nao_iniciado';
  return 'em_andamento';
}

export function estadoArquiteturaPesquisa(p: ResearchProject): EstadoModulo {
  const ap = p.arquiteturaPesquisa;
  const nada = !ap.incomodoTexto && !ap.perguntaPesquisa && !ap.objetivoGeral && ap.objetivosEspecificos.length === 0;
  if (nada) return 'nao_iniciado';
  if (ap.precisaRevisaoCoerencia) return 'precisa_revisao';
  const completo =
    !!ap.perguntaPesquisa.trim() &&
    !!ap.objetivoGeral.trim() &&
    ap.objetivosEspecificos.length > 0 &&
    ap.objetivosEspecificos.every((o) => o.comoVouFazer.trim() && o.resultadoEsperado.trim());
  if (completo && verificarCoerenciaArquiteturaPesquisa(p).length === 0) return 'concluido';
  return 'em_andamento';
}

export function estadoArquiteturaTexto(p: ResearchProject): EstadoModulo {
  const at = p.arquiteturaTexto;
  const nada =
    at.proporcionalidadeConfirmada === null &&
    at.conteudoNoLugarCertoConfirmado === null &&
    at.estruturaProvisoria.length === 0;
  if (nada) return 'nao_iniciado';
  const completo =
    at.proporcionalidadeConfirmada !== null &&
    at.conteudoNoLugarCertoConfirmado !== null &&
    at.estruturaProvisoria.length > 0;
  return completo ? 'concluido' : 'em_andamento';
}

export function estadoReferencial(p: ResearchProject): EstadoModulo {
  const refs = p.referencial.referencias;
  if (refs.length === 0) return 'nao_iniciado';
  const completo = refs.every((r) => r.ideiaCentral.trim() && r.porQueUso.trim());
  return completo ? 'concluido' : 'em_andamento';
}

export function estadoMetodologia(p: ResearchProject): EstadoModulo {
  const m = p.metodologia;
  const nada = !m.natureza && !m.abordagem && m.delineamentos.length === 0 && m.tecnicasColeta.length === 0;
  if (nada) return 'nao_iniciado';
  if (m.precisaRevisaoCoerencia) return 'precisa_revisao';
  const completo =
    !!m.natureza &&
    !!m.abordagem &&
    m.delineamentos.length > 0 &&
    m.tecnicasColeta.length > 0 &&
    m.tecnicasAnalise.length > 0 &&
    !!m.textoGerado;
  if (completo && verificarMatrizMetodologica(p).length === 0) return 'concluido';
  return 'em_andamento';
}

export function estadoDiagnostico(p: ResearchProject): EstadoModulo {
  const modulos: EstadoModulo[] = [
    estadoMarcoZero(p),
    estadoArquiteturaPesquisa(p),
    estadoArquiteturaTexto(p),
    estadoReferencial(p),
    estadoMetodologia(p),
  ];
  return modulos.every((m) => m === 'concluido') ? 'concluido' : 'nao_iniciado';
}

export function estadoModulo(id: ModuloId, p: ResearchProject): EstadoModulo {
  switch (id) {
    case 'marco_zero':
      return estadoMarcoZero(p);
    case 'arquitetura_pesquisa':
      return estadoArquiteturaPesquisa(p);
    case 'arquitetura_texto':
      return estadoArquiteturaTexto(p);
    case 'referencial':
      return estadoReferencial(p);
    case 'metodologia':
      return estadoMetodologia(p);
    case 'sintese_redacao':
      return p.metodologia.textoGerado ? 'concluido' : 'nao_iniciado';
    case 'diagnostico_final':
      return estadoDiagnostico(p);
  }
}

export function progressoGeral(p: ResearchProject): number {
  const modulos: ModuloId[] = ['marco_zero', 'arquitetura_pesquisa', 'arquitetura_texto', 'referencial', 'metodologia'];
  const pontos: number[] = modulos.map((m) => {
    const e = estadoModulo(m, p);
    if (e === 'concluido') return 1;
    if (e === 'em_andamento' || e === 'precisa_revisao') return 0.5;
    return 0;
  });
  return (pontos.reduce((a, b) => a + b, 0) / modulos.length) * 100;
}
