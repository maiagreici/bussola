import type { Referencia } from '../types/project';

// Conferência bibliográfica bidirecional (spec item 23) — versão MVP.
// LIMITAÇÃO CONHECIDA E DELIBERADA: a extração de citações usa um regex
// simples sobre o texto colado pelo usuário (padrão "Sobrenome, 2020" ou
// "Sobrenome (2020)"). Isso é suficiente para um alerta útil, mas não
// substitui uma leitura cuidadosa. Um parser mais robusto (ABNT completo,
// múltiplos autores, "et al.") é o ponto de substituição futura — não
// remover esta funcionalidade da interface, apenas evoluir esta função.
export function extrairCitacoes(texto: string): { sobrenome: string; ano: string }[] {
  const regex = /([A-ZÀ-Ý][a-zà-ÿ'-]+)\s*(?:et al\.?\s*)?[,(]\s*(\d{4})/g;
  const encontrados: { sobrenome: string; ano: string }[] = [];
  let m: RegExpExecArray | null;
  while ((m = regex.exec(texto)) !== null) {
    encontrados.push({ sobrenome: m[1].toLowerCase(), ano: m[2] });
  }
  return encontrados;
}

export interface ResultadoConferencia {
  citacoesSemReferencia: string[];
  referenciasNaoCitadas: string[];
  possiveisDuplicidades: string[];
  dadosIncompletos: string[];
}

export function conferirBibliografia(texto: string, referencias: Referencia[]): ResultadoConferencia {
  const citacoes = extrairCitacoes(texto);
  const chaveRef = (r: Referencia) => `${(r.autor.split(/[,;]/)[0] || r.autor).trim().toLowerCase()}|${r.ano}`;

  const citacoesSemReferencia = Array.from(
    new Set(
      citacoes
        .filter((c) => !referencias.some((r) => r.autor.toLowerCase().includes(c.sobrenome) && r.ano === c.ano))
        .map((c) => `${c.sobrenome} (${c.ano})`),
    ),
  );

  const referenciasNaoCitadas = referencias
    .filter((r) => !citacoes.some((c) => r.autor.toLowerCase().includes(c.sobrenome) && r.ano === c.ano))
    .map((r) => `${r.autor} (${r.ano}) — ${r.titulo || 'sem título informado'}`);

  const vistos = new Map<string, number>();
  referencias.forEach((r) => {
    const k = chaveRef(r);
    vistos.set(k, (vistos.get(k) ?? 0) + 1);
  });
  const possiveisDuplicidades = Array.from(vistos.entries())
    .filter(([, n]) => n > 1)
    .map(([k]) => k.replace('|', ' — '));

  const dadosIncompletos = referencias
    .filter((r) => !r.autor.trim() || !r.ano.trim() || !r.titulo.trim())
    .map((r) => `Referência com dados ausentes: "${r.titulo || r.autor || 'sem identificação'}" — informação ausente, precisa de verificação.`);

  return { citacoesSemReferencia, referenciasNaoCitadas, possiveisDuplicidades, dadosIncompletos };
}
