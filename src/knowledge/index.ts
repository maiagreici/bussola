import { naturezaKB } from './natureza';
import { abordagemKB } from './abordagem';
import { delineamentoKB } from './delineamento';
import { coletaKB } from './coleta';
import { analiseKB } from './analise';
import type { ItemKB } from './types';

export * from './types';
export { naturezaKB, abordagemKB, delineamentoKB, coletaKB, analiseKB };

export const kbCompleta: ItemKB[] = [
  ...naturezaKB,
  ...abordagemKB,
  ...delineamentoKB,
  ...coletaKB,
  ...analiseKB,
];

export function buscarItemKB(id: string): ItemKB | undefined {
  return kbCompleta.find((i) => i.id === id);
}

// Exigências éticas mais comuns (spec item 8). O sistema nunca afirma que
// uma pesquisa específica exige ou não aprovação ética — apenas apresenta
// possibilidades para o estudante verificar junto às normas institucionais.
export const exigenciasEticasComuns: string[] = [
  'Aprovação de Comitê de Ética em Pesquisa (CEP/CONEP)',
  'Termo de Consentimento Livre e Esclarecido (TCLE)',
  'Termo de Assentimento (para crianças/adolescentes)',
  'Autorização institucional para realizar a pesquisa',
  'Autorização para uso de imagem e/ou voz',
  'Cuidados específicos com uso de dados pessoais (LGPD)',
  'Cuidados adicionais com populações vulneráveis',
  'Outros requisitos normativos específicos da área',
];
