export function Privacidade() {
  return (
    <div className="stack">
      <div className="card">
        <p className="eyebrow">Privacidade e uso responsável de IA</p>
        <h1 style={{ marginTop: 4 }}>Como este sistema lida com seus dados</h1>
        <p>
          Este sistema foi pensado para <strong>autoavaliação</strong>: você utiliza seu próprio material
          para revisar sua própria pesquisa. Não submeta trabalhos de terceiros sem autorização explícita
          das pessoas envolvidas.
        </p>
      </div>

      <div className="card">
        <h2 style={{ fontSize: '1.05rem' }}>O que é armazenado, e onde</h2>
        <p>
          Nesta versão (MVP), todas as suas respostas ficam salvas <strong>apenas no seu próprio
          navegador</strong> (armazenamento local do dispositivo), sem envio a nenhum servidor. Isso
          significa que o progresso não é sincronizado entre dispositivos e pode ser perdido se você limpar
          os dados do navegador.
        </p>
        <p>
          Você pode apagar todos os seus dados a qualquer momento limpando o armazenamento local do
          navegador para este site.
        </p>
      </div>

      <div className="card">
        <h2 style={{ fontSize: '1.05rem' }}>O que seria enviado a um modelo de IA externo</h2>
        <p>
          Nesta versão MVP, as funcionalidades de apoio (sugestão de perguntas, identificação de tensões,
          geração de rascunho metodológico) usam respostas <strong>simuladas localmente</strong> — nenhum
          conteúdo é enviado a nenhum provedor externo de IA.
        </p>
        <p>
          Em uma versão futura com integração real, apenas o texto que você digitar nos campos específicos
          de apoio (nunca automaticamente, e nunca sem essa tela explicar previamente) seria enviado, e
          apenas mediante seu consentimento explícito para aquele envio.
        </p>
      </div>

      <div className="card">
        <h2 style={{ fontSize: '1.05rem' }}>Riscos e responsabilidades</h2>
        <ul>
          <li>Evite inserir dados pessoais sensíveis de terceiros (participantes de pesquisa, por exemplo) neste sistema.</li>
          <li>Este sistema não substitui a orientação acadêmica formal nem a avaliação de um Comitê de Ética.</li>
          <li>Toda decisão científica (problema, objetivos, metodologia, interpretação) é de responsabilidade humana — do estudante e de seu orientador.</li>
          <li>O sistema pode ajudar a identificar inconsistências, mas não valida a correção científica do conteúdo.</li>
        </ul>
      </div>
    </div>
  );
}
