import { useStore } from '../state/store';
import { useRouter } from '../state/router';
import { PageHeader } from '../components/PageHeader';
import { YesNoUnknown } from '../components/YesNoUnknown';
import { TextAreaField } from '../components/Field';
import { criarTarefaSeNecessario, concluirTarefasPorOrigem } from '../rules/coherence';
import { exigenciasEticasComuns } from '../knowledge';
import type { ResearchProject, SimNaoTalvez } from '../types/project';

export function MarcoZero() {
  const { projeto, atualizar } = useStore();
  const { navegar } = useRouter();
  if (!projeto) return null;
  const mz = projeto.marcoZero;

  function setSecoes(v: SimNaoTalvez) {
    atualizar((p) => {
      let novo: ResearchProject = { ...p, marcoZero: { ...p.marcoZero, secoesDesenvolvidas: v } };
      if (v === 'ainda_nao') {
        novo = criarTarefaSeNecessario(
          novo,
          'marco_zero_secoes',
          'Escreva pelo menos um parágrafo inicial em cada seção vazia do seu trabalho. Não se preocupe com qualidade, linguagem acadêmica ou perfeição neste momento — a lapidação acontece depois.',
        );
      } else {
        novo = concluirTarefasPorOrigem(novo, 'marco_zero_secoes');
      }
      return novo;
    });
  }

  function setEixo(v: SimNaoTalvez) {
    atualizar((p) => ({ ...p, marcoZero: { ...p.marcoZero, eixoMotivacao: v } }));
  }

  function setEixoTexto(texto: string) {
    atualizar((p) => ({ ...p, marcoZero: { ...p.marcoZero, eixoMotivacaoTexto: texto } }));
  }

  function setEticaStatus(v: SimNaoTalvez) {
    atualizar((p) => {
      let novo: ResearchProject = { ...p, marcoZero: { ...p.marcoZero, etica: { ...p.marcoZero.etica, status: v } } };
      if (v !== 'sim') {
        novo = criarTarefaSeNecessario(
          novo,
          'marco_zero_etica',
          'Liste quais autorizações, termos ou avaliações éticas sua pesquisa pode exigir, mesmo que ainda tenha dúvidas. Verifique essas exigências junto às normas da sua instituição antes de executar a pesquisa.',
        );
      } else {
        novo = concluirTarefasPorOrigem(novo, 'marco_zero_etica');
      }
      return novo;
    });
  }

  function toggleExigencia(item: string) {
    atualizar((p) => {
      const atuais = p.marcoZero.etica.exigenciasIdentificadas;
      const novasExig = atuais.includes(item) ? atuais.filter((e) => e !== item) : [...atuais, item];
      return { ...p, marcoZero: { ...p.marcoZero, etica: { ...p.marcoZero.etica, exigenciasIdentificadas: novasExig } } };
    });
  }

  const item1Respondido = mz.secoesDesenvolvidas !== null;
  const item2Respondido = mz.eixoMotivacao === 'sim' || (mz.eixoMotivacao === 'ainda_nao' && mz.eixoMotivacaoTexto.trim().length > 0);
  const item3Respondido = mz.etica.status !== null;
  const tudoRespondido = item1Respondido && item2Respondido && item3Respondido;

  function concluirMarcoZero() {
    atualizar((p) => {
      let novo = { ...p, marcoZero: { ...p.marcoZero, concluido: true } };
      if (novo.arquiteturaPesquisa.incomodoTexto.trim() === '' && p.marcoZero.eixoMotivacaoTexto.trim()) {
        novo = {
          ...novo,
          arquiteturaPesquisa: { ...novo.arquiteturaPesquisa, incomodoTexto: p.marcoZero.eixoMotivacaoTexto },
        };
      }
      return novo;
    });
    navegar({ pagina: 'arquitetura_pesquisa' });
  }

  return (
    <div>
      <PageHeader
        eyebrow="Marco Zero"
        titulo="Posso entregar isso?"
        oQueVerificamos="Três condições mínimas para que sua pesquisa possa ser examinada com profundidade."
        porQueImporta="Antes de revisar qualidade, precisamos ter alguma coisa para revisar — e algumas travas (como ética) precisam ser lembradas desde já."
      />

      <div className="card">
        <YesNoUnknown
          nomeGrupo="secoes-obrigatorias"
          pergunta="1. Todas as seções obrigatórias do meu trabalho possuem pelo menos um ou dois parágrafos desenvolvidos."
          valor={mz.secoesDesenvolvidas}
          onChange={setSecoes}
        />
        {mz.secoesDesenvolvidas === 'ainda_nao' && (
          <div className="alert warning" style={{ marginTop: 12 }}>
            <p style={{ margin: '0 0 8px' }}>
              <strong>Sério que você pensou em mandar assim para o seu orientador?</strong>
            </p>
            <p style={{ margin: '0 0 8px' }}>
              Antes de revisar qualidade, precisamos ter alguma coisa para revisar.
            </p>
            <p style={{ margin: 0 }}>
              <strong>Tarefa:</strong> escreva pelo menos um parágrafo inicial em cada seção vazia. Não se
              preocupe com qualidade, linguagem acadêmica ou perfeição agora — a lapidação acontece depois.
              Volte aqui quando tiver feito isso.
            </p>
          </div>
        )}
      </div>

      <div className="card">
        <YesNoUnknown
          nomeGrupo="eixo-motivacao"
          pergunta="2. Consigo explicar de onde parte minha pesquisa, minhas motivações e qual questão ou lacuna me incomoda nesse campo."
          valor={mz.eixoMotivacao}
          onChange={setEixo}
        />
        {mz.eixoMotivacao === 'ainda_nao' && (
          <div style={{ marginTop: 12 }}>
            <TextAreaField
              label="O que está te incomodando?"
              help="Escreva sem linguagem acadêmica, como se estivesse contando para alguém em uma conversa. O que você observa nesse campo, o que chama sua atenção, incomoda, contradiz ou desperta sua curiosidade? Por que isso importa para você?"
              value={mz.eixoMotivacaoTexto}
              onChange={setEixoTexto}
              rows={5}
            />
          </div>
        )}
      </div>

      <div className="card">
        <YesNoUnknown
          nomeGrupo="etica"
          pergunta="3. Já identifiquei as principais exigências éticas que podem se aplicar à minha pesquisa."
          valor={mz.etica.status}
          onChange={setEticaStatus}
          opcoes={[
            { valor: 'sim', rotulo: 'Sim' },
            { valor: 'ainda_nao', rotulo: 'Ainda não' },
            { valor: 'nao_sei', rotulo: 'Não sei' },
          ]}
        />
        <div className="alert warning" style={{ marginTop: 10 }}>
          <strong>IMPORTANTE:</strong> verifique isso com o seu orientador. Este sistema não decide se sua
          pesquisa exige ou não aprovação ética — isso deve ser confirmado junto ao seu orientador e às
          normas da sua instituição. Abaixo estão exemplos comuns; marque os que podem se aplicar ao seu caso.
        </div>
        <div className="stack" style={{ marginTop: 10 }}>
          {exigenciasEticasComuns.map((item) => (
            <label key={item} style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
              <input
                type="checkbox"
                checked={mz.etica.exigenciasIdentificadas.includes(item)}
                onChange={() => toggleExigencia(item)}
              />
              {item}
            </label>
          ))}
        </div>
      </div>

      <div className="card">
        {mz.concluido ? (
          <div className="alert success">
            <strong>Marco Zero concluído.</strong>
            <p style={{ margin: '8px 0 0' }}>
              Agora sua pesquisa possui condições mínimas para passar de "tenho uma ideia" para "consigo
              examinar sua arquitetura".
            </p>
          </div>
        ) : (
          <button type="button" className="btn" disabled={!tudoRespondido} onClick={concluirMarcoZero}>
            Concluir Marco Zero e seguir para a Arquitetura da Pesquisa
          </button>
        )}
        {!tudoRespondido && <p className="help-text" style={{ marginTop: 8 }}>Responda às três perguntas acima para continuar.</p>}
      </div>
    </div>
  );
}
