import { useMemo, useState } from 'react';
import { useStore } from '../state/store';
import { PageHeader } from '../components/PageHeader';
import { KBCard } from '../components/KBCard';
import { TextAreaField } from '../components/Field';
import { CoherenceAlerts } from '../components/CoherenceAlert';
import { naturezaKB, abordagemKB, delineamentoKB, coletaKB, analiseKB } from '../knowledge';
import { verificarMatrizMetodologica } from '../rules/coherence';
import { aiService } from '../services/aiService';
import type { NaturezaPesquisa, AbordagemPesquisa } from '../types/project';

export function Metodologia() {
  const { projeto, atualizar } = useStore();
  const [gerando, setGerando] = useState(false);
  const [textoEditavel, setTextoEditavel] = useState<string | null>(null);
  const [mostrarOrigens, setMostrarOrigens] = useState(false);
  const [copiado, setCopiado] = useState(false);

  const alertasMatriz = useMemo(() => (projeto ? verificarMatrizMetodologica(projeto) : []), [projeto]);

  if (!projeto) return null;
  const m = projeto.metodologia;
  const objetivos = projeto.arquiteturaPesquisa.objetivosEspecificos;

  function atualizarMetodologia(patch: Partial<typeof m>) {
    atualizar((p) => ({ ...p, metodologia: { ...p.metodologia, ...patch } }));
  }

  function toggleMultiplo(campo: 'delineamentos' | 'tecnicasColeta' | 'tecnicasAnalise', id: string) {
    const atuais = m[campo];
    const novos = atuais.includes(id) ? atuais.filter((x) => x !== id) : [...atuais, id];
    atualizarMetodologia({ [campo]: novos } as Partial<typeof m>);
  }

  function toggleRelacao(tecnicaId: string, objetivoId: string) {
    const atuais = m.relacaoColetaObjetivos[tecnicaId] ?? [];
    const novos = atuais.includes(objetivoId) ? atuais.filter((x) => x !== objetivoId) : [...atuais, objetivoId];
    atualizarMetodologia({ relacaoColetaObjetivos: { ...m.relacaoColetaObjetivos, [tecnicaId]: novos } });
  }

  const podeGerarTexto = !!m.natureza && !!m.abordagem && m.delineamentos.length > 0 && m.tecnicasColeta.length > 0 && m.tecnicasAnalise.length > 0;

  async function gerarTexto() {
    setGerando(true);
    const r = await aiService.gerarTextoMetodologico(m, objetivos);
    atualizar((p) => ({
      ...p,
      metodologia: { ...p.metodologia, textoGerado: r.texto, textoGeradoOrigens: r.origens },
      decisoesConfirmadas: { ...p.decisoesConfirmadas, metodologia: true },
    }));
    setTextoEditavel(r.texto);
    setGerando(false);
  }

  function copiarTexto() {
    const texto = textoEditavel ?? m.textoGerado;
    navigator.clipboard?.writeText(texto).then(() => {
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2000);
    });
  }

  function salvarEdicao(texto: string) {
    setTextoEditavel(texto);
    atualizar((p) => ({ ...p, metodologia: { ...p.metodologia, textoGerado: texto } }));
  }

  return (
    <div>
      <PageHeader
        eyebrow="Bloco 4"
        titulo="Metodologia"
        oQueVerificamos="Se natureza, abordagem, delineamento, coleta e análise formam um conjunto coerente entre si e com seus objetivos."
        porQueImporta="A metodologia é o elo entre a pergunta e os resultados. Escolhas incoerentes aqui comprometem a validade de tudo que vem depois."
      />

      {m.precisaRevisaoCoerencia && (
        <div className="alert danger" style={{ marginBottom: 16 }}>
          <strong>Esta seção foi marcada para revisão</strong>
          <p style={{ margin: '6px 0 0' }}>Algo essencial mudou no Bloco 1 (provavelmente a pergunta de pesquisa). Releia suas escolhas metodológicas.</p>
        </div>
      )}

      <section className="card">
        <h2 style={{ marginTop: 0, fontSize: '1.1rem' }}>1. Natureza da pesquisa</h2>
        <div className="module-grid">
          {naturezaKB.map((item) => (
            <KBCard key={item.id} item={item} multipla={false} selecionado={m.natureza === item.id} onToggle={() => atualizarMetodologia({ natureza: item.id as NaturezaPesquisa })} />
          ))}
        </div>
        {m.natureza && (
          <TextAreaField
            label="Por que essa descreve melhor sua pesquisa?"
            value={m.naturezaJustificativa}
            onChange={(v) => atualizarMetodologia({ naturezaJustificativa: v })}
            rows={2}
          />
        )}
      </section>

      <section className="card">
        <h2 style={{ marginTop: 0, fontSize: '1.1rem' }}>2. Abordagem</h2>
        <div className="module-grid">
          {abordagemKB.map((item) => (
            <KBCard key={item.id} item={item} multipla={false} selecionado={m.abordagem === item.id} onToggle={() => atualizarMetodologia({ abordagem: item.id as AbordagemPesquisa })} />
          ))}
        </div>
        {m.abordagem && (
          <TextAreaField
            label="Por que essa abordagem é coerente com sua pergunta e objetivos?"
            value={m.abordagemJustificativa}
            onChange={(v) => atualizarMetodologia({ abordagemJustificativa: v })}
            rows={2}
          />
        )}
      </section>

      <section className="card">
        <h2 style={{ marginTop: 0, fontSize: '1.1rem' }}>3. Tipo / delineamento</h2>
        <p className="help-text">Essas categorias pertencem a níveis diferentes e podem coexistir — selecione quantas fizerem sentido para sua pesquisa.</p>
        <div className="module-grid">
          {delineamentoKB.map((item) => (
            <KBCard key={item.id} item={item} selecionado={m.delineamentos.includes(item.id)} onToggle={() => toggleMultiplo('delineamentos', item.id)} />
          ))}
        </div>
      </section>

      <section className="card">
        <h2 style={{ marginTop: 0, fontSize: '1.1rem' }}>4. Coleta de dados</h2>
        <div className="module-grid">
          {coletaKB.map((item) => (
            <KBCard key={item.id} item={item} selecionado={m.tecnicasColeta.includes(item.id)} onToggle={() => toggleMultiplo('tecnicasColeta', item.id)} />
          ))}
        </div>
        {m.tecnicasColeta.length > 0 && objetivos.length > 0 && (
          <div style={{ marginTop: 16 }}>
            <h3 style={{ fontSize: '0.95rem' }}>Qual técnica produz dados para qual objetivo específico?</h3>
            <div className="table-scroll">
              <table className="editable-table">
                <thead>
                  <tr>
                    <th scope="col">Técnica</th>
                    {objetivos.map((o, i) => <th scope="col" key={o.id}>Objetivo {i + 1}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {m.tecnicasColeta.map((tid) => (
                    <tr key={tid}>
                      <td>{coletaKB.find((c) => c.id === tid)?.nome ?? tid}</td>
                      {objetivos.map((o) => (
                        <td key={o.id} style={{ textAlign: 'center' }}>
                          <input
                            type="checkbox"
                            aria-label={`Relacionar com objetivo ${o.descricao || o.id}`}
                            checked={(m.relacaoColetaObjetivos[tid] ?? []).includes(o.id)}
                            onChange={() => toggleRelacao(tid, o.id)}
                          />
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </section>

      <section className="card">
        <h2 style={{ marginTop: 0, fontSize: '1.1rem' }}>5. Análise de dados</h2>
        <div className="module-grid">
          {analiseKB.map((item) => (
            <KBCard key={item.id} item={item} selecionado={m.tecnicasAnalise.includes(item.id)} onToggle={() => toggleMultiplo('tecnicasAnalise', item.id)} />
          ))}
        </div>
      </section>

      <section className="card">
        <h2 style={{ marginTop: 0, fontSize: '1.1rem' }}>Matriz de coerência metodológica</h2>
        {objetivos.length === 0 ? (
          <p className="help-text">Cadastre objetivos específicos no Bloco 1 para visualizar a matriz.</p>
        ) : (
          <div className="table-scroll">
            <table className="editable-table">
              <thead>
                <tr>
                  <th scope="col">Objetivo</th>
                  <th scope="col">Dado necessário (proxy: "como vou fazer")</th>
                  <th scope="col">Coleta relacionada</th>
                  <th scope="col">Análise prevista</th>
                  <th scope="col">Resultado esperado</th>
                </tr>
              </thead>
              <tbody>
                {objetivos.map((o) => {
                  const tecnicasRelacionadas = m.tecnicasColeta.filter((tid) => (m.relacaoColetaObjetivos[tid] ?? []).includes(o.id));
                  return (
                    <tr key={o.id}>
                      <td>{o.descricao || '—'}</td>
                      <td>{o.comoVouFazer || '—'}</td>
                      <td>{tecnicasRelacionadas.length > 0 ? tecnicasRelacionadas.map((t) => coletaKB.find((c) => c.id === t)?.nome ?? t).join(', ') : 'Nenhuma relacionada ainda'}</td>
                      <td>{m.tecnicasAnalise.length > 0 ? m.tecnicasAnalise.map((t) => analiseKB.find((c) => c.id === t)?.nome ?? t).join(', ') : '—'}</td>
                      <td>{o.resultadoEsperado || '—'}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
        <div style={{ marginTop: 12 }}>
          <CoherenceAlerts alertas={alertasMatriz} tituloOk="Metodologia coerente com os dados disponíveis" />
        </div>
      </section>

      <section className="card">
        <h2 style={{ marginTop: 0, fontSize: '1.1rem' }}>Redação assistida</h2>
        {!podeGerarTexto ? (
          <p className="help-text">Complete natureza, abordagem, delineamento, coleta e análise para liberar a redação assistida.</p>
        ) : (
          <div>
            <p>As decisões são suas. Agora posso ajudar a transformar essas decisões em redação técnica.</p>
            <button type="button" className="btn" onClick={gerarTexto} disabled={gerando}>
              {gerando ? 'Gerando…' : m.textoGerado ? 'Regenerar rascunho' : 'Gerar rascunho metodológico'}
            </button>
            {m.textoGerado && (
              <div className="stack" style={{ marginTop: 14 }}>
                <TextAreaField
                  label="Rascunho (editável)"
                  value={textoEditavel ?? m.textoGerado}
                  onChange={salvarEdicao}
                  rows={6}
                />
                <div className="row">
                  <button type="button" className="btn secondary" onClick={copiarTexto}>{copiado ? 'Copiado!' : 'Copiar'}</button>
                  <button type="button" className="btn secondary" onClick={() => setMostrarOrigens((v) => !v)}>
                    {mostrarOrigens ? 'Ocultar origens' : 'Ver de quais respostas cada trecho foi produzido'}
                  </button>
                </div>
                {mostrarOrigens && (
                  <div className="alert" style={{ background: 'var(--primary-soft)', borderColor: 'var(--primary)' }}>
                    <ul style={{ margin: 0 }}>
                      {Object.entries(m.textoGeradoOrigens).map(([trecho, origem]) => (
                        <li key={trecho}><em>"{trecho}"</em> — {origem}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </section>
    </div>
  );
}
