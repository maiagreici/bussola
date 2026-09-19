import { useMemo } from 'react';
import { useStore } from '../state/store';
import { PageHeader } from '../components/PageHeader';
import { TextAreaField } from '../components/Field';
import { conferirBibliografia } from '../utils/bibliografia';

export function Referencial() {
  const { projeto, atualizar } = useStore();
  const ref = projeto?.referencial;

  const totalReferencias = useMemo(
    () => (ref ? ref.textoReferencias.split('\n').map((l) => l.trim()).filter(Boolean).length : 0),
    [ref],
  );

  const conferencia = useMemo(
    () => (projeto ? conferirBibliografia(projeto.referencial.textoParaConferencia, projeto.referencial.textoReferencias) : null),
    [projeto],
  );

  if (!projeto || !ref) return null;

  return (
    <div>
      <PageHeader
        eyebrow="Bloco 3"
        titulo="Referencial Teórico"
        oQueVerificamos="Quantidade, pertinência e rastreabilidade das referências que sustentam sua discussão."
        porQueImporta="Referências decorativas (citadas sem função clara) enfraquecem a fundamentação. O conjunto de referências precisa justificar sua presença."
      />

      <div className="card">
        <p>
          Você tem <strong>{totalReferencias}</strong> referência(s) coladas.
        </p>
        <p className="help-text">
          Dez referências costuma ser um ponto de partida inicial razoável, mas a quantidade necessária
          depende da natureza e do estágio da sua pesquisa — use como indicador, não como regra fixa.
        </p>
      </div>

      <div className="card">
        <TextAreaField
          label="Cole aqui sua lista de referências (uma por linha)"
          help="Cole a lista que você já tem pronta (do Word, Mendeley, Zotero etc.), uma referência por linha. Não precisa reformatar nada — o sistema reconhece automaticamente autor e ano quando possível, para usar na conferência abaixo."
          value={ref.textoReferencias}
          onChange={(v) => atualizar((p) => ({ ...p, referencial: { ...p.referencial, textoReferencias: v } }))}
          rows={10}
          placeholder={'SILVA, J. Título do texto. Editora, 2020.\nCOSTA, M. (2019). Outro título aqui.'}
        />
        <TextAreaField
          label="Por que essas referências sustentam sua pesquisa?"
          help="Este não é um gerador de trabalho acadêmico — a ferramenta não escreve isso por você. É uma reflexão rápida e única sobre o conjunto: o que essas referências, juntas, dão de sustentação para a sua pergunta e seus objetivos."
          value={ref.reflexaoGeral}
          onChange={(v) => atualizar((p) => ({ ...p, referencial: { ...p.referencial, reflexaoGeral: v } }))}
          rows={4}
        />
      </div>

      <section className="card" style={{ marginTop: 20 }}>
        <h2 style={{ marginTop: 0, fontSize: '1.1rem' }}>Conferência bibliográfica bidirecional</h2>
        <p className="help-text">
          Cole abaixo um trecho do seu texto (ou a lista de citações que você usou, ex.: "Silva (2020)... Costa, 2019...").
          Vamos comparar com sua lista de referências nas duas direções. Esta é uma checagem simplificada —
          sempre confirme manualmente antes de entregar.
        </p>
        <TextAreaField
          label="Texto para conferência"
          value={projeto.referencial.textoParaConferencia}
          onChange={(v) => atualizar((p) => ({ ...p, referencial: { ...p.referencial, textoParaConferencia: v } }))}
          rows={6}
        />
        {conferencia && (
          <div className="stack">
            <ResultadoBloco titulo="Citações no texto sem referência correspondente" itens={conferencia.citacoesSemReferencia} />
            <ResultadoBloco titulo="Referências que não parecem citadas no texto colado" itens={conferencia.referenciasNaoCitadas} />
            <ResultadoBloco titulo="Possíveis duplicidades" itens={conferencia.possiveisDuplicidades} />
            <ResultadoBloco titulo="Linhas sem autor/ano reconhecido" itens={conferencia.dadosIncompletos} />
          </div>
        )}
      </section>
    </div>
  );
}

function ResultadoBloco({ titulo, itens }: { titulo: string; itens: string[] }) {
  if (itens.length === 0) {
    return (
      <div className="alert success">
        <strong>{titulo}:</strong> nenhum ponto encontrado.
      </div>
    );
  }
  return (
    <div className="alert warning">
      <strong>{titulo}:</strong>
      <ul style={{ margin: '6px 0 0' }}>
        {itens.map((i, idx) => <li key={idx}>{i}</li>)}
      </ul>
    </div>
  );
}
