import { useStore } from '../state/store';
import { useRouter, type Rota } from '../state/router';
import { ProgressBar } from '../components/ProgressBar';
import { ModuleCard } from '../components/ModuleCard';
import { estadoModulo, progressoGeral } from '../rules/moduleState';
import type { ModuloId } from '../types/project';

const MODULOS_DASHBOARD: { id: ModuloId; rota: Rota['pagina']; titulo: string; descricao: string }[] = [
  { id: 'marco_zero', rota: 'marco_zero', titulo: '0. Marco Zero', descricao: 'Posso entregar isso? Três requisitos mínimos antes de seguir.' },
  { id: 'arquitetura_pesquisa', rota: 'arquitetura_pesquisa', titulo: '1. Arquitetura da Pesquisa', descricao: 'Do incômodo à pergunta, hipótese e objetivos.' },
  { id: 'arquitetura_texto', rota: 'arquitetura_texto', titulo: '2. Arquitetura do Texto', descricao: 'A estrutura do documento representa sua pesquisa?' },
  { id: 'referencial', rota: 'referencial', titulo: '3. Referencial Teórico', descricao: 'Quantidade, pertinência e rastreabilidade das referências.' },
  { id: 'metodologia', rota: 'metodologia', titulo: '4. Metodologia', descricao: 'Natureza, abordagem, delineamento, coleta e análise.' },
  { id: 'sintese_redacao', rota: 'metodologia', titulo: '5. Síntese e Redação Assistida', descricao: 'Transformar decisões confirmadas em texto técnico.' },
  { id: 'diagnostico_final', rota: 'diagnostico', titulo: '6. Diagnóstico Final', descricao: 'Maturidade da pesquisa e as três prioridades antes de enviar.' },
];

export function Dashboard() {
  const { projeto } = useStore();
  const { navegar } = useRouter();

  if (!projeto) {
    navegar({ pagina: 'onboarding' });
    return null;
  }

  const progresso = progressoGeral(projeto);
  const tarefasAbertas = projeto.tarefasPendentes.filter((t) => !t.concluida);
  const marcoZeroOk = estadoModulo('marco_zero', projeto) === 'concluido';

  function continuarDeOndeParei() {
    const proximo = MODULOS_DASHBOARD.find((m) => estadoModulo(m.id, projeto!) !== 'concluido') ?? MODULOS_DASHBOARD[0];
    navegar({ pagina: proximo.rota } as Rota);
  }

  return (
    <div className="stack">
      <div className="card">
        <p className="eyebrow">Minha pesquisa</p>
        <h1 style={{ margin: '4px 0 12px' }}>{projeto.tituloProvisorio}</h1>
        <p className="help-text" style={{ margin: '0 0 16px' }}>
          {projeto.perfil.nome} · {projeto.perfil.curso} · {projeto.perfil.areaConhecimento}
        </p>
        <ProgressBar valor={progresso} rotulo="Progresso geral" />
        <div style={{ marginTop: 16 }}>
          <button type="button" className="btn" onClick={continuarDeOndeParei}>Continuar de onde parei</button>
        </div>
      </div>

      {tarefasAbertas.length > 0 && (
        <div className="card">
          <h2 style={{ marginTop: 0, fontSize: '1.05rem' }}>Tarefas pendentes</h2>
          <ul style={{ paddingLeft: 20 }}>
            {tarefasAbertas.map((t) => (
              <li key={t.id}>{t.descricao}</li>
            ))}
          </ul>
        </div>
      )}

      <div>
        <h2 style={{ fontSize: '1.1rem' }}>Módulos</h2>
        <div className="module-grid">
          {MODULOS_DASHBOARD.map((m) => {
            const bloqueado = m.id !== 'marco_zero' && !marcoZeroOk;
            return (
              <ModuleCard
                key={m.id}
                titulo={m.titulo}
                descricao={m.descricao}
                estado={estadoModulo(m.id, projeto)}
                bloqueado={bloqueado}
                motivoBloqueio={bloqueado ? 'Complete o Marco Zero primeiro' : undefined}
                onClick={() => navegar({ pagina: m.rota } as Rota)}
              />
            );
          })}
        </div>
      </div>

      <p className="help-text">
        Suas respostas são salvas automaticamente neste dispositivo. Você pode sair e continuar depois.
      </p>
    </div>
  );
}
