import { StoreProvider, useStore } from './state/store';
import { RouterProvider, useRouter } from './state/router';
import { Layout } from './components/Layout';
import { Onboarding } from './pages/Onboarding';
import { Dashboard } from './pages/Dashboard';
import { MarcoZero } from './pages/MarcoZero';
import { ArquiteturaPesquisa } from './pages/ArquiteturaPesquisa';
import { ArquiteturaTexto } from './pages/ArquiteturaTexto';
import { Referencial } from './pages/Referencial';
import { Metodologia } from './pages/Metodologia';
import { Diagnostico } from './pages/Diagnostico';
import { Privacidade } from './pages/Privacidade';

function Rotas() {
  const { projeto } = useStore();
  const { rota, navegar } = useRouter();

  if (!projeto && rota.pagina !== 'onboarding') {
    navegar({ pagina: 'onboarding' });
    return null;
  }
  if (projeto && rota.pagina === 'onboarding') {
    navegar({ pagina: 'dashboard' });
    return null;
  }

  switch (rota.pagina) {
    case 'onboarding':
      return <Onboarding />;
    case 'dashboard':
      return <Dashboard />;
    case 'marco_zero':
      return <MarcoZero />;
    case 'arquitetura_pesquisa':
      return <ArquiteturaPesquisa />;
    case 'arquitetura_texto':
      return <ArquiteturaTexto />;
    case 'referencial':
      return <Referencial />;
    case 'metodologia':
      return <Metodologia />;
    case 'diagnostico':
      return <Diagnostico />;
    case 'privacidade':
      return <Privacidade />;
    default:
      return <Dashboard />;
  }
}

function Conteudo() {
  const { rota } = useRouter();
  const { projeto } = useStore();

  if (rota.pagina === 'onboarding' || !projeto) {
    return <Rotas />;
  }
  return (
    <Layout>
      <Rotas />
    </Layout>
  );
}

export default function App() {
  return (
    <StoreProvider>
      <RouterProvider>
        <Conteudo />
      </RouterProvider>
    </StoreProvider>
  );
}
