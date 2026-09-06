// Modelo central de dados: ResearchProject.
// Toda verificação de coerência do sistema deve ler/escrever este objeto,
// nunca depender apenas do histórico de conversa com a IA (ver spec item 36).

export type NivelAcademico =
  | 'graduacao'
  | 'especializacao'
  | 'mestrado'
  | 'doutorado'
  | 'selecao'
  | 'outro';

export type SimNaoTalvez = 'sim' | 'ainda_nao' | 'nao_sei';

export type EstadoModulo = 'nao_iniciado' | 'em_andamento' | 'precisa_revisao' | 'concluido';

export interface PerfilUsuario {
  nome: string;
  email: string;
  instituicao?: string;
  curso: string;
  nivel: NivelAcademico;
  areaConhecimento: string;
}

export interface Tarefa {
  id: string;
  origem: string; // ex: "marco_zero_item_1"
  descricao: string;
  criadaEm: string;
  concluida: boolean;
}

export interface ObjetivoEspecifico {
  id: string;
  descricao: string;
  comoVouFazer: string;
  resultadoEsperado: string;
}

export type TipoReferencia =
  | 'fundacional'
  | 'contemporanea'
  | 'metodologica'
  | 'normativa'
  | 'outra';

export interface Referencia {
  id: string;
  autor: string;
  ano: string;
  titulo: string;
  tipo: TipoReferencia;
  ideiaCentral: string;
  porQueUso: string;
  fonteOriginalDisponivel?: 'sim' | 'nao' | 'nao_se_aplica'; // para casos de apud
  ehApud: boolean;
}

export interface NoArvore {
  id: string;
  titulo: string;
  filhos: NoArvore[];
}

export type NaturezaPesquisa = 'basica' | 'aplicada' | '';
export type AbordagemPesquisa = 'qualitativa' | 'quantitativa' | 'mista' | '';

export interface EscolhaMetodologica {
  natureza: NaturezaPesquisa;
  naturezaJustificativa: string;
  abordagem: AbordagemPesquisa;
  abordagemJustificativa: string;
  delineamentos: string[]; // ids da KB, múltipla escolha
  /** Delineamentos que não estão na Base de Conhecimento, digitados livremente pelo estudante. */
  delineamentosCustom: string[];
  tecnicasColeta: string[]; // ids da KB
  tecnicasAnalise: string[]; // ids da KB
  relacaoColetaObjetivos: Record<string, string[]>; // tecnicaId -> objetivoIds
  sujeitosPesquisa: string;
  orientadorNome: string;
  orientadorEmail: string;
}

export interface EticaInfo {
  status: SimNaoTalvez | null;
  exigenciasIdentificadas: string[];
}

export interface MarcoZeroState {
  secoesDesenvolvidas: SimNaoTalvez | null;
  eixoMotivacao: SimNaoTalvez | null;
  eixoMotivacaoTexto: string;
  etica: EticaInfo;
  concluido: boolean;
}

export interface ArquiteturaPesquisaState {
  incomodoConfirmado: SimNaoTalvez | null;
  incomodoTexto: string;
  perguntaConfirmada: SimNaoTalvez | null;
  perguntaPesquisa: string;
  /** Texto exato da pergunta no momento da última confirmação — usado para
   * detectar mudança real (Regra 8) em vez de disparar revisão a cada tecla. */
  ultimaPerguntaConfirmadaTexto: string;
  necessitaHipotese: SimNaoTalvez | null;
  hipotese: string;
  objetivoGeral: string;
  objetivosEspecificos: ObjetivoEspecifico[];
  resultadosEsperados: string;
  ultimaVerificacaoCoerencia: string | null; // ISO date
  precisaRevisaoCoerencia: boolean;
}

export interface ArquiteturaTextoState {
  proporcionalidadeConfirmada: SimNaoTalvez | null;
  proporcionalidadeObservacoes: string;
  conteudoNoLugarCertoConfirmado: SimNaoTalvez | null;
  conteudoNoLugarCertoObservacoes: string;
  sumarioVisualizavel: SimNaoTalvez | null;
  estruturaProvisoria: NoArvore[];
}

export interface ReferencialState {
  referencias: Referencia[];
  textoParaConferencia: string; // texto colado pelo usuário p/ checagem bidirecional
}

export interface MetodologiaState extends EscolhaMetodologica {
  textoGerado: string;
  textoGeradoOrigens: Record<string, string>; // trecho -> qual resposta originou
  precisaRevisaoCoerencia: boolean;
}

export interface DecisoesConfirmadas {
  [chave: string]: boolean;
}

export interface ResearchProject {
  id: string;
  criadoEm: string;
  atualizadoEm: string;
  perfil: PerfilUsuario;
  tituloProvisorio: string;
  estagioAtual: string;
  marcoZero: MarcoZeroState;
  arquiteturaPesquisa: ArquiteturaPesquisaState;
  arquiteturaTexto: ArquiteturaTextoState;
  referencial: ReferencialState;
  metodologia: MetodologiaState;
  tarefasPendentes: Tarefa[];
  decisoesConfirmadas: DecisoesConfirmadas;
}

export const MODULOS = [
  'marco_zero',
  'arquitetura_pesquisa',
  'arquitetura_texto',
  'referencial',
  'metodologia',
  'sintese_redacao',
  'diagnostico_final',
] as const;

export type ModuloId = (typeof MODULOS)[number];
