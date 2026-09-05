import { useMemo } from 'react';
import { useStore } from '../state/store';
import { novoId } from '../state/factory';
import { PageHeader } from '../components/PageHeader';
import { TextField, TextAreaField, SelectField } from '../components/Field';
import { conferirBibliografia } from '../utils/bibliografia';
import type { Referencia, TipoReferencia } from '../types/project';

const TIPOS: { valor: TipoReferencia; rotulo: string }[] = [
  { valor: 'fundacional', rotulo: 'Referência fundacional / clássica' },
  { valor: 'contemporanea', rotulo: 'Literatura contemporânea' },
  { valor: 'metodologica', rotulo: 'Referência metodológica' },
  { valor: 'normativa', rotulo: 'Documento normativo' },
  { valor: 'outra', rotulo: 'Outra' },
];

const ANO_ATUAL = new Date().getFullYear();

export function Referencial() {
  const { projeto, atualizar } = useStore();
  const refs = projeto?.referencial.referencias ?? [];

  const conferencia = useMemo(
    () => (projeto ? conferirBibliografia(projeto.referencial.textoParaConferencia, refs) : null),
    [projeto, refs],
  );

  if (!projeto) return null;

  function adicionar() {
    const nova: Referencia = {
      id: novoId(),
      autor: '',
      ano: '',
      titulo: '',
      tipo: 'contemporanea',
      ideiaCentral: '',
      porQueUso: '',
      ehApud: false,
      fonteOriginalDisponivel: 'nao_se_aplica',
    };
    atualizar((p) => ({ ...p, referencial: { ...p.referencial, referencias: [...p.referencial.referencias, nova] } }));
  }

  function atualizarRef(id: string, patch: Partial<Referencia>) {
    atualizar((p) => ({
      ...p,
      referencial: {
        ...p.referencial,
        referencias: p.referencial.referencias.map((r) => (r.id === id ? { ...r, ...patch } : r)),
      },
    }));
  }

  function removerRef(id: string) {
    atualizar((p) => ({
      ...p,
      referencial: { ...p.referencial, referencias: p.referencial.referencias.filter((r) => r.id !== id) },
    }));
  }

  return (
    <div>
      <PageHeader
        eyebrow="Bloco 3"
        titulo="Referencial Teórico"
        oQueVerificamos="Quantidade, pertinência, atualidade, função e rastreabilidade das referências que sustentam sua discussão."
        porQueImporta="Referências decorativas (citadas sem função clara) enfraquecem a fundamentação. Toda referência central precisa justificar sua presença."
      />

      <div className="card">
        <p>
          Você tem <strong>{refs.length}</strong> referência(s) cadastrada(s).
        </p>
        <p className="help-text">
          Dez referências costuma ser um ponto de partida inicial razoável, mas a quantidade necessária
          depende da natureza e do estágio da sua pesquisa — use como indicador, não como regra fixa.
        </p>
      </div>

      <div className="stack">
        {refs.map((r) => {
          const antiga = r.ano && ANO_ATUAL - parseInt(r.ano, 10) > 15;
          return (
            <div className="card" key={r.id}>
              <div className="row">
                <div style={{ flex: 2, minWidth: 220 }}>
                  <TextField label="Autor(es)" value={r.autor} onChange={(v) => atualizarRef(r.id, { autor: v })} />
                </div>
                <div style={{ flex: 1, minWidth: 100 }}>
                  <TextField label="Ano" value={r.ano} onChange={(v) => atualizarRef(r.id, { ano: v })} />
                </div>
              </div>
              <TextField label="Título" value={r.titulo} onChange={(v) => atualizarRef(r.id, { titulo: v })} />
              <SelectField
                label="Classificação"
                value={r.tipo}
                onChange={(v) => atualizarRef(r.id, { tipo: v as TipoReferencia })}
                opcoes={TIPOS}
              />
              {antiga && (
                <p className="help-text">
                  Esta referência tem mais de 15 anos: ela é antiga porque é fundamental para o campo, ou
                  porque sua busca bibliográfica precisa ser atualizada? (Clássico necessário ≠ literatura
                  desatualizada por ausência de busca recente.)
                </p>
              )}
              <TextAreaField
                label="Ideia central deste texto *"
                value={r.ideiaCentral}
                onChange={(v) => atualizarRef(r.id, { ideiaCentral: v })}
                rows={2}
              />
              <TextAreaField
                label="Por que estou usando este texto na minha pesquisa? *"
                value={r.porQueUso}
                onChange={(v) => atualizarRef(r.id, { porQueUso: v })}
                rows={2}
              />
              <label style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 10 }}>
                <input type="checkbox" checked={r.ehApud} onChange={(e) => atualizarRef(r.id, { ehApud: e.target.checked })} />
                É uma citação de citação (apud)
              </label>
              {r.ehApud && (
                <SelectField
                  label="É possível acessar a fonte original?"
                  value={r.fonteOriginalDisponivel ?? ''}
                  onChange={(v) => atualizarRef(r.id, { fonteOriginalDisponivel: v as Referencia['fonteOriginalDisponivel'] })}
                  opcoes={[
                    { valor: 'sim', rotulo: 'Sim — devo preferir a fonte original' },
                    { valor: 'nao', rotulo: 'Não consegui acessar' },
                  ]}
                />
              )}
              <button type="button" className="btn ghost" onClick={() => removerRef(r.id)}>Remover referência</button>
            </div>
          );
        })}
      </div>

      <button type="button" className="btn secondary" style={{ marginTop: 12 }} onClick={adicionar}>
        + Adicionar referência
      </button>

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
            <ResultadoBloco titulo="Dados bibliográficos incompletos" itens={conferencia.dadosIncompletos} />
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
