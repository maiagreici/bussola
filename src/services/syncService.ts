import type { ResearchProject } from '../types/project';

// Sincronização opcional com o backend próprio (PHP + MySQL hospedado
// junto com o site — ver api/). O localStorage continua sendo a fonte
// principal (o app funciona 100% sem este serviço); isto só espelha o
// projeto no servidor para que o Painel do Professor consiga listá-lo.
// Falha de rede aqui nunca deve interromper o uso do app.

let timeoutId: ReturnType<typeof setTimeout> | null = null;

export function agendarSincronizacao(projeto: ResearchProject, atrasoMs = 1500) {
  if (timeoutId) clearTimeout(timeoutId);
  timeoutId = setTimeout(() => {
    enviarAgora(projeto);
  }, atrasoMs);
}

async function enviarAgora(projeto: ResearchProject) {
  try {
    await fetch('api/save.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(projeto),
    });
  } catch {
    // Sem servidor configurado (ex: rodando localmente) ou sem rede —
    // o progresso continua salvo no navegador normalmente.
  }
}
