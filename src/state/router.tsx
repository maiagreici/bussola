import React, { createContext, useContext, useEffect, useState } from 'react';

// Router mínimo baseado em hash. Evita dependência externa para um MVP e
// permite retomar o módulo certo ao recarregar a página (F5).

export type Rota =
  | { pagina: 'onboarding' }
  | { pagina: 'dashboard' }
  | { pagina: 'marco_zero' }
  | { pagina: 'arquitetura_pesquisa' }
  | { pagina: 'arquitetura_texto' }
  | { pagina: 'referencial' }
  | { pagina: 'metodologia' }
  | { pagina: 'diagnostico' }
  | { pagina: 'privacidade' }
  | { pagina: 'painel_professor' };

function rotaParaHash(rota: Rota): string {
  return '#/' + rota.pagina;
}

function hashParaRota(hash: string): Rota {
  const limpo = hash.replace(/^#\/?/, '');
  const paginas: Rota['pagina'][] = [
    'onboarding',
    'dashboard',
    'marco_zero',
    'arquitetura_pesquisa',
    'arquitetura_texto',
    'referencial',
    'metodologia',
    'diagnostico',
    'privacidade',
    'painel_professor',
  ];
  const encontrada = paginas.find((p) => p === limpo);
  return { pagina: encontrada ?? 'dashboard' };
}

interface RouterContextValue {
  rota: Rota;
  navegar: (rota: Rota) => void;
}

const RouterContext = createContext<RouterContextValue | null>(null);

export function RouterProvider({ children }: { children: React.ReactNode }) {
  const [rota, setRota] = useState<Rota>(() => hashParaRota(window.location.hash));

  useEffect(() => {
    const onHashChange = () => setRota(hashParaRota(window.location.hash));
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  const navegar = (novaRota: Rota) => {
    window.location.hash = rotaParaHash(novaRota);
    setRota(novaRota);
    window.scrollTo(0, 0);
  };

  return <RouterContext.Provider value={{ rota, navegar }}>{children}</RouterContext.Provider>;
}

export function useRouter(): RouterContextValue {
  const ctx = useContext(RouterContext);
  if (!ctx) throw new Error('useRouter precisa estar dentro de RouterProvider');
  return ctx;
}
