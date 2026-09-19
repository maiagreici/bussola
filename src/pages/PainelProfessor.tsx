import { useState } from 'react';
import { diagnosticarProjeto } from '../rules/diagnostico';
import { progressoGeral } from '../rules/moduleState';
import type { ResearchProject } from '../types/project';

// Painel do professor: não faz parte do fluxo do aluno. É uma tela separada,
// protegida por senha (ver api/login.php), que lista todos os projetos
// salvos no servidor e reaproveita a mesma lógica de diagnóstico usada na
// tela do próprio aluno — para nunca haver dois critérios diferentes de
// "o que está maduro" dependendo de quem está olhando.

export function PainelProfessor() {
  const [senha, setSenha] = useState('');
  const [autenticado, setAutenticado] = useState(false);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState('');
  const [projetos, setProjetos] = useState<ResearchProject[]>([]);
  const [expandidoId, setExpandidoId] = useState<string | null>(null);

  async function entrar(e: React.FormEvent) {
    e.preventDefault();
    setErro('');
    setCarregando(true);
    try {
      const resp = await fetch('api/login.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ senha }),
      });
      if (!resp.ok) {
        setErro('Senha incorreta.');
        setCarregando(false);
        return;
      }
      setAutenticado(true);
      await carregarLista();
    } catch {
      setErro('Não foi possível conectar ao servidor. Verifique se o backend (pasta api/) foi configurado.');
    }
    setCarregando(false);
  }

  async function carregarLista() {
    setCarregando(true);
    try {
      const resp = await fetch('api/list.php');
      const dados = await resp.json();
      if (resp.ok && dados.ok) {
        setProjetos(dados.projetos.filter(Boolean));
      } else {
        setErro('Sessão expirada — entre novamente.');
        setAutenticado(false);
      }
    } catch {
      setErro('Não foi possível carregar a lista.');
    }
    setCarregando(false);
  }

  async function sair() {
    try {
      await fetch('api/logout.php', { method: 'POST' });
    } catch {
      // segue mesmo assim
    }
    setAutenticado(false);
    setProjetos([]);
    setSenha('');
  }

  if (!autenticado) {
    return (
      <div className="page-wrap" style={{ maxWidth: 420, margin: '60px auto' }}>
        <form className="card" onSubmit={entrar}>
          <p className="eyebrow">Painel do professor</p>
          <h1 style={{ marginTop: 4, fontSize: '1.3rem' }}>Acompanhamento das pesquisas</h1>
          <div className="field">
            <label htmlFor="senha-professor">Senha</label>
            <input
              id="senha-professor"
              type="password"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              autoFocus
            />
          </div>
          {erro && <p role="alert" style={{ color: 'var(--danger)' }}>{erro}</p>}
          <button type="submit" className="btn" disabled={carregando || !senha}>
            {carregando ? 'Entrando…' : 'Entrar'}
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="page-wrap">
      <div className="card">
        <div className="row-between">
          <div>
            <p className="eyebrow" style={{ margin: 0 }}>Painel do professor</p>
            <h1 style={{ margin: '4px 0 0', fontSize: '1.3rem' }}>{projetos.length} pesquisa(s) em andamento</h1>
          </div>
          <div className="row">
            <button type="button" className="btn secondary" onClick={carregarLista} disabled={carregando}>
              {carregando ? 'Atualizando…' : 'Atualizar'}
            </button>
            <button type="button" className="btn ghost" onClick={sair}>Sair</button>
          </div>
        </div>
      </div>

      {erro && <p role="alert" style={{ color: 'var(--danger)' }}>{erro}</p>}

      <div className="stack">
        {projetos.map((p) => {
          const { dimensoes, prioridades } = diagnosticarProjeto(p);
          const progresso = Math.round(progressoGeral(p));
          const aberto = expandidoId === p.id;
          return (
            <div className="card" key={p.id}>
              <button
                type="button"
                className="btn ghost"
                style={{ width: '100%', padding: 0, textAlign: 'left', justifyContent: 'space-between', display: 'flex' }}
                onClick={() => setExpandidoId(aberto ? null : p.id)}
                aria-expanded={aberto}
              >
                <span>
                  <strong>{p.perfil.nome}</strong> — {p.tituloProvisorio}
                  <span className="help-text" style={{ display: 'block' }}>
                    {p.perfil.curso} · {progresso}% concluído · atualizado em {new Date(p.atualizadoEm).toLocaleString('pt-BR')}
                  </span>
                </span>
                <span aria-hidden="true">{aberto ? '▲' : '▼'}</span>
              </button>

              {aberto && (
                <div className="stack" style={{ marginTop: 16 }}>
                  {dimensoes.map((d) => (
                    <div key={d.chave} className="row" style={{ alignItems: 'flex-start' }}>
                      <span className={`dot ${d.estado}`} aria-hidden="true" style={{ marginTop: 6 }} />
                      <div>
                        <strong>{d.nome}</strong>
                        <p className="help-text" style={{ margin: '2px 0 0' }}>{d.criterio}</p>
                      </div>
                    </div>
                  ))}
                  {prioridades.length > 0 && (
                    <div className="alert warning">
                      <strong>Prioridade principal:</strong> {prioridades[0].titulo}
                      <p style={{ margin: '4px 0 0' }}>{prioridades[0].explicacao}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
        {projetos.length === 0 && !carregando && (
          <p className="help-text">Nenhum aluno usou o link ainda.</p>
        )}
      </div>
    </div>
  );
}
