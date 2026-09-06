import { useMemo } from 'react';
import { useStore } from '../state/store';
import { useRouter } from '../state/router';
import { PageHeader } from '../components/PageHeader';
import { PriorityList } from '../components/PriorityList';
import { diagnosticarProjeto } from '../rules/diagnostico';
import { gerarPdfDiagnostico, nomeArquivoPdf } from '../utils/pdf';
import { fraseConviteCadastrarContato, fraseTresCoisasAntesDeEnviar, frasePorQueImportaDiagnostico, rotuloSecaoContato } from '../utils/linguagemPerfil';

export function Diagnostico() {
  const { projeto } = useStore();
  const { navegar } = useRouter();
  const resultado = useMemo(() => (projeto ? diagnosticarProjeto(projeto) : null), [projeto]);

  if (!projeto || !resultado) return null;
  const { dimensoes, prioridades } = resultado;
  const orientadorEmail = projeto.metodologia.orientadorEmail.trim();

  function baixarPdf() {
    const doc = gerarPdfDiagnostico(projeto!, dimensoes, prioridades);
    doc.save(nomeArquivoPdf(projeto!));
  }

  function enviarPorEmail() {
    const linhas = [
      `Diagnóstico de Maturidade da Pesquisa — ${projeto!.tituloProvisorio}`,
      `Estudante: ${projeto!.perfil.nome}`,
      '',
      'Três prioridades antes da entrega:',
      ...prioridades.slice(0, 3).map((p, i) => `${i + 1}. ${p.titulo} — ${p.explicacao}`),
      '',
      '(Baixe o PDF pelo botão ao lado e anexe a este e-mail — o link "mailto" não anexa arquivos automaticamente.)',
    ];
    const assunto = encodeURIComponent(`Diagnóstico da pesquisa — ${projeto!.tituloProvisorio}`);
    const corpo = encodeURIComponent(linhas.join('\n'));
    window.location.href = `mailto:${orientadorEmail}?subject=${assunto}&body=${corpo}`;
  }

  return (
    <div>
      <PageHeader
        eyebrow="Diagnóstico Final"
        titulo="Maturidade da sua pesquisa"
        oQueVerificamos="Um retrato transparente de onde sua pesquisa está mais sólida e onde ainda precisa de atenção, por critérios explícitos — nunca uma nota arbitrária."
        porQueImporta={frasePorQueImportaDiagnostico(projeto.perfil.nivel)}
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
          titulo={fraseTresCoisasAntesDeEnviar(projeto.perfil.nivel)}
          prioritarias={prioridades.slice(0, 3).map((p) => ({ titulo: p.titulo, explicacao: p.explicacao }))}
          outras={prioridades.slice(3).map((p) => ({ titulo: p.titulo, explicacao: p.explicacao }))}
        />
      </section>

      <section className="card no-print">
        <h2 style={{ marginTop: 0, fontSize: '1.1rem' }}>Exportar e compartilhar</h2>
        <div className="row">
          <button type="button" className="btn" onClick={baixarPdf}>Baixar PDF</button>
          <button type="button" className="btn secondary" onClick={() => window.print()}>Imprimir</button>
        </div>
        <div style={{ marginTop: 16 }}>
          {orientadorEmail ? (
            <>
              <button type="button" className="btn secondary" onClick={enviarPorEmail}>
                Enviar cópia por e-mail para {projeto.metodologia.orientadorNome || orientadorEmail}
              </button>
              <p className="help-text" style={{ marginTop: 8 }}>
                Isso abre o seu programa de e-mail com a mensagem pronta. Anexe o PDF baixado antes de enviar
                — o link de e-mail não consegue anexar arquivos sozinho.
              </p>
            </>
          ) : (
            <p className="help-text">
              {fraseConviteCadastrarContato(projeto.perfil.nivel)}{' '}
              <button type="button" className="btn ghost" style={{ padding: 0 }} onClick={() => navegar({ pagina: 'metodologia' })}>
                "{rotuloSecaoContato(projeto.perfil.nivel)}"
              </button>{' '}
              no Bloco 4.
            </p>
          )}
        </div>
      </section>
    </div>
  );
}
