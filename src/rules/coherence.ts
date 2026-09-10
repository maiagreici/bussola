import type { ResearchProject } from '../types/project';

// Motor de regras de negócio (spec item 37).
// Funções puras: recebem o projeto, devolvem um novo projeto (ou avisos).
// Nunca decidem por conta própria algo que exija autoria humana (Regra 1/2/3).

export interface AlertaCoerencia {
  id: string;
  titulo: string;
  explicacao: string;
  prioridade: number; // menor = mais urgente
}

/** Regra 8: alterações importantes disparam nova verificação de coerência. */
export function marcarRevisaoPorMudancaDePergunta(projeto: ResearchProject): ResearchProject {
  return {
    ...projeto,
    arquiteturaPesquisa: { ...projeto.arquiteturaPesquisa, precisaRevisaoCoerencia: true },
    metodologia: { ...projeto.metodologia, precisaRevisaoCoerencia: true },
  };
}

/** Regra 4: falha estrutural gera tarefa pendente (não bloqueia, apenas registra). */
export function criarTarefaSeNecessario(
  projeto: ResearchProject,
  origem: string,
  descricao: string,
): ResearchProject {
  const jaExiste = projeto.tarefasPendentes.some((t) => t.origem === origem && !t.concluida);
  if (jaExiste) return projeto;
  return {
    ...projeto,
    tarefasPendentes: [
      ...projeto.tarefasPendentes,
      {
        id: origem + '_' + Date.now().toString(36),
        origem,
        descricao,
        criadaEm: new Date().toISOString(),
        concluida: false,
      },
    ],
  };
}

export function concluirTarefasPorOrigem(projeto: ResearchProject, origem: string): ResearchProject {
  return {
    ...projeto,
    tarefasPendentes: projeto.tarefasPendentes.map((t) =>
      t.origem === origem ? { ...t, concluida: true } : t,
    ),
  };
}

/**
 * Verificação de coerência lógica do Bloco 1: incômodo -> pergunta -> hipótese
 * -> objetivo geral -> objetivos específicos.
 * Retorna no máximo 3 alertas prioritários (Regra 5).
 */
export function verificarCoerenciaArquiteturaPesquisa(projeto: ResearchProject): AlertaCoerencia[] {
  const ap = projeto.arquiteturaPesquisa;
  const alertas: AlertaCoerencia[] = [];

  if (ap.perguntaPesquisa && ap.objetivoGeral) {
    const palavrasPergunta = extrairPalavrasChave(ap.perguntaPesquisa);
    const palavrasObjetivo = extrairPalavrasChave(ap.objetivoGeral);
    const intersecao = palavrasPergunta.filter((p) => palavrasObjetivo.includes(p));
    if (intersecao.length === 0 && palavrasPergunta.length > 0) {
      alertas.push({
        id: 'objetivo_desalinhado',
        titulo: 'Objetivo geral pode não responder à pergunta de pesquisa',
        explicacao:
          'Não encontramos nenhum termo em comum entre sua pergunta e seu objetivo geral. Isso pode indicar uma mudança de foco não intencional. Releia os dois lado a lado e confirme se o objetivo realmente responde à pergunta.',
        prioridade: 1,
      });
    }
  }

  if (ap.objetivoGeral && !/\b\w+(ar|er|ir)\b/i.test(ap.objetivoGeral.trim().split(/\s+/)[0] || '')) {
    alertas.push({
      id: 'objetivo_sem_infinitivo',
      titulo: 'Objetivo geral pode não estar iniciado por verbo no infinitivo',
      explicacao:
        'Objetivos de pesquisa costumam iniciar com um verbo no infinitivo (compreender, analisar, identificar...). Verifique a primeira palavra do seu objetivo geral.',
      prioridade: 2,
    });
  }

  const objetivosVagos = ap.objetivosEspecificos.filter(
    (o) => !o.comoVouFazer.trim() || !o.resultadoEsperado.trim(),
  );
  if (objetivosVagos.length > 0) {
    alertas.push({
      id: 'objetivos_especificos_incompletos',
      titulo: `${objetivosVagos.length} objetivo(s) específico(s) sem procedimento ou resultado esperado`,
      explicacao:
        'Um objetivo específico precisa de uma ação clara, um procedimento possível e um resultado correspondente. Complete as colunas "Como vou fazer?" e "Resultado esperado" para cada linha.',
      prioridade: 1,
    });
  }

  if (ap.necessitaHipotese === 'sim' && !ap.hipotese.trim()) {
    alertas.push({
      id: 'hipotese_ausente',
      titulo: 'Você indicou que precisa de hipótese, mas ela ainda não foi escrita',
      explicacao:
        'Volte à etapa de hipótese e registre uma resposta provisória coerente com sua pergunta de pesquisa.',
      prioridade: 1,
    });
  }

  return alertas.sort((a, b) => a.prioridade - b.prioridade).slice(0, 3);
}

function extrairPalavrasChave(texto: string): string[] {
  const stopwords = new Set([
    'de', 'da', 'do', 'das', 'dos', 'e', 'a', 'o', 'as', 'os', 'em', 'para', 'com',
    'que', 'como', 'qual', 'quais', 'sobre', 'um', 'uma', 'no', 'na', 'nos', 'nas',
    'ao', 'aos', 'à', 'às', 'por', 'se', 'é', 'são', 'ser', 'ter',
  ]);
  return texto
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^\w\s]/g, '')
    .split(/\s+/)
    .filter((p) => p.length > 3 && !stopwords.has(p));
}

/** Matriz de coerência metodológica: detecta incompatibilidades óbvias coleta x abordagem. */
export function verificarMatrizMetodologica(projeto: ResearchProject): AlertaCoerencia[] {
  const m = projeto.metodologia;
  const alertas: AlertaCoerencia[] = [];

  if (m.abordagem === 'qualitativa' && m.tecnicasColeta.length > 0) {
    const somenteFechadas = m.tecnicasColeta.every((t) => t === 'questionario_fechado' || t === 'escala');
    if (somenteFechadas) {
      alertas.push({
        id: 'coleta_incompativel_abordagem',
        titulo: 'Técnica de coleta pode não ser suficiente para uma abordagem qualitativa',
        explicacao:
          'Você indicou abordagem qualitativa, mas as técnicas de coleta escolhidas produzem apenas respostas fechadas. Verifique se isso é suficiente para captar os significados e experiências que sua pergunta busca compreender.',
        prioridade: 1,
      });
    }
  }

  if (m.tecnicasColeta.length > 0 && m.tecnicasAnalise.length === 0) {
    alertas.push({
      id: 'analise_ausente',
      titulo: 'Você definiu como coletar dados, mas ainda não definiu como vai analisá-los',
      explicacao: 'Toda técnica de coleta precisa de um método de análise correspondente.',
      prioridade: 1,
    });
  }

  if (m.natureza === '' || m.abordagem === '') {
    alertas.push({
      id: 'metodologia_incompleta',
      titulo: 'Natureza ou abordagem da pesquisa ainda não foram definidas',
      explicacao: 'Essas são decisões estruturais que precisam vir antes do delineamento e das técnicas.',
      prioridade: 1,
    });
  }

  return alertas.sort((a, b) => a.prioridade - b.prioridade).slice(0, 3);
}
