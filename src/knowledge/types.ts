// Base de Conhecimento — estrutura separada da lógica de UI (spec item 38).
// Referências ainda não validadas usam o placeholder explícito abaixo;
// nunca preencher com bibliografia inventada.

export const REFERENCIA_A_VALIDAR = '[REFERÊNCIA METODOLÓGICA A SER VALIDADA]';

export type CategoriaKB =
  | 'natureza'
  | 'abordagem'
  | 'delineamento'
  | 'coleta'
  | 'analise'
  | 'etica'
  | 'escrita_cientifica'
  | 'erros_frequentes';

export interface ItemKB {
  id: string;
  nome: string;
  categoria: CategoriaKB;
  definicao_curta: string;
  explicacao: string;
  quando_usar: string;
  exemplo: string;
  alertas: string[];
  referencias: string[];
}
