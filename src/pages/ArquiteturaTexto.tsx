import { useState } from 'react';
import { useStore } from '../state/store';
import { useRouter } from '../state/router';
import { PageHeader } from '../components/PageHeader';
import { YesNoUnknown } from '../components/YesNoUnknown';
import { TextAreaField } from '../components/Field';
import { Accordion } from '../components/Accordion';
import { TreeEditor } from '../components/TreeEditor';
import { aiService } from '../services/aiService';
import type { SimNaoTalvez } from '../types/project';

const TAMANHO_MINIMO_RESPOSTA = 15;

export function ArquiteturaTexto() {
  const { projeto, atualizar } = useStore();
  const { navegar } = useRouter();
  const [gerandoSugestao, setGerandoSugestao] = useState(false);
  if (!projeto) return null;
  const at = projeto.arquiteturaTexto;

  async function sugerirEstrutura() {
    setGerandoSugestao(true);
    const nos = await aiService.sugerirEstruturaSumario({ titulo: projeto!.tituloProvisorio, area: projeto!.perfil.areaConhecimento });
    atualizar((p) => ({ ...p, arquiteturaTexto: { ...p.arquiteturaTexto, estruturaProvisoria: nos } }));
    setGerandoSugestao(false);
  }

  function avisoRespostaCurta(texto: string) {
    if (texto.trim().length === 0) {
      return 'Você marcou "ainda não" mas não escreveu nada ainda — sem essa explicação, não dá para saber o que corrigir.';
    }
    if (texto.trim().length < TAMANHO_MINIMO_RESPOSTA) {
      return 'Essa explicação está bem curta — tente detalhar um pouco mais o que precisa mudar.';
    }
    return null;
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
        <h2 style={{ marginTop: 0, fontSize: '1.1rem' }}>Sumário provisório</h2>
        <Accordion titulo="O que é um 'sumário provisório'? O que é 'estado da arte'?" aberto>
          <p>
            O <strong>sumário provisório</strong> é um rascunho da lista de capítulos e subcapítulos do seu
            trabalho — como um esqueleto que você vai preenchendo aos poucos. Ele é "provisório" porque pode
            (e costuma) mudar conforme a pesquisa avança.
          </p>
          <p>
            <strong>Estado da arte</strong> é um nome comum para o capítulo que reúne o que já foi pesquisado
            sobre o seu tema até agora — os principais estudos, conceitos e autores relevantes. Em muitos
            trabalhos esse conteúdo aparece dentro do capítulo "Referencial teórico", em outros ganha um
            capítulo próprio chamado "Estado da arte". Os dois nomes descrevem, no fundo, a mesma função:
            situar sua pesquisa em relação ao que já existe.
          </p>
        </Accordion>
        <div style={{ marginTop: 12 }}>
          <YesNoUnknown
            nomeGrupo="sumario-visualizavel"
            pergunta="Consigo visualizar como imagino este trabalho quando estiver concluído."
            valor={at.sumarioVisualizavel}
            onChange={(v: SimNaoTalvez) => atualizar((p) => ({ ...p, arquiteturaTexto: { ...p.arquiteturaTexto, sumarioVisualizavel: v } }))}
          />
        </div>
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
          <div style={{ marginTop: 10 }}>
            <TextAreaField
              label="O que parece estar no lugar errado?"
              value={at.conteudoNoLugarCertoObservacoes}
              onChange={(v) => atualizar((p) => ({ ...p, arquiteturaTexto: { ...p.arquiteturaTexto, conteudoNoLugarCertoObservacoes: v } }))}
              rows={3}
            />
            {avisoRespostaCurta(at.conteudoNoLugarCertoObservacoes) && (
              <p role="alert" style={{ color: 'var(--danger)', marginTop: -6 }}>{avisoRespostaCurta(at.conteudoNoLugarCertoObservacoes)}</p>
            )}
          </div>
        )}
      </section>

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
          <div style={{ marginTop: 10 }}>
            <TextAreaField
              label="O que está desproporcional?"
              value={at.proporcionalidadeObservacoes}
              onChange={(v) => atualizar((p) => ({ ...p, arquiteturaTexto: { ...p.arquiteturaTexto, proporcionalidadeObservacoes: v } }))}
              rows={3}
            />
            {avisoRespostaCurta(at.proporcionalidadeObservacoes) && (
              <p role="alert" style={{ color: 'var(--danger)', marginTop: -6 }}>{avisoRespostaCurta(at.proporcionalidadeObservacoes)}</p>
            )}
          </div>
        )}
      </section>

      <section className="card" style={{ background: 'var(--primary-soft)', borderColor: 'var(--primary)' }}>
        <button type="button" className="btn" onClick={() => navegar({ pagina: 'referencial' })}>
          Ir para o Bloco 3 — Referencial Teórico →
        </button>
      </section>
    </div>
  );
}
