import { ItemKB, REFERENCIA_A_VALIDAR } from './types';

export const naturezaKB: ItemKB[] = [
  {
    id: 'basica',
    nome: 'Pesquisa básica',
    categoria: 'natureza',
    definicao_curta: 'Busca ampliar o conhecimento científico sem finalidade prática imediata.',
    explicacao:
      'A pesquisa básica (ou pura) tem como motivação principal o avanço do conhecimento em si, gerando teorias, conceitos ou compreensões novas sobre um fenômeno, independentemente de uma aplicação prática direta e imediata.',
    quando_usar:
      'Quando o objetivo central é compreender, descrever ou explicar um fenômeno, testar uma teoria, ou preencher uma lacuna teórica no campo.',
    exemplo: 'Investigar como um determinado processo cognitivo ocorre, sem relação com um produto ou intervenção específica.',
    alertas: ['Não confundir "básica" com "simples" ou "menos rigorosa" — a exigência metodológica é a mesma.'],
    referencias: [REFERENCIA_A_VALIDAR],
  },
  {
    id: 'aplicada',
    nome: 'Pesquisa aplicada',
    categoria: 'natureza',
    definicao_curta: 'Gera conhecimento com finalidade prática, dirigida à solução de problemas específicos.',
    explicacao:
      'A pesquisa aplicada parte de um problema concreto e busca gerar conhecimento que possa ser utilizado para resolvê-lo ou orientar uma intervenção, produto, processo ou política.',
    quando_usar:
      'Quando a pesquisa nasce de um problema prático (organizacional, clínico, social, tecnológico) e pretende gerar recomendações, produtos ou intervenções.',
    exemplo: 'Desenvolver e testar um protocolo de atendimento para reduzir o tempo de espera em um serviço.',
    alertas: ['Ter uma aplicação em vista não dispensa fundamentação teórica nem rigor metodológico.'],
    referencias: [REFERENCIA_A_VALIDAR],
  },
];
