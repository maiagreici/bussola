import { useMemo, useState } from 'react';
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
  const [copiado, setCopiado] = useState(false);
  const resultado = useMemo(() => (projeto ? diagnosticarProjeto(projeto) : null), [projeto]);

  if (!projeto || !resultado) return null;
  const { dimensoes, prioridades } = resultado;
  const orientadorEmail = projeto.metodologia.orientadorEmail.trim();

  function baixarPdf() {
    const doc = gerarPdfDiagnostico(projeto!, dimensoes, prioridades);
    doc.save(nomeArquivoPdf(projeto!));
  }

  function montarMensagem() {
    const linhas = [
      `Assunto: Diagnóstico da pesquisa — ${projeto!.tituloProvisorio}`,
      '',
      `Diagnóstico de Maturidade da Pesquisa — ${projeto!.tituloProvisorio}`,
      `Estudante: ${projeto!.perfil.nome}`,
      '',
      'Três prioridades antes da entrega:',
      ...prioridades.slice(0, 3).map((p, i) => `${i + 1}. ${p.titulo} — ${p.explicacao}`),
      '',
      '(O PDF completo foi baixado separadamente — anexe-o a este e-mail antes de enviar.)',
    ];
    return linhas.join('\n');
  }

  function copiarMensagem() {
    navigator.clipboard?.writeText(montarMensagem()).then(() => {
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2500);
    });
  }

  function enviarPorEmail() {
    // Só funciona se o computador tiver um programa de e-mail padrão
    // configurado (Outlook, Mail, Thunderbird...). Quem usa apenas webmail
    // pelo navegador deve preferir "Copiar mensagem" acima.
    const assunto = encodeURIComponent(`Diagnóstico da pesquisa — ${projeto!.tituloProvisorio}`);
    const corpo = encodeURIComponent(montarMensagem());
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
              <p className="help-text" style={{ marginTop: 0, marginBottom: 8 }}>
                Destinatário: {projeto.metodologia.orientadorNome || orientadorEmail} ({orientadorEmail})
              </p>
              <div className="row">
                <button type="button" className="btn" onClick={copiarMensagem}>
                  {copiado ? 'Copiado!' : 'Copiar mensagem'}
                </button>
                <button type="button" className="btn secondary" onClick={enviarPorEmail}>
                  Tentar abrir no programa de e-mail
                </button>
              </div>
              <p className="help-text" style={{ marginTop: 8 }}>
                <strong>Copiar mensagem</strong> funciona sempre: cole o texto direto no Gmail, Outlook web ou
                qualquer serviço de e-mail e anexe o PDF baixado. Já <strong>"Tentar abrir no programa de
                e-mail"</strong> só funciona se o seu computador tiver um aplicativo de e-mail configurado como
                padrão (ex: Outlook, Mail, Thunderbird) — se você usa e-mail só pelo navegador, use a opção
                de copiar.
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
