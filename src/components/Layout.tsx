import type { ReactNode } from 'react';
import { useRouter } from '../state/router';
import type { Rota } from '../state/router';

const ITENS: { rota: Rota['pagina']; rotulo: string; icone: string }[] = [
  { rota: 'dashboard', rotulo: 'Painel', icone: '🧭' },
  { rota: 'marco_zero', rotulo: 'Marco Zero', icone: '0️⃣' },
  { rota: 'arquitetura_pesquisa', rotulo: 'Arquitetura da Pesquisa', icone: '1️⃣' },
  { rota: 'arquitetura_texto', rotulo: 'Arquitetura do Texto', icone: '2️⃣' },
  { rota: 'referencial', rotulo: 'Referencial Teórico', icone: '3️⃣' },
  { rota: 'metodologia', rotulo: 'Metodologia', icone: '4️⃣' },
  { rota: 'diagnostico', rotulo: 'Diagnóstico Final', icone: '📋' },
  { rota: 'privacidade', rotulo: 'Privacidade', icone: '🔒' },
];

export function Layout({ children }: { children: ReactNode }) {
  const { rota, navegar } = useRouter();

  return (
    <div className="app-shell">
      <a href="#conteudo-principal" className="skip-link">Pular para o conteúdo principal</a>
      <nav className="sidebar" aria-label="Navegação principal">
        <div className="brand">🧭 Bússola</div>
        <ul className="nav-list">
          {ITENS.map((item) => (
            <li key={item.rota}>
              <button
                type="button"
                className="nav-item"
                aria-current={rota.pagina === item.rota ? 'page' : undefined}
                onClick={() => navegar({ pagina: item.rota } as Rota)}
              >
                <span aria-hidden="true">{item.icone}</span> {item.rotulo}
              </button>
            </li>
          ))}
        </ul>
      </nav>

      <main id="conteudo-principal" className="main-content" tabIndex={-1}>
        <div className="page-wrap">{children}</div>
      </main>

      <nav className="mobile-nav" aria-label="Navegação principal (móvel)">
        {ITENS.filter((i) => i.rota !== 'privacidade').map((item) => (
          <button
            key={item.rota}
            type="button"
            aria-current={rota.pagina === item.rota ? 'page' : undefined}
            onClick={() => navegar({ pagina: item.rota } as Rota)}
          >
            <span aria-hidden="true">{item.icone}</span>
            {item.rotulo}
          </button>
        ))}
      </nav>
    </div>
  );
}
