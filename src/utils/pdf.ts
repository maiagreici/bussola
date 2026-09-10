import { jsPDF } from 'jspdf';
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
 * Gera um PDF real (não apenas texto), client-side, sem depender de nenhum
 * backend. Contém TUDO que o estudante escreveu no app (não só o resumo do
 * Diagnóstico Final) — pensado como o documento que a pessoa efetivamente
 * leva para a orientação ou anexa por e-mail.
 */
export function gerarPdfCompleto(
  p: ResearchProject,
  dimensoes: DimensaoDiagnostico[],
  prioridades: ItemPrioridadeInterno[],
): jsPDF {
  const doc = new jsPDF({ unit: 'pt', format: 'a4' });
  const margemEsquerda = 48;
  const larguraUtil = 595 - margemEsquerda * 2;
  let y = 56;

  function novaPaginaSeNecessario(alturaLinha: number) {
    if (y + alturaLinha > 800) {
      doc.addPage();
      y = 56;
    }
  }

  function escreverParagrafo(texto: string, tamanhoFonte = 11, negrito = false, espacoDepois = 10) {
    doc.setFont('helvetica', negrito ? 'bold' : 'normal');
    doc.setFontSize(tamanhoFonte);
    const linhas = doc.splitTextToSize(texto, larguraUtil) as string[];
    linhas.forEach((linha) => {
      novaPaginaSeNecessario(tamanhoFonte + 4);
      doc.text(linha, margemEsquerda, y);
      y += tamanhoFonte + 4;
    });
    y += espacoDepois;
  }

  function tituloSecao(texto: string) {
    novaPaginaSeNecessario(30);
    y += 6;
    doc.setDrawColor(200);
    doc.line(margemEsquerda, y, margemEsquerda + larguraUtil, y);
    y += 16;
    escreverParagrafo(texto, 15, true, 8);
  }

  function campo(rotulo: string, valor: string | undefined | null, indentar = 0) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10.5);
    novaPaginaSeNecessario(15);
    doc.text(rotulo, margemEsquerda + indentar, y);
    y += 14;
    escreverParagrafo(valor?.trim() ? valor.trim() : NAO_PREENCHIDO, 10.5, false, 8);
  }

  function escreverArvore(nos: NoArvore[], nivel: number) {
    nos.forEach((no) => {
      const indentar = nivel * 16;
      novaPaginaSeNecessario(14);
      doc.setFont('helvetica', nivel === 0 ? 'bold' : 'normal');
      doc.setFontSize(10.5);
      const linhas = doc.splitTextToSize(`${'—'.repeat(nivel === 0 ? 0 : 1)} ${no.titulo || '(sem título)'}`, larguraUtil - indentar) as string[];
      linhas.forEach((linha) => {
        novaPaginaSeNecessario(14);
        doc.text(linha, margemEsquerda + indentar, y);
        y += 14;
      });
      if (no.filhos.length > 0) escreverArvore(no.filhos, nivel + 1);
    });
  }

  // Capa
  escreverParagrafo('Bússola — Relatório completo da pesquisa', 18, true, 4);
  escreverParagrafo(p.tituloProvisorio || 'Título provisório não informado', 14, true, 10);
  escreverParagrafo(
    `Estudante: ${p.perfil.nome} · ${p.perfil.curso} · ${p.perfil.nivel} · ${p.perfil.areaConhecimento}`,
    10,
    false,
    4,
  );
  escreverParagrafo(`Gerado em: ${new Date().toLocaleString('pt-BR')}`, 10, false, 18);

  // Marco Zero
  tituloSecao('Marco Zero');
  campo('Seções obrigatórias com conteúdo mínimo', p.marcoZero.secoesDesenvolvidas === 'sim' ? 'Sim' : 'Ainda não');
  campo('Consigo explicar o eixo/motivação da pesquisa', p.marcoZero.eixoMotivacao === 'sim' ? 'Sim' : 'Ainda não');
  if (p.marcoZero.eixoMotivacaoTexto) campo('O que está incomodando (registrado no Marco Zero)', p.marcoZero.eixoMotivacaoTexto);
  campo('Exigências éticas identificadas', p.marcoZero.etica.status === 'sim' ? 'Sim' : p.marcoZero.etica.status === 'nao_sei' ? 'Não sei' : 'Ainda não');
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
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10.5);
    novaPaginaSeNecessario(15);
    doc.text('Objetivos específicos', margemEsquerda, y);
    y += 16;
    p.arquiteturaPesquisa.objetivosEspecificos.forEach((o, i) => {
      escreverParagrafo(`${i + 1}. ${o.descricao || NAO_PREENCHIDO}`, 10.5, true, 2);
      escreverParagrafo(`Como vou fazer: ${o.comoVouFazer || NAO_PREENCHIDO}`, 10, false, 2);
      escreverParagrafo(`Resultado esperado: ${o.resultadoEsperado || NAO_PREENCHIDO}`, 10, false, 8);
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
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10.5);
    novaPaginaSeNecessario(15);
    doc.text('Sumário provisório', margemEsquerda, y);
    y += 16;
    escreverArvore(at.estruturaProvisoria, 0);
    y += 8;
  }

  // Bloco 3
  tituloSecao('Bloco 3 — Referencial Teórico');
  if (p.referencial.referencias.length === 0) {
    escreverParagrafo(NAO_PREENCHIDO, 10.5, false, 8);
  } else {
    p.referencial.referencias.forEach((r, i) => {
      escreverParagrafo(`${i + 1}. ${r.autor || '(autor não informado)'} (${r.ano || 's.d.'}) — ${r.titulo || '(sem título)'}`, 10.5, true, 2);
      escreverParagrafo(`Ideia central: ${r.ideiaCentral || NAO_PREENCHIDO}`, 10, false, 2);
      escreverParagrafo(`Por que uso: ${r.porQueUso || NAO_PREENCHIDO}`, 10, false, 8);
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
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10.5);
    novaPaginaSeNecessario(15);
    doc.text('Redação metodológica (rascunho gerado a partir das escolhas acima)', margemEsquerda, y);
    y += 16;
    escreverParagrafo(m.textoGerado, 10.5, false, 8);
  }

  // Diagnóstico Final
  tituloSecao('Diagnóstico Final');
  dimensoes.forEach((d) => {
    escreverParagrafo(`[${ROTULO_SEMAFORO[d.estado]}] ${d.nome}`, 11, true, 2);
    escreverParagrafo(d.criterio, 10, false, 10);
  });

  escreverParagrafo(fraseTresCoisasAntesDeEnviar(p.perfil.nivel), 13, true, 8);
  if (prioridades.length === 0) {
    escreverParagrafo('Nenhuma prioridade crítica identificada com os critérios atuais.', 11);
  }
  prioridades.slice(0, 3).forEach((item, i) => {
    escreverParagrafo(`${i + 1}. ${item.titulo}`, 11, true, 2);
    escreverParagrafo(item.explicacao, 10, false, 10);
  });
  if (prioridades.length > 3) {
    escreverParagrafo('Outras melhorias', 12, true, 6);
    prioridades.slice(3).forEach((item) => {
      escreverParagrafo(`• ${item.titulo} — ${item.explicacao}`, 10, false, 6);
    });
  }

  escreverParagrafo(
    'Este relatório é uma autoavaliação estruturada — não substitui a orientação acadêmica formal nem a avaliação de um Comitê de Ética.',
    9,
    false,
    0,
  );

  return doc;
}

export function nomeArquivoPdf(p: ResearchProject): string {
  return `pesquisa-completa-${(p.tituloProvisorio || 'pesquisa').slice(0, 40).replace(/\s+/g, '-')}.pdf`;
}
