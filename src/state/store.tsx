import React, { createContext, useCallback, useContext, useEffect, useMemo, useReducer } from 'react';
import type { ResearchProject } from '../types/project';

const STORAGE_KEY = 'bussola.researchProject.v1';

type Action =
  | { type: 'CARREGAR'; payload: ResearchProject }
  | { type: 'ATUALIZAR'; payload: (p: ResearchProject) => ResearchProject }
  | { type: 'RESETAR' };

function reducer(state: ResearchProject | null, action: Action): ResearchProject | null {
  switch (action.type) {
    case 'CARREGAR':
      return action.payload;
    case 'ATUALIZAR':
      if (!state) return state;
      return { ...action.payload(state), atualizadoEm: new Date().toISOString() };
    case 'RESETAR':
      return null;
    default:
      return state;
  }
}

interface StoreContextValue {
  projeto: ResearchProject | null;
  definirProjeto: (p: ResearchProject) => void;
  atualizar: (fn: (p: ResearchProject) => ResearchProject) => void;
  resetar: () => void;
}

const StoreContext = createContext<StoreContextValue | null>(null);

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [projeto, dispatch] = useReducer(reducer, null, () => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? (JSON.parse(raw) as ResearchProject) : null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    try {
      if (projeto) localStorage.setItem(STORAGE_KEY, JSON.stringify(projeto));
      else localStorage.removeItem(STORAGE_KEY);
    } catch {
      // Armazenamento indisponível (ex: modo privado). Falha silenciosa e local,
      // não deve interromper a experiência do usuário.
    }
  }, [projeto]);

  const definirProjeto = useCallback((p: ResearchProject) => dispatch({ type: 'CARREGAR', payload: p }), []);
  const atualizar = useCallback((fn: (p: ResearchProject) => ResearchProject) => dispatch({ type: 'ATUALIZAR', payload: fn }), []);
  const resetar = useCallback(() => dispatch({ type: 'RESETAR' }), []);

  const value = useMemo(
    () => ({ projeto, definirProjeto, atualizar, resetar }),
    [projeto, definirProjeto, atualizar, resetar],
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore(): StoreContextValue {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore precisa estar dentro de StoreProvider');
  return ctx;
}
