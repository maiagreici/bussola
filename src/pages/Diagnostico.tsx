import { useMemo } from 'react';
import { useStore } from '../state/store';
import { PageHeader } from '../components/PageHeader';
import { PriorityList } from '../components/PriorityList';
import { diagnosticarProjeto } from '../rules/diagnostico';
import { gerarTextoDiagnostico, baixarComoArquivo } from '../utils/exportar';

export function Diagnostico() {
  const { projeto } = useStore();
  const resultado = useMemo(() => (projeto ? diagnosticarProjeto(projeto) : null), [projeto]);

  if (!projeto || !resultado) return null;
  const { dimensoes, prioridades } = resultado;

  function exportarTxt() {
    const texto = gerarTextoDiagnostico(projeto!, dimensoes, prioridades);
    baixarComoArquivo(`diagnostico-${projeto!.tituloProvisorio.slice(0, 30).replace(/\s+/g, '-')}.txt`, texto);
  }

  return (
    <div>
      <PageHeader
        eyebrow="Diagnóstico Final"
        titulo="Maturidade da sua pesquisa"
        oQueVerificamos="Um retrato transparente de onde sua pesquisa está mais sólida e onde ainda precisa de atenção, por critérios explícitos — nunca uma nota arbitrária."
        porQueImporta="Isso é exatamente o que um bom orientador olharia antes de mergulhar nos detalhes: a arquitetura está de pé?"
      />

      <section className="card">
        <h2 style={{ marginTop: 0, fontSize: '1.1rem' }}>Por dimensão</h2>
        <div className="stack">
          {dimensoes.map((d) => (
            <div key={d.chave} className="row" style={{ alignItems: 'flex-start' }}>
              <span className={`dot ${d.estado}`} aria-hidden="true" style={{ marginTop: 6 }} />
              <div>
                <strong>{d.nome}</strong>
                <p className="help-text" style={{ margin: '2px 0 0' }}>{d.criterio}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="card">
        <PriorityList
          prioritarias={prioridades.slice(0, 3).map((p) => ({ titulo: p.titulo, explicacao: p.explicacao }))}
          outras={prioridades.slice(3).map((p) => ({ titulo: p.titulo, explicacao: p.explicacao }))}
        />
      </section>

      <div className="row no-print">
        <button type="button" className="btn secondary" onClick={exportarTxt}>Exportar diagnóstico (.txt)</button>
        <button type="button" className="btn secondary" onClick={() => window.print()}>Imprimir / salvar como PDF</button>
      </div>
    </div>
  );
}
