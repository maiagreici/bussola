import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, BorderStyle } from 'docx';
import type { NoArvore, ResearchProject } from '../types/project';
import type { DimensaoDiagnostico, ItemPrioridadeInterno } from '../rules/diagnostico';
import { fraseTresCoisasAntesDeEnviar } from './linguagemPerfil';
import { buscarItemKB } from '../knowledge';

const ROTULO_SEMAFORO: Record<string, string> = { verde: 'OK', amarelo: 'ATENÇÃO', vermelho: 'RESOLVER' };
const NAO_PREENCHIDO = '(ainda não preenchido)';

function nomesKB(ids: string[]): string {
  if (ids.length === 0) return '';
  return ids.map((id) => buscarItemKB(id)?.nome ?? id).join(', ');
}

/**
 * Gera um .docx real e editável (Microsoft Word / LibreOffice / Google
 * Docs abrem normalmente), client-side, sem depender de nenhum backend.
 * Mesmo conteúdo do "Baixar PDF completo" (ver src/utils/pdf.ts) — tudo
 * que o estudante escreveu, não só o resumo do Diagnóstico Final — mas em
 * formato que o estudante pode continuar editando livremente depois.
 */
export async function gerarDocxCompleto(
  p: ResearchProject,
  dimensoes: DimensaoDiagnostico[],
  prioridades: ItemPrioridadeInterno[],
): Promise<Blob> {
  const paragrafos: Paragraph[] = [];

  function tituloPrincipal(texto: string) {
    paragrafos.push(new Paragraph({ text: texto, heading: HeadingLevel.TITLE, spacing: { after: 100 } }));
  }

  function subtitulo(texto: string) {
    paragrafos.push(new Paragraph({ text: texto, heading: HeadingLevel.HEADING_3, spacing: { after: 200 } }));
  }

  function tituloSecao(texto: string) {
    paragrafos.push(
      new Paragraph({
        text: texto,
        heading: HeadingLevel.HEADING_1,
        spacing: { before: 300, after: 150 },
        border: { bottom: { style: BorderStyle.SINGLE, size: 4, color: 'CCCCCC', space: 4 } },
      }),
    );
  }

  function paragrafoSimples(texto: string, italico = false) {
    paragrafos.push(new Paragraph({ children: [new TextRun({ text: texto, italics: italico })], spacing: { after: 150 } }));
  }

  function campo(rotulo: string, valor: string | undefined | null) {
    paragrafos.push(new Paragraph({ children: [new TextRun({ text: rotulo, bold: true })], spacing: { before: 100, after: 40 } }));
    const preenchido = !!valor?.trim();
    paragrafos.push(
      new Paragraph({
        children: [new TextRun({ text: preenchido ? valor!.trim() : NAO_PREENCHIDO, italics: !preenchido })],
        spacing: { after: 150 },
      }),
    );
  }

  function tituloCampo(texto: string) {
    paragrafos.push(new Paragraph({ children: [new TextRun({ text: texto, bold: true })], spacing: { before: 100, after: 60 } }));
  }

  function itensArvore(nos: NoArvore[], nivel: number) {
    nos.forEach((no) => {
      paragrafos.push(
        new Paragraph({
          children: [new TextRun({ text: no.titulo || '(sem título)', bold: nivel === 0 })],
          indent: { left: nivel * 360 },
          spacing: { after: 40 },
        }),
      );
      if (no.filhos.length > 0) itensArvore(no.filhos, nivel + 1);
    });
  }

  // Capa
  tituloPrincipal('Bússola — Relatório completo da pesquisa');
  subtitulo(p.tituloProvisorio || 'Título provisório não informado');
  paragrafoSimples(`Estudante: ${p.perfil.nome} · ${p.perfil.curso} · ${p.perfil.nivel} · ${p.perfil.areaConhecimento}`);
  paragrafoSimples(`Gerado em: ${new Date().toLocaleString('pt-BR')}`);

  // Marco Zero
  tituloSecao('Marco Zero');
  campo('Seções obrigatórias com conteúdo mínimo', p.marcoZero.secoesDesenvolvidas === 'sim' ? 'Sim' : 'Ainda não');
  campo('Consigo explicar o eixo/motivação da pesquisa', p.marcoZero.eixoMotivacao === 'sim' ? 'Sim' : 'Ainda não');
  if (p.marcoZero.eixoMotivacaoTexto) campo('O que está incomodando (registrado no Marco Zero)', p.marcoZero.eixoMotivacaoTexto);
  campo(
    'Exigências éticas identificadas',
    p.marcoZero.etica.status === 'sim' ? 'Sim' : p.marcoZero.etica.status === 'nao_sei' ? 'Não sei' : 'Ainda não',
  );
  if (p.marcoZero.etica.exigenciasIdentificadas.length > 0) {
    campo('Possíveis exigências éticas marcadas', p.marcoZero.etica.exigenciasIdentificadas.join('; '));
  }

  // Bloco 1
  tituloSecao('Bloco 1 — Arquitetura da Pesquisa');
  campo('O que está incomodando / motivação', p.arquiteturaPesquisa.incomodoTexto);
  campo('Pergunta de pesquisa', p.arquiteturaPesquisa.perguntaPesquisa);
  if (p.arquiteturaPesquisa.necessitaHipotese === 'sim') {
    campo('Hipótese', p.arquiteturaPesquisa.hipotese);
  }
  campo('Objetivo geral', p.arquiteturaPesquisa.objetivoGeral);
  if (p.arquiteturaPesquisa.objetivosEspecificos.length === 0) {
    campo('Objetivos específicos', null);
  } else {
    tituloCampo('Objetivos específicos');
    p.arquiteturaPesquisa.objetivosEspecificos.forEach((o, i) => {
      paragrafos.push(new Paragraph({ children: [new TextRun({ text: `${i + 1}. ${o.descricao || NAO_PREENCHIDO}`, bold: true })], spacing: { after: 20 } }));
      paragrafoSimples(`Como vou fazer: ${o.comoVouFazer || NAO_PREENCHIDO}`);
      paragrafoSimples(`Resultado esperado: ${o.resultadoEsperado || NAO_PREENCHIDO}`);
    });
  }
  campo('Resultados esperados / preliminares (da pesquisa como um todo)', p.arquiteturaPesquisa.resultadosEsperados);

  // Bloco 2
  tituloSecao('Bloco 2 — Arquitetura do Texto');
  const at = p.arquiteturaTexto;
  campo('Proporcionalidade entre seções', at.proporcionalidadeConfirmada === 'sim' ? 'Sim' : 'Ainda não');
  if (at.proporcionalidadeObservacoes) campo('O que está desproporcional', at.proporcionalidadeObservacoes);
  campo('Conteúdo no lugar certo', at.conteudoNoLugarCertoConfirmado === 'sim' ? 'Sim' : 'Ainda não');
  if (at.conteudoNoLugarCertoObservacoes) campo('O que parece fora do lugar', at.conteudoNoLugarCertoObservacoes);
  if (at.estruturaProvisoria.length === 0) {
    campo('Sumário provisório', null);
  } else {
    tituloCampo('Sumário provisório');
    itensArvore(at.estruturaProvisoria, 0);
  }

  // Bloco 3
  tituloSecao('Bloco 3 — Referencial Teórico');
  if (p.referencial.referencias.length === 0) {
    paragrafoSimples(NAO_PREENCHIDO, true);
  } else {
    p.referencial.referencias.forEach((r, i) => {
      paragrafos.push(
        new Paragraph({
          children: [new TextRun({ text: `${i + 1}. ${r.autor || '(autor não informado)'} (${r.ano || 's.d.'}) — ${r.titulo || '(sem título)'}`, bold: true })],
          spacing: { after: 20 },
        }),
      );
      paragrafoSimples(`Ideia central: ${r.ideiaCentral || NAO_PREENCHIDO}`);
      paragrafoSimples(`Por que uso: ${r.porQueUso || NAO_PREENCHIDO}`);
    });
  }

  // Bloco 4
  tituloSecao('Bloco 4 — Metodologia');
  const m = p.metodologia;
  const naturezaNome = m.natureza ? (buscarItemKB(m.natureza)?.nome ?? m.natureza) : null;
  campo('Natureza da pesquisa', naturezaNome);
  if (m.naturezaJustificativa) campo('Por quê', m.naturezaJustificativa);
  const abordagemNome = m.abordagem ? (buscarItemKB(m.abordagem)?.nome ?? m.abordagem) : null;
  campo('Abordagem', abordagemNome);
  if (m.abordagemJustificativa) campo('Por quê', m.abordagemJustificativa);
  const todosDelineamentos = [...m.delineamentos.map((id) => buscarItemKB(id)?.nome ?? id), ...(m.delineamentosCustom ?? [])];
  campo('Delineamento(s)', todosDelineamentos.length > 0 ? todosDelineamentos.join(', ') : null);
  campo('Sujeitos da pesquisa', m.sujeitosPesquisa);
  campo('Técnica(s) de coleta de dados', m.tecnicasColeta.length > 0 ? nomesKB(m.tecnicasColeta) : null);
  campo('Método(s) de análise de dados', m.tecnicasAnalise.length > 0 ? nomesKB(m.tecnicasAnalise) : null);
  if (m.textoGerado) {
    tituloCampo('Redação metodológica (rascunho gerado a partir das escolhas acima)');
    paragrafoSimples(m.textoGerado);
  }

  // Diagnóstico Final
  tituloSecao('Diagnóstico Final');
  dimensoes.forEach((d) => {
    paragrafos.push(new Paragraph({ children: [new TextRun({ text: `[${ROTULO_SEMAFORO[d.estado]}] ${d.nome}`, bold: true })], spacing: { after: 20 } }));
    paragrafoSimples(d.criterio);
  });

  paragrafos.push(
    new Paragraph({ text: fraseTresCoisasAntesDeEnviar(p.perfil.nivel), heading: HeadingLevel.HEADING_2, spacing: { before: 150, after: 100 } }),
  );
  if (prioridades.length === 0) {
    paragrafoSimples('Nenhuma prioridade crítica identificada com os critérios atuais.');
  }
  prioridades.slice(0, 3).forEach((item, i) => {
    paragrafos.push(new Paragraph({ children: [new TextRun({ text: `${i + 1}. ${item.titulo}`, bold: true })], spacing: { after: 20 } }));
    paragrafoSimples(item.explicacao);
  });
  if (prioridades.length > 3) {
    tituloCampo('Outras melhorias');
    prioridades.slice(3).forEach((item) => {
      paragrafoSimples(`• ${item.titulo} — ${item.explicacao}`);
    });
  }

  paragrafos.push(
    new Paragraph({
      children: [
        new TextRun({
          text: 'Este relatório é uma autoavaliação estruturada — não substitui a orientação acadêmica formal nem a avaliação de um Comitê de Ética.',
          italics: true,
          size: 18,
        }),
      ],
      spacing: { before: 200 },
      alignment: AlignmentType.LEFT,
    }),
  );

  const documento = new Document({
    sections: [{ properties: {}, children: paragrafos }],
  });

  return Packer.toBlob(documento);
}

export function nomeArquivoDocx(p: ResearchProject): string {
  return `pesquisa-completa-${(p.tituloProvisorio || 'pesquisa').slice(0, 40).replace(/\s+/g, '-')}.docx`;
}
