import { useMemo, useState } from 'react';
import { useStore } from '../state/store';
import { PageHeader } from '../components/PageHeader';
import { YesNoUnknown } from '../components/YesNoUnknown';
import { TextAreaField } from '../components/Field';
import { ObjetivosEspecificosTable } from '../components/ObjetivosEspecificosTable';
import { CoherenceAlerts } from '../components/CoherenceAlert';
import { Accordion } from '../components/Accordion';
import { verificarCoerenciaArquiteturaPesquisa } from '../rules/coherence';
import { aiService, type PossibilidadePergunta } from '../services/aiService';
import type { SimNaoTalvez, ObjetivoEspecifico } from '../types/project';

export function ArquiteturaPesquisa() {
  const { projeto, atualizar, atualizarComRevisao } = useStore();
  const [tensoes, setTensoes] = useState<string[]>([]);
  const [carregandoTensoes, setCarregandoTensoes] = useState(false);
  const [possibilidades, setPossibilidades] = useState<PossibilidadePergunta[]>([]);
  const [carregandoPossibilidades, setCarregandoPossibilidades] = useState(false);
  const [alertaAlinhamento, setAlertaAlinhamento] = useState<string | null>(null);

  const alertas = useMemo(() => (projeto ? verificarCoerenciaArquiteturaPesquisa(projeto) : []), [projeto]);

  if (!projeto) return null;
  const ap = projeto.arquiteturaPesquisa;
  const perguntaJaConfirmada = !!projeto.decisoesConfirmadas['pergunta'];

  async function pedirTensoes() {
    setCarregandoTensoes(true);
    const r = await aiService.identificarTensoesNoIncomodo(ap.incomodoTexto);
    setTensoes(r);
    setCarregandoTensoes(false);
  }

  async function pedirPossibilidades() {
    setCarregandoPossibilidades(true);
    const r = await aiService.sugerirPerguntasDePesquisa(ap.incomodoTexto);
    setPossibilidades(r);
    setCarregandoPossibilidades(false);
  }

  function setPergunta(texto: string) {
    if (perguntaJaConfirmada) {
      atualizarComRevisao((p) => ({ ...p, arquiteturaPesquisa: { ...p.arquiteturaPesquisa, perguntaPesquisa: texto } }));
    } else {
      atualizar((p) => ({ ...p, arquiteturaPesquisa: { ...p.arquiteturaPesquisa, perguntaPesquisa: texto } }));
    }
  }

  function confirmarPergunta() {
    atualizar((p) => ({
      ...p,
      arquiteturaPesquisa: { ...p.arquiteturaPesquisa, perguntaConfirmada: 'sim' },
      decisoesConfirmadas: { ...p.decisoesConfirmadas, pergunta: true },
    }));
  }

  async function verificarAlinhamento() {
    const r = await aiService.verificarAlinhamentoObjetivoPergunta(ap.perguntaPesquisa, ap.objetivoGeral);
    setAlertaAlinhamento(r);
  }

  function setObjetivosEspecificos(linhas: ObjetivoEspecifico[]) {
    atualizar((p) => ({ ...p, arquiteturaPesquisa: { ...p.arquiteturaPesquisa, objetivosEspecificos: linhas } }));
  }

  function marcarRevisaoConcluida() {
    atualizar((p) => ({ ...p, arquiteturaPesquisa: { ...p.arquiteturaPesquisa, precisaRevisaoCoerencia: false } }));
  }

  return (
    <div>
      <PageHeader
        eyebrow="Bloco 1"
        titulo="Arquitetura da Pesquisa"
        oQueVerificamos="A coerência lógica entre o que te incomoda, sua pergunta, hipótese (se houver), objetivos e resultados esperados."
        porQueImporta="Um problema mal definido gera metodologia desalinhada e conclusões que não respondem a nada. Aqui você decide — o sistema só verifica."
      />

      {ap.precisaRevisaoCoerencia && (
        <div className="alert danger" style={{ marginBottom: 16 }}>
          <strong>Esta seção foi marcada para revisão</strong>
          <p style={{ margin: '6px 0 0' }}>Algo essencial mudou (provavelmente sua pergunta de pesquisa). Releia os itens abaixo.</p>
        </div>
      )}

      <section className="card">
        <h2 style={{ marginTop: 0, fontSize: '1.1rem' }}>Etapa 1 — O incômodo</h2>
        <YesNoUnknown
          nomeGrupo="incomodo"
          pergunta="Consigo explicar claramente o que me incomoda, intriga ou desperta minha curiosidade no campo que pretendo pesquisar."
          valor={ap.incomodoConfirmado}
          onChange={(v: SimNaoTalvez) => atualizar((p) => ({ ...p, arquiteturaPesquisa: { ...p.arquiteturaPesquisa, incomodoConfirmado: v } }))}
        />
        <div style={{ marginTop: 12 }}>
          <TextAreaField
            label="O que está te incomodando?"
            help="Escreva como você explicaria isso numa conversa. Não tente parecer acadêmico."
            value={ap.incomodoTexto}
            onChange={(v) => atualizar((p) => ({ ...p, arquiteturaPesquisa: { ...p.arquiteturaPesquisa, incomodoTexto: v } }))}
            rows={5}
          />
        </div>
        <button type="button" className="btn secondary" onClick={pedirTensoes} disabled={!ap.incomodoTexto.trim() || carregandoTensoes}>
          {carregandoTensoes ? 'Analisando…' : 'Pedir ajuda para identificar tensões e lacunas'}
        </button>
        {tensoes.length > 0 && (
          <div className="stack" style={{ marginTop: 12 }}>
            {tensoes.map((t, i) => (
              <div key={i} className="alert" style={{ background: 'var(--primary-soft)', borderColor: 'var(--primary)' }}>{t}</div>
            ))}
          </div>
        )}
      </section>

      <section className="card">
        <h2 style={{ marginTop: 0, fontSize: '1.1rem' }}>Pergunta de pesquisa</h2>
        <YesNoUnknown
          nomeGrupo="pergunta-provisoria"
          pergunta="Consigo transformar esse incômodo em uma pergunta de pesquisa provisória."
          valor={ap.perguntaConfirmada}
          onChange={(v: SimNaoTalvez) => atualizar((p) => ({ ...p, arquiteturaPesquisa: { ...p.arquiteturaPesquisa, perguntaConfirmada: v } }))}
        />
        {ap.perguntaConfirmada === 'ainda_nao' && (
          <div style={{ marginTop: 12 }}>
            <button type="button" className="btn secondary" onClick={pedirPossibilidades} disabled={!ap.incomodoTexto.trim() || carregandoPossibilidades}>
              {carregandoPossibilidades ? 'Gerando possibilidades…' : 'Sugerir possibilidades a partir do meu incômodo'}
            </button>
            <div className="stack" style={{ marginTop: 12 }}>
              {possibilidades.map((pos) => (
                <div className="card" key={pos.rotulo}>
                  <strong>{pos.rotulo}</strong>
                  <p style={{ margin: '6px 0' }}>{pos.pergunta}</p>
                  <p className="help-text" style={{ margin: '0 0 8px' }}>{pos.explicacao}</p>
                  <button type="button" className="btn secondary" onClick={() => setPergunta(pos.pergunta)}>Usar como ponto de partida</button>
                </div>
              ))}
            </div>
          </div>
        )}
        <div style={{ marginTop: 12 }}>
          <TextAreaField
            label="Sua pergunta de pesquisa (editável)"
            value={ap.perguntaPesquisa}
            onChange={setPergunta}
            rows={3}
            help="A decisão final é sempre sua — edite livremente o que veio das sugestões ou escreva a sua."
          />
        </div>
        <button type="button" className="btn" disabled={!ap.perguntaPesquisa.trim()} onClick={confirmarPergunta}>
          Confirmar esta pergunta
        </button>
      </section>

      <section className="card">
        <h2 style={{ marginTop: 0, fontSize: '1.1rem' }}>Hipótese</h2>
        <YesNoUnknown
          nomeGrupo="necessita-hipotese"
          pergunta="Sua pesquisa necessita trabalhar com hipótese?"
          valor={ap.necessitaHipotese}
          onChange={(v: SimNaoTalvez) => atualizar((p) => ({ ...p, arquiteturaPesquisa: { ...p.arquiteturaPesquisa, necessitaHipotese: v } }))}
          opcoes={[
            { valor: 'sim', rotulo: 'Sim' },
            { valor: 'ainda_nao', rotulo: 'Não' },
            { valor: 'nao_sei', rotulo: 'Não sei' },
          ]}
        />
        {ap.necessitaHipotese === 'nao_sei' && (
          <Accordion titulo="Quando uma pesquisa costuma precisar de hipótese?" aberto>
            <p>
              Hipóteses são comuns em pesquisas que testam relações entre variáveis (frequentemente
              quantitativas ou experimentais). Pesquisas exploratórias, descritivas ou qualitativas
              interpretativas frequentemente não partem de uma hipótese fechada, e sim de perguntas abertas.
              Não existe resposta certa universal — depende do que sua pergunta pede.
            </p>
          </Accordion>
        )}
        {ap.necessitaHipotese === 'sim' && (
          <div style={{ marginTop: 12 }}>
            <TextAreaField
              label="Sua hipótese (resposta provisória à pergunta de pesquisa)"
              value={ap.hipotese}
              onChange={(v) => atualizar((p) => ({ ...p, arquiteturaPesquisa: { ...p.arquiteturaPesquisa, hipotese: v } }))}
              rows={3}
              help="Esta é uma decisão sua. O sistema não inventa hipóteses — apenas pode ajudar a verificar sua coerência com a pergunta."
            />
          </div>
        )}
      </section>

      <section className="card">
        <h2 style={{ marginTop: 0, fontSize: '1.1rem' }}>Objetivo geral</h2>
        <TextAreaField
          label="Meu objetivo geral responde diretamente à minha pergunta de pesquisa"
          help="Escreva o que sua pesquisa pretende alcançar, iniciando com um verbo no infinitivo (compreender, analisar, identificar...)."
          value={ap.objetivoGeral}
          onChange={(v) => atualizar((p) => ({ ...p, arquiteturaPesquisa: { ...p.arquiteturaPesquisa, objetivoGeral: v } }))}
          rows={3}
        />
        <button type="button" className="btn secondary" onClick={verificarAlinhamento} disabled={!ap.objetivoGeral.trim() || !ap.perguntaPesquisa.trim()}>
          Verificar alinhamento com a pergunta
        </button>
        {alertaAlinhamento && <p className="alert warning" style={{ marginTop: 10 }}>{alertaAlinhamento}</p>}
      </section>

      <section className="card">
        <h2 style={{ marginTop: 0, fontSize: '1.1rem' }}>Objetivos específicos</h2>
        <p className="help-text">Para cada objetivo específico, verificamos se existe uma ação clara, um procedimento possível e um resultado correspondente.</p>
        <ObjetivosEspecificosTable linhas={ap.objetivosEspecificos} onChange={setObjetivosEspecificos} />
      </section>

      <section className="card">
        <h2 style={{ marginTop: 0, fontSize: '1.1rem' }}>Teste de coerência da pesquisa</h2>
        <CoherenceAlerts alertas={alertas} tituloOk="Está coerente" />
        {ap.precisaRevisaoCoerencia && alertas.length === 0 && (
          <button type="button" className="btn secondary" style={{ marginTop: 12 }} onClick={marcarRevisaoConcluida}>
            Marcar revisão como concluída
          </button>
        )}
      </section>
    </div>
  );
}
