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
        <h2 style={{ fontSize: '1.05rem' }}>Sua ideia é sua</h2>
        <p>
          A sua pesquisa, suas ideias e suas decisões <strong>não são compartilhadas com outros
          estudantes, não são vendidas, e não são usadas para treinar nenhum modelo de IA</strong>. Nenhum
          outro estudante tem acesso ao que você escreve aqui — apenas você e, se esta instalação tiver o
          Painel do Professor ativado (ver abaixo), a pessoa responsável pela disciplina.
        </p>
      </div>

      <div className="card">
        <h2 style={{ fontSize: '1.05rem' }}>O que é armazenado, e onde</h2>
        <p>
          Todas as suas respostas ficam salvas no <strong>armazenamento local do seu navegador</strong>, o
          que já garante que você não perde o progresso ao fechar a aba. Você pode apagar tudo a qualquer
          momento limpando os dados do site no seu navegador.
        </p>
        <p>
          Além disso, esta instalação da Bússola pode estar configurada para também enviar uma cópia do seu
          projeto para o <strong>servidor da própria instituição/professor</strong> que disponibilizou este
          link — nunca para um provedor de IA externo, nunca para terceiros. Isso existe para alimentar o
          <strong> Painel do Professor</strong>: uma tela protegida por senha, acessível só por quem
          administra o site, que mostra o progresso e o diagnóstico de cada aluno — a mesma informação que
          você já vê na sua própria tela de Diagnóstico Final, não mais que isso. Se você não sabe se esta
          instalação tem essa cópia ativada, pergunte ao professor ou responsável pelo link que você recebeu.
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
          <li>Toda decisão científica (problema, objetivos, metodologia, interpretação) é de responsabilidade humana — do estudante e de quem o orienta ou avalia (orientador, banca de seleção, etc.).</li>
          <li>O sistema pode ajudar a identificar inconsistências, mas não valida a correção científica do conteúdo.</li>
        </ul>
      </div>
    </div>
  );
}
