import type { EscolhaMetodologica, NoArvore, ObjetivoEspecifico } from '../types/project';
import { buscarItemKB } from '../knowledge';

// Camada de abstração de IA (spec item 41).
// Nenhuma chave de API deve existir no frontend. Esta interface define o
// contrato que uma implementação real (chamando um backend próprio, que por
// sua vez chama um provedor de IA) deveria seguir. A implementação abaixo é
// um MOCK determinístico — nunca inventa referência, dado ou conteúdo
// científico; apenas reorganiza o que o próprio usuário escreveu.
//
// PONTO DE INTEGRAÇÃO FUTURA: substituir `MockAIService` por uma classe que
// chame `fetch('/api/ai/...')`, onde o backend guarda a chave do provedor.

export interface PossibilidadePergunta {
  rotulo: string; // "Possibilidade A"
  pergunta: string;
  explicacao: string;
}

export interface AIService {
  identificarTensoesNoIncomodo(textoIncomodo: string): Promise<string[]>;
  sugerirPerguntasDePesquisa(textoIncomodo: string): Promise<PossibilidadePergunta[]>;
  verificarAlinhamentoObjetivoPergunta(pergunta: string, objetivoGeral: string): Promise<string | null>;
  sugerirEstruturaSumario(contexto: { titulo: string; area: string }): Promise<NoArvore[]>;
  gerarTextoMetodologico(
    metodologia: EscolhaMetodologica,
    objetivos: ObjetivoEspecifico[],
  ): Promise<{ texto: string; origens: Record<string, string> }>;
}

function idAleatorio(): string {
  return Math.random().toString(36).slice(2, 10);
}

function extrairSubstantivosSimples(texto: string): string[] {
  const stopwords = new Set([
    'de', 'da', 'do', 'das', 'dos', 'e', 'a', 'o', 'as', 'os', 'em', 'para', 'com',
    'que', 'como', 'qual', 'quais', 'sobre', 'um', 'uma', 'no', 'na', 'nos', 'nas',
    'ao', 'aos', 'por', 'se', 'é', 'são', 'ser', 'ter', 'muito', 'mais', 'isso',
    'esse', 'essa', 'este', 'esta', 'eu', 'me', 'minha', 'meu', 'não', 'mas',
  ]);
  return Array.from(
    new Set(
      texto
        .toLowerCase()
        .normalize('NFD')
        .replace(/[̀-ͯ]/g, '')
        .replace(/[^\w\s]/g, '')
        .split(/\s+/)
        .filter((p) => p.length > 4 && !stopwords.has(p)),
    ),
  );
}

export class MockAIService implements AIService {
  async identificarTensoesNoIncomodo(textoIncomodo: string): Promise<string[]> {
    if (!textoIncomodo.trim()) return [];
    const termos = extrairSubstantivosSimples(textoIncomodo).slice(0, 5);
    if (termos.length === 0) return [];
    return [
      `[MOCK] O texto menciona repetidamente os termos "${termos.slice(0, 3).join('", "')}" — vale explicitar como eles se relacionam entre si.`,
      `[MOCK] Considere se há uma tensão entre o que "deveria acontecer" e o que você observa acontecer na prática — isso costuma ser o núcleo de um bom problema de pesquisa.`,
    ];
  }

  async sugerirPerguntasDePesquisa(textoIncomodo: string): Promise<PossibilidadePergunta[]> {
    const termos = extrairSubstantivosSimples(textoIncomodo);
    const foco1 = termos[0] ?? 'esse fenômeno';
    const foco2 = termos[1] ?? 'esse contexto';
    const foco3 = termos[2] ?? 'essa relação';
    return [
      {
        rotulo: 'Possibilidade A — foco descritivo',
        pergunta: `Como se caracteriza ${foco1} no contexto observado?`,
        explicacao: 'Foca em descrever e mapear o fenômeno, sem ainda buscar explicações causais. Costuma pedir delineamento descritivo.',
      },
      {
        rotulo: 'Possibilidade B — foco explicativo',
        pergunta: `Quais fatores explicam ${foco2} a partir de ${foco1 !== foco2 ? foco1 : 'do fenômeno observado'}?`,
        explicacao: 'Busca relações de causa/efeito ou determinantes. Costuma exigir mais controle metodológico.',
      },
      {
        rotulo: 'Possibilidade C — foco compreensivo',
        pergunta: `Como os envolvidos experienciam/compreendem ${foco3 !== foco1 ? foco3 : foco1} nesse contexto?`,
        explicacao: 'Foca em significados e experiências subjetivas. Costuma indicar abordagem qualitativa.',
      },
    ];
  }

  async verificarAlinhamentoObjetivoPergunta(pergunta: string, objetivoGeral: string): Promise<string | null> {
    if (!pergunta.trim() || !objetivoGeral.trim()) return null;
    const termosPergunta = new Set(extrairSubstantivosSimples(pergunta));
    const termosObjetivo = extrairSubstantivosSimples(objetivoGeral);
    const emComum = termosObjetivo.filter((t) => termosPergunta.has(t));
    if (emComum.length === 0) {
      return '[MOCK] Não encontramos termos em comum entre a pergunta e o objetivo geral. Releia os dois e confirme se o foco não mudou no caminho.';
    }
    return null;
  }

  async sugerirEstruturaSumario(contexto: { titulo: string; area: string }): Promise<NoArvore[]> {
    const raiz = (titulo: string, filhos: NoArvore[] = []): NoArvore => ({ id: idAleatorio(), titulo, filhos });
    return [
      raiz('Introdução', [raiz('Contextualização'), raiz('Problema e justificativa'), raiz('Objetivos')]),
      raiz('Referencial teórico', [raiz(`Conceitos centrais sobre ${contexto.area || 'o tema'}`), raiz('Estudos relacionados')]),
      raiz('Metodologia', [raiz('Natureza e abordagem'), raiz('Procedimentos de coleta'), raiz('Procedimentos de análise')]),
      raiz('Resultados'),
      raiz('Discussão'),
      raiz('Considerações finais'),
      raiz('Referências'),
    ];
  }

  async gerarTextoMetodologico(
    metodologia: EscolhaMetodologica,
    objetivos: ObjetivoEspecifico[],
  ): Promise<{ texto: string; origens: Record<string, string> }> {
    const origens: Record<string, string> = {};
    const partes: string[] = [];

    const naturezaNome = metodologia.natureza
      ? buscarItemKB(metodologia.natureza)?.nome ?? metodologia.natureza
      : '[INFORMAÇÃO AUSENTE — natureza da pesquisa ainda não definida]';
    const trechoNatureza = `A pesquisa caracteriza-se, quanto à sua natureza, como ${naturezaNome.toLowerCase()}`;
    partes.push(trechoNatureza);
    origens[trechoNatureza] = 'Resposta confirmada na etapa "Natureza da pesquisa"';

    const abordagemNome = metodologia.abordagem
      ? buscarItemKB(metodologia.abordagem)?.nome ?? metodologia.abordagem
      : '[INFORMAÇÃO AUSENTE — abordagem ainda não definida]';
    const trechoAbordagem = `possuindo abordagem ${abordagemNome.toLowerCase()}`;
    partes.push(trechoAbordagem);
    origens[trechoAbordagem] = 'Resposta confirmada na etapa "Abordagem"';

    if (metodologia.delineamentos.length > 0) {
      const nomes = metodologia.delineamentos.map((id) => buscarItemKB(id)?.nome ?? id).join(', ');
      const trecho = `sendo desenvolvida como ${nomes.toLowerCase()}`;
      partes.push(trecho);
      origens[trecho] = 'Resposta confirmada na etapa "Delineamento"';
    } else {
      partes.push('[INFORMAÇÃO AUSENTE — delineamento ainda não definido]');
    }

    let textoColeta: string;
    if (metodologia.tecnicasColeta.length > 0) {
      const nomes = metodologia.tecnicasColeta.map((id) => buscarItemKB(id)?.nome ?? id).join(', ');
      textoColeta = `Para produção dos dados, serão utilizados: ${nomes.toLowerCase()}.`;
      origens[textoColeta] = 'Resposta confirmada na etapa "Coleta de dados"';
    } else {
      textoColeta = '[INFORMAÇÃO AUSENTE — técnica(s) de coleta ainda não definida(s)]';
    }

    let textoAnalise: string;
    if (metodologia.tecnicasAnalise.length > 0) {
      const nomes = metodologia.tecnicasAnalise.map((id) => buscarItemKB(id)?.nome ?? id).join(', ');
      textoAnalise = `Os dados produzidos serão analisados por meio de: ${nomes.toLowerCase()}.`;
      origens[textoAnalise] = 'Resposta confirmada na etapa "Análise de dados"';
    } else {
      textoAnalise = '[INFORMAÇÃO AUSENTE — método(s) de análise ainda não definido(s)]';
    }

    let textoObjetivos = '';
    if (objetivos.length > 0) {
      textoObjetivos = `Tais procedimentos relacionam-se aos objetivos específicos definidos, em especial: ${objetivos
        .slice(0, 3)
        .map((o) => o.descricao)
        .filter(Boolean)
        .join('; ')}.`;
      origens[textoObjetivos] = 'Objetivos específicos confirmados no Bloco 1';
    }

    const texto = [partes.join(', ') + '.', textoColeta, textoAnalise, textoObjetivos]
      .filter(Boolean)
      .join(' ');

    return { texto, origens };
  }
}

export const aiService: AIService = new MockAIService();
