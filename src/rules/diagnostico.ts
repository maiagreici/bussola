import type { ResearchProject } from '../types/project';
import { verificarCoerenciaArquiteturaPesquisa, verificarMatrizMetodologica } from './coherence';
import { estadoArquiteturaTexto, estadoMetodologia, estadoReferencial } from './moduleState';
import { conferirBibliografia } from '../utils/bibliografia';

export type EstadoSemaforo = 'verde' | 'amarelo' | 'vermelho';

export interface DimensaoDiagnostico {
  chave: string;
  nome: string;
  estado: EstadoSemaforo;
  criterio: string;
}

export interface ItemPrioridadeInterno {
  titulo: string;
  explicacao: string;
  impacto: number; // menor = mais urgente
}

function tarefaAberta(p: ResearchProject, origem: string): boolean {
  return p.tarefasPendentes.some((t) => t.origem === origem && !t.concluida);
}

export function diagnosticarProjeto(p: ResearchProject): { dimensoes: DimensaoDiagnostico[]; prioridades: ItemPrioridadeInterno[] } {
  const dimensoes: DimensaoDiagnostico[] = [];
  const prioridades: ItemPrioridadeInterno[] = [];

  // 1. Estrutura mínima
  if (tarefaAberta(p, 'marco_zero_secoes')) {
    dimensoes.push({ chave: 'estrutura', nome: 'Estrutura mínima', estado: 'vermelho', criterio: 'Ainda há seções obrigatórias sem nenhum parágrafo desenvolvido.' });
    prioridades.push({ titulo: 'Preencha ao menos um parágrafo em cada seção vazia', explicacao: 'Sem conteúdo mínimo em todas as seções, não há o que revisar em profundidade.', impacto: 0 });
  } else {
    dimensoes.push({ chave: 'estrutura', nome: 'Estrutura mínima', estado: 'verde', criterio: 'Todas as seções obrigatórias possuem conteúdo inicial.' });
  }

  // 2. Arquitetura lógica
  const ap = p.arquiteturaPesquisa;
  const alertasLogica = verificarCoerenciaArquiteturaPesquisa(p);
  if (!ap.perguntaPesquisa.trim() || !ap.objetivoGeral.trim()) {
    dimensoes.push({ chave: 'logica', nome: 'Arquitetura lógica', estado: 'vermelho', criterio: 'Pergunta de pesquisa e/ou objetivo geral ainda não foram definidos.' });
    prioridades.push({ titulo: 'Defina pergunta de pesquisa e objetivo geral', explicacao: 'Sem esses dois elementos, não é possível avaliar a coerência do restante da pesquisa.', impacto: 0 });
  } else if (alertasLogica.length > 0) {
    dimensoes.push({ chave: 'logica', nome: 'Arquitetura lógica', estado: 'amarelo', criterio: `${alertasLogica.length} ponto(s) de possível incoerência entre incômodo, pergunta, hipótese e objetivos.` });
    prioridades.push({ titulo: alertasLogica[0].titulo, explicacao: alertasLogica[0].explicacao, impacto: 1 });
  } else {
    dimensoes.push({ chave: 'logica', nome: 'Arquitetura lógica', estado: 'verde', criterio: 'Pergunta, objetivos e (se houver) hipótese estão alinhados.' });
  }

  // 3. Arquitetura textual
  const estadoTexto = estadoArquiteturaTexto(p);
  dimensoes.push({
    chave: 'texto',
    nome: 'Arquitetura textual',
    estado:
      estadoTexto === 'concluido' ? 'verde' : estadoTexto === 'nao_iniciado' || estadoTexto === 'precisa_revisao' ? 'vermelho' : 'amarelo',
    criterio:
      estadoTexto === 'precisa_revisao'
        ? 'Você respondeu "ainda não" em algum item, mas escreveu pouco ou nada sobre o que precisa corrigir.'
        : 'Proporcionalidade das seções, conteúdo no lugar certo e sumário provisório definido.',
  });
  if (estadoTexto === 'nao_iniciado') {
    prioridades.push({ titulo: 'Esboce seu sumário provisório', explicacao: 'Sem uma estrutura mínima de capítulos, fica difícil avaliar se o texto reflete a pesquisa.', impacto: 3 });
  }
  if (estadoTexto === 'precisa_revisao') {
    prioridades.push({ titulo: 'Detalhe o que está desproporcional ou fora do lugar', explicacao: 'Você sinalizou um problema na Arquitetura do Texto, mas a explicação está vazia ou muito curta para ser acionável.', impacto: 1 });
  }

  // 4. Referencial
  const estadoRef = estadoReferencial(p);
  dimensoes.push({
    chave: 'referencial',
    nome: 'Referencial teórico',
    estado: estadoRef === 'concluido' ? 'verde' : estadoRef === 'nao_iniciado' ? 'vermelho' : 'amarelo',
    criterio: 'Cada referência central possui ideia central e justificativa de uso registradas.',
  });
  if (estadoRef === 'nao_iniciado') {
    prioridades.push({ titulo: 'Cadastre suas referências centrais', explicacao: 'Sem referências registradas, não é possível avaliar a fundamentação teórica.', impacto: 2 });
  }

  // 5. Metodologia
  const estadoMetodo = estadoMetodologia(p);
  const alertasMatriz = verificarMatrizMetodologica(p);
  dimensoes.push({
    chave: 'metodologia',
    nome: 'Metodologia',
    estado: p.metodologia.precisaRevisaoCoerencia ? 'vermelho' : estadoMetodo === 'concluido' ? 'verde' : estadoMetodo === 'nao_iniciado' ? 'vermelho' : 'amarelo',
    criterio: 'Natureza, abordagem, delineamento, coleta e análise formam um conjunto coerente.',
  });
  if (p.metodologia.precisaRevisaoCoerencia) {
    prioridades.push({ titulo: 'Revise sua metodologia após a mudança na pergunta de pesquisa', explicacao: 'Sua pergunta mudou depois que a metodologia foi definida — confirme se ainda faz sentido.', impacto: 0 });
  } else if (alertasMatriz.length > 0) {
    prioridades.push({ titulo: alertasMatriz[0].titulo, explicacao: alertasMatriz[0].explicacao, impacto: 1 });
  }

  // 6. Ética
  const etica = p.marcoZero.etica;
  if (etica.status === 'sim') {
    dimensoes.push({ chave: 'etica', nome: 'Ética', estado: 'verde', criterio: 'Principais exigências éticas foram identificadas pelo estudante.' });
  } else if (etica.exigenciasIdentificadas.length > 0) {
    dimensoes.push({ chave: 'etica', nome: 'Ética', estado: 'amarelo', criterio: 'Algumas exigências foram listadas, mas ainda precisam ser confirmadas institucionalmente.' });
  } else {
    dimensoes.push({ chave: 'etica', nome: 'Ética', estado: 'vermelho', criterio: 'Nenhuma exigência ética foi listada ainda.' });
    prioridades.push({ titulo: 'Liste as possíveis exigências éticas da sua pesquisa', explicacao: 'Mesmo com dúvidas, é preciso registrar o que será verificado junto à sua instituição.', impacto: 2 });
  }

  // 7. Referências (conferência bibliográfica)
  const refs = p.referencial.referencias;
  const conf = conferirBibliografia(p.referencial.textoParaConferencia, refs);
  const problemasRef = conf.citacoesSemReferencia.length + conf.dadosIncompletos.length;
  if (refs.length === 0) {
    dimensoes.push({ chave: 'referencias', nome: 'Referências (conferência)', estado: 'vermelho', criterio: 'Nenhuma referência cadastrada para conferência.' });
  } else if (problemasRef > 0) {
    dimensoes.push({ chave: 'referencias', nome: 'Referências (conferência)', estado: 'vermelho', criterio: 'Há citações sem referência correspondente ou dados incompletos.' });
    prioridades.push({ titulo: 'Corrija pendências na lista de referências', explicacao: 'Existem citações no texto sem referência correspondente, ou referências com dados incompletos.', impacto: 1 });
  } else if (conf.referenciasNaoCitadas.length > 0 || conf.possiveisDuplicidades.length > 0) {
    dimensoes.push({ chave: 'referencias', nome: 'Referências (conferência)', estado: 'amarelo', criterio: 'Há referências aparentemente não citadas ou possíveis duplicidades.' });
  } else {
    dimensoes.push({ chave: 'referencias', nome: 'Referências (conferência)', estado: 'verde', criterio: 'Conferência bidirecional sem pendências encontradas.' });
  }

  return { dimensoes, prioridades: prioridades.sort((a, b) => a.impacto - b.impacto) };
}
