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
      tecnicasColeta: [],
      tecnicasAnalise: [],
      relacaoColetaObjetivos: {},
      textoGerado: '',
      textoGeradoOrigens: {},
      precisaRevisaoCoerencia: false,
    },
    tarefasPendentes: [],
    decisoesConfirmadas: {},
  };
}
