// Conferência bibliográfica bidirecional (spec item 23) — versão MVP.
// LIMITAÇÃO CONHECIDA E DELIBERADA: a extração de citações usa um regex
// simples sobre o texto (padrão "Sobrenome, 2020" ou "Sobrenome (2020)").
// Isso é suficiente para um alerta útil, mas não substitui uma leitura
// cuidadosa. Um parser mais robusto (ABNT completo, múltiplos autores,
// "et al.") é o ponto de substituição futura — não remover esta
// funcionalidade da interface, apenas evoluir esta função.
export function extrairCitacoes(texto: string): { sobrenome: string; ano: string }[] {
  const regex = /([A-ZÀ-Ý][a-zà-ÿ'-]+)\s*(?:et al\.?\s*)?[,(]\s*(\d{4})/g;
  const encontrados: { sobrenome: string; ano: string }[] = [];
  let m: RegExpExecArray | null;
  while ((m = regex.exec(texto)) !== null) {
    encontrados.push({ sobrenome: m[1].toLowerCase(), ano: m[2] });
  }
  return encontrados;
}

export interface LinhaReferencia {
  linha: string;
  sobrenome: string;
  ano: string;
}

/**
 * O bloco de referências agora é colado como texto livre (uma referência
 * por linha), não mais em campos estruturados. Reaproveitamos o mesmo
 * reconhecimento de "Sobrenome, 2020" / "Sobrenome (2020)" usado na
 * checagem de citações para extrair um autor/ano aproximado de cada linha.
 */
export function analisarBlocoReferencias(texto: string): LinhaReferencia[] {
  return texto
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean)
    .map((linha) => {
      const citacoes = extrairCitacoes(linha);
      return { linha, sobrenome: citacoes[0]?.sobrenome ?? '', ano: citacoes[0]?.ano ?? '' };
    });
}

export interface ResultadoConferencia {
  citacoesSemReferencia: string[];
  referenciasNaoCitadas: string[];
  possiveisDuplicidades: string[];
  dadosIncompletos: string[];
}

export function conferirBibliografia(textoConferencia: string, textoReferencias: string): ResultadoConferencia {
  const citacoes = extrairCitacoes(textoConferencia);
  const referencias = analisarBlocoReferencias(textoReferencias);

  const citacoesSemReferencia = Array.from(
    new Set(
      citacoes
        .filter((c) => !referencias.some((r) => r.sobrenome === c.sobrenome && r.ano === c.ano))
        .map((c) => `${c.sobrenome} (${c.ano})`),
    ),
  );

  const referenciasNaoCitadas = referencias
    .filter((r) => r.sobrenome && !citacoes.some((c) => c.sobrenome === r.sobrenome && c.ano === r.ano))
    .map((r) => r.linha);

  const vistos = new Map<string, number>();
  referencias.forEach((r) => {
    if (!r.sobrenome || !r.ano) return;
    const k = `${r.sobrenome}|${r.ano}`;
    vistos.set(k, (vistos.get(k) ?? 0) + 1);
  });
  const possiveisDuplicidades = Array.from(vistos.entries())
    .filter(([, n]) => n > 1)
    .map(([k]) => k.replace('|', ' — '));

  const dadosIncompletos = referencias
    .filter((r) => !r.sobrenome || !r.ano)
    .map((r) => `Não conseguimos reconhecer autor/ano nesta linha: "${r.linha}" — confira o formato (ex.: Sobrenome, 2020).`);

  return { citacoesSemReferencia, referenciasNaoCitadas, possiveisDuplicidades, dadosIncompletos };
}
