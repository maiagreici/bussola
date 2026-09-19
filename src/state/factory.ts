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
      textoReferencias: '',
      reflexaoGeral: '',
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
 *
 * Também migra projetos salvos antes do Referencial virar um bloco único de
 * colagem: converte a antiga lista estruturada (referencias: Referencia[])
 * em texto, uma referência por linha, preservando os dados já digitados.
 */
export function normalizarProjeto(p: ResearchProject): ResearchProject {
  const ap = p.arquiteturaPesquisa;
  const m = p.metodologia;
  const ref = p.referencial as ResearchProject['referencial'] & {
    referencias?: { autor: string; ano: string; titulo: string; porQueUso?: string }[];
  };
  const referenciasAntigas = ref.referencias;
  const referencial =
    typeof ref.textoReferencias === 'string'
      ? { ...ref, referencias: undefined }
      : {
          textoReferencias: (referenciasAntigas ?? [])
            .map((r) => [r.autor, r.ano ? `(${r.ano})` : '', r.titulo].filter(Boolean).join(' ').trim())
            .filter(Boolean)
            .join('\n'),
          reflexaoGeral: (referenciasAntigas ?? []).map((r) => r.porQueUso).filter(Boolean).join('\n'),
          textoParaConferencia: ref.textoParaConferencia ?? '',
        };
  delete (referencial as { referencias?: unknown }).referencias;
  return {
    ...p,
    arquiteturaPesquisa: {
      ...ap,
      ultimaPerguntaConfirmadaTexto: ap.ultimaPerguntaConfirmadaTexto ?? ap.perguntaPesquisa ?? '',
    },
    referencial,
    metodologia: {
      ...m,
      delineamentosCustom: m.delineamentosCustom ?? [],
      sujeitosPesquisa: m.sujeitosPesquisa ?? '',
      orientadorNome: m.orientadorNome ?? '',
      orientadorEmail: m.orientadorEmail ?? '',
    },
  };
}
