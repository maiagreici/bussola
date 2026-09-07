import type { PerfilUsuario, ResearchProject } from '../types/project';

export function novoId(): string {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
}

export function criarProjeto(
  perfil: PerfilUsuario,
  tituloProvisorio: string,
  estagioAtual: string,
): ResearchProject {
  const agora = new Date().toISOString();
  return {
    id: novoId(),
    criadoEm: agora,
    atualizadoEm: agora,
    perfil,
    tituloProvisorio,
    estagioAtual,
    marcoZero: {
      secoesDesenvolvidas: null,
      eixoMotivacao: null,
      eixoMotivacaoTexto: '',
      etica: { status: null, exigenciasIdentificadas: [] },
      concluido: false,
    },
    arquiteturaPesquisa: {
      incomodoConfirmado: null,
      incomodoTexto: '',
      perguntaConfirmada: null,
      perguntaPesquisa: '',
      ultimaPerguntaConfirmadaTexto: '',
      necessitaHipotese: null,
      hipotese: '',
      objetivoGeral: '',
      objetivosEspecificos: [],
      resultadosEsperados: '',
      ultimaVerificacaoCoerencia: null,
      precisaRevisaoCoerencia: false,
    },
    arquiteturaTexto: {
      proporcionalidadeConfirmada: null,
      proporcionalidadeObservacoes: '',
      conteudoNoLugarCertoConfirmado: null,
      conteudoNoLugarCertoObservacoes: '',
      sumarioVisualizavel: null,
      estruturaProvisoria: [],
    },
    referencial: {
      referencias: [],
      textoParaConferencia: '',
    },
    metodologia: {
      natureza: '',
      naturezaJustificativa: '',
      abordagem: '',
      abordagemJustificativa: '',
      delineamentos: [],
      delineamentosCustom: [],
      tecnicasColeta: [],
      tecnicasAnalise: [],
      relacaoColetaObjetivos: {},
      sujeitosPesquisa: '',
      orientadorNome: '',
      orientadorEmail: '',
      textoGerado: '',
      textoGeradoOrigens: {},
      precisaRevisaoCoerencia: false,
    },
    tarefasPendentes: [],
    decisoesConfirmadas: {},
  };
}

/**
 * Preenche com valores padrão os campos que foram adicionados ao modelo de
 * dados depois que um projeto já existia salvo (localStorage ou backend).
 *
 * BUG que isso corrige: um projeto salvo antes do campo
 * `ultimaPerguntaConfirmadaTexto` existir carregava esse campo como
 * `undefined`. Isso fazia a tela de Arquitetura da Pesquisa achar, por
 * engano, que a pergunta tinha sido editada desde a última confirmação
 * (undefined !== texto real) — bastava o estudante clicar em "Confirmar"
 * de novo (para tirar aquele aviso) para a Regra 8 disparar sem necessidade
 * e marcar a Metodologia como "precisa revisão" (vermelho) mesmo com tudo
 * preenchido corretamente.
 */
export function normalizarProjeto(p: ResearchProject): ResearchProject {
  const ap = p.arquiteturaPesquisa;
  const m = p.metodologia;
  return {
    ...p,
    arquiteturaPesquisa: {
      ...ap,
      ultimaPerguntaConfirmadaTexto: ap.ultimaPerguntaConfirmadaTexto ?? ap.perguntaPesquisa ?? '',
    },
    metodologia: {
      ...m,
      delineamentosCustom: m.delineamentosCustom ?? [],
      sujeitosPesquisa: m.sujeitosPesquisa ?? '',
      orientadorNome: m.orientadorNome ?? '',
      orientadorEmail: m.orientadorEmail ?? '',
    },
  };
}
