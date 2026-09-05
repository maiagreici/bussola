import { useState } from 'react';
import { useStore } from '../state/store';
import { PageHeader } from '../components/PageHeader';
import { YesNoUnknown } from '../components/YesNoUnknown';
import { TextAreaField } from '../components/Field';
import { Accordion } from '../components/Accordion';
import { TreeEditor } from '../components/TreeEditor';
import { aiService } from '../services/aiService';
import type { SimNaoTalvez } from '../types/project';

export function ArquiteturaTexto() {
  const { projeto, atualizar } = useStore();
  const [gerandoSugestao, setGerandoSugestao] = useState(false);
  if (!projeto) return null;
  const at = projeto.arquiteturaTexto;

  async function sugerirEstrutura() {
    setGerandoSugestao(true);
    const nos = await aiService.sugerirEstruturaSumario({ titulo: projeto!.tituloProvisorio, area: projeto!.perfil.areaConhecimento });
    atualizar((p) => ({ ...p, arquiteturaTexto: { ...p.arquiteturaTexto, estruturaProvisoria: nos } }));
    setGerandoSugestao(false);
  }

  return (
    <div>
      <PageHeader
        eyebrow="Bloco 2"
        titulo="Arquitetura do Texto"
        oQueVerificamos="Se a estrutura física do documento representa adequadamente a arquitetura lógica da sua pesquisa."
        porQueImporta="Um texto desproporcional ou com conteúdo no capítulo errado confunde o leitor mesmo quando a pesquisa em si está bem pensada."
      />

      <section className="card">
        <h2 style={{ marginTop: 0, fontSize: '1.1rem' }}>Proporcionalidade</h2>
        <YesNoUnknown
          nomeGrupo="proporcionalidade"
          pergunta="As principais seções apresentam desenvolvimento minimamente proporcional à função que desempenham no trabalho."
          valor={at.proporcionalidadeConfirmada}
          onChange={(v: SimNaoTalvez) => atualizar((p) => ({ ...p, arquiteturaTexto: { ...p.arquiteturaTexto, proporcionalidadeConfirmada: v } }))}
        />
        <p className="help-text" style={{ marginTop: 8 }}>
          Não é preciso tamanho matematicamente igual entre seções — o alerta é para desproporções evidentes
          (ex.: introdução de meia página, revisão de 40 páginas, conclusão de duas linhas).
        </p>
        {at.proporcionalidadeConfirmada === 'ainda_nao' && (
          <TextAreaField
            label="O que está desproporcional?"
            value={at.proporcionalidadeObservacoes}
            onChange={(v) => atualizar((p) => ({ ...p, arquiteturaTexto: { ...p.arquiteturaTexto, proporcionalidadeObservacoes: v } }))}
            rows={3}
          />
        )}
      </section>

      <section className="card">
        <h2 style={{ marginTop: 0, fontSize: '1.1rem' }}>Conteúdo no lugar certo</h2>
        <YesNoUnknown
          nomeGrupo="conteudo-lugar-certo"
          pergunta="A metodologia descreve procedimentos, os resultados apresentam achados, a discussão interpreta, e as considerações finais respondem à pesquisa."
          valor={at.conteudoNoLugarCertoConfirmado}
          onChange={(v: SimNaoTalvez) => atualizar((p) => ({ ...p, arquiteturaTexto: { ...p.arquiteturaTexto, conteudoNoLugarCertoConfirmado: v } }))}
        />
        <Accordion titulo="Alertas comuns de conteúdo fora do lugar">
          <ul>
            <li><strong>Metodologia espalhada:</strong> partes do método aparecem soltas em outras seções, dificultando avaliar o desenho da pesquisa como um todo.</li>
            <li><strong>Resultado na metodologia:</strong> achados aparecem antes de a coleta/análise terem sido totalmente descritas.</li>
            <li><strong>Discussão antecipada:</strong> interpretação dos dados aparece misturada à apresentação dos resultados, sem distinção clara entre "o que encontrei" e "o que isso significa".</li>
          </ul>
        </Accordion>
        {at.conteudoNoLugarCertoConfirmado === 'ainda_nao' && (
          <TextAreaField
            label="O que parece estar no lugar errado?"
            value={at.conteudoNoLugarCertoObservacoes}
            onChange={(v) => atualizar((p) => ({ ...p, arquiteturaTexto: { ...p.arquiteturaTexto, conteudoNoLugarCertoObservacoes: v } }))}
            rows={3}
          />
        )}
      </section>

      <section className="card">
        <h2 style={{ marginTop: 0, fontSize: '1.1rem' }}>Sumário provisório</h2>
        <YesNoUnknown
          nomeGrupo="sumario-visualizavel"
          pergunta="Consigo visualizar como imagino este trabalho quando estiver concluído."
          valor={at.sumarioVisualizavel}
          onChange={(v: SimNaoTalvez) => atualizar((p) => ({ ...p, arquiteturaTexto: { ...p.arquiteturaTexto, sumarioVisualizavel: v } }))}
        />
        {at.sumarioVisualizavel === 'ainda_nao' && (
          <div className="alert" style={{ marginTop: 10, background: 'var(--primary-soft)', borderColor: 'var(--primary)' }}>
            Feche os olhos e imagine seu trabalho pronto. Quais capítulos e subtítulos precisariam existir
            para contar essa pesquisa do início ao fim?
          </div>
        )}
        <div style={{ marginTop: 12 }}>
          <button type="button" className="btn secondary" onClick={sugerirEstrutura} disabled={gerandoSugestao}>
            {gerandoSugestao ? 'Gerando…' : 'Sugestão de estrutura (ponto de partida editável)'}
          </button>
        </div>
        <div style={{ marginTop: 12 }}>
          <TreeEditor
            nos={at.estruturaProvisoria}
            onChange={(nos) => atualizar((p) => ({ ...p, arquiteturaTexto: { ...p.arquiteturaTexto, estruturaProvisoria: nos } }))}
          />
        </div>
      </section>
    </div>
  );
}
