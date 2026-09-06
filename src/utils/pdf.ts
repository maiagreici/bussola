import { jsPDF } from 'jspdf';
import type { ResearchProject } from '../types/project';
import type { DimensaoDiagnostico, ItemPrioridadeInterno } from '../rules/diagnostico';

const ROTULO_SEMAFORO: Record<string, string> = { verde: 'OK', amarelo: 'ATENÇÃO', vermelho: 'RESOLVER' };

/**
 * Gera um PDF real (não apenas texto) do Diagnóstico Final, client-side,
 * sem depender de nenhum backend. Isso é o que o botão "Baixar PDF" entrega
 * ao estudante — cada viewer gera o próprio arquivo localmente.
 */
export function gerarPdfDiagnostico(
  p: ResearchProject,
  dimensoes: DimensaoDiagnostico[],
  prioridades: ItemPrioridadeInterno[],
): jsPDF {
  const doc = new jsPDF({ unit: 'pt', format: 'a4' });
  const margemEsquerda = 48;
  const larguraUtil = 595 - margemEsquerda * 2;
  let y = 56;

  function quebrarLinha(texto: string, tamanhoFonte: number) {
    doc.setFontSize(tamanhoFonte);
    return doc.splitTextToSize(texto, larguraUtil) as string[];
  }

  function escreverParagrafo(texto: string, tamanhoFonte = 11, negrito = false, espacoDepois = 14) {
    doc.setFont('helvetica', negrito ? 'bold' : 'normal');
    const linhas = quebrarLinha(texto, tamanhoFonte);
    linhas.forEach((linha) => {
      if (y > 780) {
        doc.addPage();
        y = 56;
      }
      doc.text(linha, margemEsquerda, y);
      y += tamanhoFonte + 4;
    });
    y += espacoDepois;
  }

  escreverParagrafo('Diagnóstico de Maturidade da Pesquisa — Bússola', 18, true, 4);
  escreverParagrafo(p.tituloProvisorio || 'Título provisório não informado', 13, false, 10);
  escreverParagrafo(`Estudante: ${p.perfil.nome} · ${p.perfil.curso} (${p.perfil.nivel})`, 10, false, 4);
  escreverParagrafo(`Gerado em: ${new Date().toLocaleString('pt-BR')}`, 10, false, 18);

  escreverParagrafo('Dimensões avaliadas', 14, true, 8);
  dimensoes.forEach((d) => {
    escreverParagrafo(`[${ROTULO_SEMAFORO[d.estado]}] ${d.nome}`, 11, true, 2);
    escreverParagrafo(d.criterio, 10, false, 10);
  });

  escreverParagrafo('As três coisas que eu faria antes de enviar ao orientador', 14, true, 8);
  if (prioridades.length === 0) {
    escreverParagrafo('Nenhuma prioridade crítica identificada com os critérios atuais.', 11);
  }
  prioridades.slice(0, 3).forEach((item, i) => {
    escreverParagrafo(`${i + 1}. ${item.titulo}`, 11, true, 2);
    escreverParagrafo(item.explicacao, 10, false, 10);
  });

  if (prioridades.length > 3) {
    escreverParagrafo('Outras melhorias', 13, true, 6);
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
  return `diagnostico-${(p.tituloProvisorio || 'pesquisa').slice(0, 40).replace(/\s+/g, '-')}.pdf`;
}
