import { ItemKB, REFERENCIA_A_VALIDAR } from './types';

export const abordagemKB: ItemKB[] = [
  {
    id: 'qualitativa',
    nome: 'Abordagem qualitativa',
    categoria: 'abordagem',
    definicao_curta: 'Foco em significados, experiências, processos e interpretações.',
    explicacao:
      'Prioriza a compreensão aprofundada de fenômenos a partir de significados atribuídos pelos sujeitos, contextos e relações, geralmente com dados não numéricos (falas, textos, imagens, observações).',
    quando_usar:
      'Quando a pergunta busca compreender "como" ou "por quê" algo acontece, explorar experiências subjetivas ou processos complexos pouco explorados.',
    exemplo: 'Compreender como professores experienciam a transição para o ensino remoto.',
    alertas: ['Qualitativo não significa "menos rigoroso" — exige critérios próprios de rigor (ex.: saturação, triangulação).'],
    referencias: [REFERENCIA_A_VALIDAR],
  },
  {
    id: 'quantitativa',
    nome: 'Abordagem quantitativa',
    categoria: 'abordagem',
    definicao_curta: 'Foco em mensuração, variáveis, frequências e relações estatísticas.',
    explicacao:
      'Busca quantificar variáveis e testar relações entre elas por meio de instrumentos padronizados e análise estatística, geralmente com amostras maiores.',
    quando_usar:
      'Quando a pergunta busca medir a magnitude, frequência ou correlação/causalidade entre variáveis, ou generalizar resultados para uma população.',
    exemplo: 'Verificar se existe correlação entre horas de sono e desempenho acadêmico em uma amostra de estudantes.',
    alertas: ['Definir as variáveis com precisão antes de escolher o instrumento de coleta.'],
    referencias: [REFERENCIA_A_VALIDAR],
  },
  {
    id: 'mista',
    nome: 'Abordagem mista',
    categoria: 'abordagem',
    definicao_curta: 'Integra deliberadamente componentes qualitativos e quantitativos.',
    explicacao:
      'Combina, de forma planejada e justificada, dados e análises qualitativas e quantitativas, buscando complementaridade (ex.: explicar um resultado numérico com dados de entrevistas).',
    quando_usar:
      'Quando nem a mensuração isolada nem a interpretação isolada respondem completamente à pergunta de pesquisa.',
    exemplo: 'Aplicar um questionário fechado para mapear frequências e, em seguida, entrevistas para aprofundar os casos mais relevantes.',
    alertas: ['Misturar métodos não é o mesmo que integrá-los: é preciso explicitar como e por que os dois tipos de dado dialogam.'],
    referencias: [REFERENCIA_A_VALIDAR],
  },
];
