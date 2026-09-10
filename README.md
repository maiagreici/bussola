# Bússola — Sistema de Autoavaliação e Arquitetura de Pesquisas Acadêmicas

Bússola **não é** um gerador de TCC. É uma pré-orientação estruturada: conduz o
próprio estudante por uma sequência de decisões e verificações — Marco Zero,
Arquitetura da Pesquisa, Arquitetura do Texto, Referencial Teórico e
Metodologia — antes de levar o trabalho ao orientador. O sistema questiona,
verifica coerência e ajuda a redigir trechos técnicos; ele nunca decide a
pesquisa no lugar do estudante, nem inventa referências, dados ou resultados.

## Stack e por quê

- **React 18 + TypeScript + Vite**: SPA simples de rodar localmente, sem
  necessidade de backend para o MVP, com build rápido e tipagem forte para
  um modelo de dados central complexo (`ResearchProject`).
- **Sem framework de estado externo** (Redux/Zustand): um `Context` +
  `useReducer` já é suficiente para o volume de estado deste MVP, evitando
  dependência extra.
- **Persistência em `localStorage`**: simula o "salvar automaticamente e
  continuar depois" (critério de aceite) sem exigir servidor. Ver
  `src/state/store.tsx`.
- **Roteamento por hash** (`src/state/router.tsx`): evita dependência de
  `react-router` para 9 telas; sobrevive a F5 e permite voltar/avançar.
- **Sem CSS framework**: uma folha de estilos única com variáveis (tema claro
  e escuro via `prefers-color-scheme`), para manter o bundle pequeno.

## Estrutura de pastas

```
src/
  types/       Modelo de dados central (ResearchProject)
  state/       Store (Context+reducer+localStorage), router, factory
  knowledge/   Base de Conhecimento (natureza, abordagem, delineamento,
               coleta, análise) — separada da lógica de UI
  services/    AIService (abstração de IA) — implementação mock
  rules/       Motor de regras de negócio e coerência (puro, sem UI)
  components/  Componentes de UI reutilizáveis
  pages/       Uma página por módulo do fluxo
  utils/       Conferência bibliográfica, exportação
```

## Executando localmente

```bash
npm install
npm run dev       # http://localhost:5173
npm run build     # build de produção em dist/
npm run preview   # serve o build de produção
```

## Ponto de integração futura com IA real

`src/services/aiService.ts` define a interface `AIService` e uma
implementação `MockAIService` **determinística e claramente identificada
como simulação** — ela nunca inventa referência, dado ou conteúdo
científico, apenas reorganiza o que o próprio usuário escreveu. Para
integrar um provedor real:

1. Criar um backend (nunca chamar o provedor diretamente do navegador —
   a chave de API não pode viver no frontend).
2. Implementar uma nova classe `RealAIService implements AIService` que
   chama `fetch('/api/ai/...')`.
3. Trocar `export const aiService = new MockAIService()` por
   `new RealAIService()` em um único lugar.

A tela **Privacidade** (`src/pages/Privacidade.tsx`) já documenta o que
seria enviado nesse cenário e exige consentimento explícito antes de
qualquer envio real.

## Backend opcional: Painel do Professor (PHP + MySQL)

O app é 100% funcional sem nenhum servidor (tudo em `localStorage`). A pasta
`api/` adiciona um backend **opcional**, pensado para hospedagem
compartilhada (ex: HostGator/cPanel, que já roda PHP + MySQL nativamente):

- `api/save.php` — recebe o `ResearchProject` inteiro (JSON) e grava/atualiza
  uma linha por aluno (upsert por `id`), sem exigir login do aluno.
- `api/login.php` / `api/logout.php` — autenticam o professor por senha
  (hash em `api/config.php`, comparado com `password_verify`) e abrem uma
  sessão PHP.
- `api/list.php` — retorna todos os projetos salvos, só para sessão
  autenticada; devolve o JSON completo de cada projeto, que o front-end
  processa com a **mesma** `diagnosticarProjeto()` usada na tela do aluno
  (`src/pages/PainelProfessor.tsx`) — nunca dois critérios diferentes de
  maturidade dependendo de quem está olhando.
- `api/db.sql` — schema de uma tabela só (`bussola_projetos`), com o projeto
  inteiro guardado como JSON numa coluna `LONGTEXT` — evita duplicar no
  banco a modelagem que já existe em `src/types/project.ts`.

Para ativar: crie um banco MySQL e um usuário pelo cPanel, rode `db.sql` via
phpMyAdmin, edite `api/config.php` com as credenciais e o hash da senha do
professor, e suba a pasta `api/` junto com o build (`dist/`) para o mesmo
host. Sem isso configurado, `src/services/syncService.ts` simplesmente falha
em silêncio a cada tentativa de sincronizar — o app continua funcionando
normalmente só com o `localStorage`.

**Limitação de segurança conhecida:** `save.php` não autentica o aluno — o
`id` do projeto (gerado aleatoriamente no navegador) funciona como um
segredo de fato. Suficiente para uma turma pequena e de baixo risco; não é
adequado para dados sensíveis ou um cenário adversarial.

## Limitações conhecidas do MVP (documentadas, não escondidas)

- **Conferência bibliográfica bidirecional** (`src/utils/bibliografia.ts`):
  usa um regex simples (`Sobrenome, 2020` / `Sobrenome (2020)`) sobre um
  texto colado pelo usuário. Suficiente para um alerta útil, mas não
  substitui revisão manual. Evoluir para um parser ABNT completo é o
  próximo passo — a funcionalidade já está na interface e não deve ser
  removida, apenas ter esse motor substituído.
- **Sumário provisório e redação metodológica** geradas pela IA mock usam
  templates determinísticos a partir das respostas confirmadas — qualquer
  informação ausente aparece explicitamente como
  `[INFORMAÇÃO AUSENTE — ...]`, nunca é inventada.
- **Referências metodológicas da Base de Conhecimento** usam o placeholder
  `[REFERÊNCIA METODOLÓGICA A SER VALIDADA]` até que uma bibliografia
  definitiva e verificada seja incorporada — nunca uma referência inventada.
- Persistência principal é local ao navegador (localStorage). Opcionalmente,
  se o backend em `api/` estiver configurado (ver seção abaixo), o projeto
  também é espelhado num banco próprio para alimentar o Painel do Professor
  — documentado na tela de Privacidade.

## Dados de demonstração

Não há seed automático: a intenção é que cada sessão comece pelo
Onboarding real. Para testar rapidamente o fluxo completo, um roteiro
sugerido:

1. Onboarding: preencha qualquer nome/e-mail/curso/nível/área/título.
2. Marco Zero: responda "Sim" às três perguntas para liberar o Bloco 1
   (ou "Ainda não" para ver as tarefas de correção sendo geradas).
3. Bloco 1: escreva um incômodo, confirme uma pergunta, adicione 1–2
   objetivos específicos completos.
4. Blocos 2–4: siga as sugestões de estrutura e escolhas metodológicas
   guiadas pela Base de Conhecimento.
5. Diagnóstico Final: veja as três prioridades e exporte o relatório.

## Critério de aceite

Este MVP cobre as 20 etapas do critério de aceite (criar pesquisa → Marco
Zero → incômodo → pergunta → objetivo geral → objetivos específicos →
matriz objetivo–método–resultado → sumário provisório → referências e
função de cada uma → conferência bibliográfica → natureza → abordagem →
delineamentos → coleta → análise → matriz metodológica → texto
metodológico gerado → diagnóstico final → três prioridades → persistência
entre sessões), verificado por um roteiro de teste ponta a ponta.
