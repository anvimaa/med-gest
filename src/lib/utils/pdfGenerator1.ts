// pnpm add -D @lucide/svelte jspdf jspdf-autotable @types/jspdf

import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

// Tipos
interface ResumoData {
  totalMedicamentos: number;
  totalFornecedores: number;
  totalLotes: number;
  estoqueTotal: number;
  totalEntradas: number;
  totalSaidas: number;
  totalEliminacoes: number;
  countEntradas: number;
  countSaidas: number;
  countEliminacoes: number;
}

interface LoteComRelacoes {
  id: string;
  numeroLote: string;
  quantidadeAtual: number;
  quantidadeInicial: number;
  dataValidade: Date | string;
  dataFabricacao?: Date | string;
  dataEntrada?: Date | string;
  medicamento: { nome: string; principioAtivo?: string | null };
  fornecedor: { nome: string };
}

interface MedicamentoComLotes {
  id: string;
  nome: string;
  principioAtivo?: string | null;
  formaFarmaceutica?: string | null;
  concentracao?: string | null;
  fabricante?: string | null;
  lotes: {
    id: string;
    numeroLote: string;
    quantidadeAtual: number;
    quantidadeInicial: number;
    dataValidade: Date | string;
    fornecedor: { nome: string };
  }[];
}

interface FornecedorComLotes {
  id: string;
  nome: string;
  nif?: string | null;
  telefone?: string | null;
  email?: string | null;
  lotes: {
    quantidadeAtual: number;
    quantidadeInicial: number;
    medicamento: { nome: string };
  }[];
}

interface Movimentacao {
  id: string;
  tipoMovimentacao: string;
  quantidade: number;
  dataMovimentacao: Date | string;
  lote: {
    numeroLote: string;
    medicamento: { nome: string };
  };
  user: { name?: string | null; email: string };
}

interface Eliminacao {
  id: string;
  quantidade: number;
  motivo: string;
  dataEliminacao: Date | string;
  lote: {
    numeroLote: string;
    medicamento: { nome: string };
  };
  user: { name?: string | null; email: string };
}

interface RelatorioData {
  resumo: ResumoData;
  estoqueBaixo: LoteComRelacoes[];
  lotesVencidos: LoteComRelacoes[];
  lotesProximosVencimento: LoteComRelacoes[];
  movimentacoes: Movimentacao[];
  eliminacoes: Eliminacao[];
  estoquePorMedicamento: MedicamentoComLotes[];
  estoquePorFornecedor: FornecedorComLotes[];
  filtros: {
    dataInicio: string;
    dataFim: string;
    tipoRelatorio: string;
    medicamentoId: string;
    fornecedorId: string;
  };
}

// Cores do tema
const COLORS = {
  primary: [79, 70, 229] as [number, number, number], // Indigo-600
  primaryLight: [238, 242, 255] as [number, number, number], // Indigo-50
  success: [22, 163, 74] as [number, number, number], // Green-600
  successLight: [220, 252, 231] as [number, number, number], // Green-100
  warning: [234, 88, 12] as [number, number, number], // Orange-600
  warningLight: [255, 237, 213] as [number, number, number], // Orange-100
  danger: [220, 38, 38] as [number, number, number], // Red-600
  dangerLight: [254, 226, 226] as [number, number, number], // Red-100
  gray: [107, 114, 128] as [number, number, number], // Gray-500
  grayLight: [249, 250, 251] as [number, number, number], // Gray-50
  dark: [17, 24, 39] as [number, number, number], // Gray-900
  white: [255, 255, 255] as [number, number, number],
};

// Funções utilitárias
function formatarData(date: Date | string): string {
  return new Date(date).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function formatarDataHora(date: Date | string): string {
  return new Date(date).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function diasParaVencer(dataValidade: Date | string): number {
  const hoje = new Date();
  const validade = new Date(dataValidade);
  const diff = validade.getTime() - hoje.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

// Classe principal do gerador de PDF
export class PDFGenerator {
  private doc: jsPDF;
  private pageWidth: number;
  private pageHeight: number;
  private margin: number;
  private contentWidth: number;
  private currentY: number;
  private pageNumber: number;
  private totalPages: number;
  private nomeEmpresa: string;
  private logoBase64?: string;

  constructor(options?: { nomeEmpresa?: string; logoBase64?: string }) {
    this.doc = new jsPDF("p", "mm", "a4");
    this.pageWidth = this.doc.internal.pageSize.getWidth();
    this.pageHeight = this.doc.internal.pageSize.getHeight();
    this.margin = 15;
    this.contentWidth = this.pageWidth - 2 * this.margin;
    this.currentY = this.margin;
    this.pageNumber = 1;
    this.totalPages = 1;
    this.nomeEmpresa = options?.nomeEmpresa || "Sistema de Gestão de Estoque";
    this.logoBase64 = options?.logoBase64;
  }

  // ============================================
  // CABEÇALHO E RODAPÉ
  // ============================================
  private addHeader(titulo: string, subtitulo?: string): void {
    // Fundo do cabeçalho
    this.doc.setFillColor(...COLORS.primary);
    this.doc.rect(0, 0, this.pageWidth, 35, "F");

    // Logo ou ícone (se disponível)
    if (this.logoBase64) {
      try {
        this.doc.addImage(this.logoBase64, "PNG", this.margin, 8, 20, 20);
      } catch {
        // Se falhar, continua sem logo
      }
    }

    // Título da empresa
    this.doc.setTextColor(...COLORS.white);
    this.doc.setFontSize(18);
    this.doc.setFont("helvetica", "bold");
    this.doc.text(
      this.nomeEmpresa,
      this.logoBase64 ? this.margin + 25 : this.margin,
      15,
    );

    // Título do relatório
    this.doc.setFontSize(12);
    this.doc.setFont("helvetica", "normal");
    this.doc.text(titulo, this.logoBase64 ? this.margin + 25 : this.margin, 22);

    // Subtítulo (período, filtros, etc.)
    if (subtitulo) {
      this.doc.setFontSize(9);
      this.doc.text(
        subtitulo,
        this.logoBase64 ? this.margin + 25 : this.margin,
        28,
      );
    }

    // Data de geração (canto direito)
    this.doc.setFontSize(8);
    this.doc.text(
      `Gerado em: ${formatarDataHora(new Date())}`,
      this.pageWidth - this.margin,
      28,
      { align: "right" },
    );

    this.currentY = 45;
  }

  private addFooter(): void {
    const footerY = this.pageHeight - 10;

    // Linha separadora
    this.doc.setDrawColor(...COLORS.gray);
    this.doc.setLineWidth(0.3);
    this.doc.line(
      this.margin,
      footerY - 5,
      this.pageWidth - this.margin,
      footerY - 5,
    );

    // Texto do rodapé
    this.doc.setTextColor(...COLORS.gray);
    this.doc.setFontSize(8);
    this.doc.setFont("helvetica", "normal");

    this.doc.text(this.nomeEmpresa, this.margin, footerY);
    this.doc.text(`Página ${this.pageNumber}`, this.pageWidth / 2, footerY, {
      align: "center",
    });
    this.doc.text(
      "Documento gerado automaticamente",
      this.pageWidth - this.margin,
      footerY,
      { align: "right" },
    );
  }

  private checkPageBreak(requiredSpace: number = 30): void {
    if (this.currentY + requiredSpace > this.pageHeight - 20) {
      this.addFooter();
      this.doc.addPage();
      this.pageNumber++;
      this.currentY = 20;
    }
  }

  // ============================================
  // COMPONENTES REUTILIZÁVEIS
  // ============================================
  private addSectionTitle(title: string, icon?: string): void {
    this.checkPageBreak(20);

    // Fundo da se��ão
    this.doc.setFillColor(...COLORS.primaryLight);
    this.doc.roundedRect(
      this.margin,
      this.currentY,
      this.contentWidth,
      10,
      2,
      2,
      "F",
    );

    // Texto
    this.doc.setTextColor(...COLORS.primary);
    this.doc.setFontSize(12);
    this.doc.setFont("helvetica", "bold");
    this.doc.text(
      `${icon || "▸"} ${title}`,
      this.margin + 4,
      this.currentY + 7,
    );

    this.currentY += 15;
  }

  private addSubsectionTitle(title: string): void {
    this.checkPageBreak(15);

    this.doc.setTextColor(...COLORS.dark);
    this.doc.setFontSize(10);
    this.doc.setFont("helvetica", "bold");
    this.doc.text(title, this.margin, this.currentY);

    this.currentY += 7;
  }

  private addInfoCard(
    label: string,
    value: string | number,
    x: number,
    y: number,
    width: number,
    color: [number, number, number] = COLORS.primary,
  ): void {
    // Borda colorida à esquerda
    this.doc.setFillColor(...color);
    this.doc.rect(x, y, 3, 18, "F");

    // Fundo do card
    this.doc.setFillColor(...COLORS.grayLight);
    this.doc.rect(x + 3, y, width - 3, 18, "F");

    // Label
    this.doc.setTextColor(...COLORS.gray);
    this.doc.setFontSize(8);
    this.doc.setFont("helvetica", "normal");
    this.doc.text(label, x + 6, y + 6);

    // Valor
    this.doc.setTextColor(...COLORS.dark);
    this.doc.setFontSize(14);
    this.doc.setFont("helvetica", "bold");
    this.doc.text(String(value), x + 6, y + 14);
  }

  private addAlertBox(
    message: string,
    type: "success" | "warning" | "danger" | "info" = "info",
  ): void {
    this.checkPageBreak(15);

    const colors = {
      success: { bg: COLORS.successLight, text: COLORS.success },
      warning: { bg: COLORS.warningLight, text: COLORS.warning },
      danger: { bg: COLORS.dangerLight, text: COLORS.danger },
      info: { bg: COLORS.primaryLight, text: COLORS.primary },
    };

    const { bg, text } = colors[type];

    this.doc.setFillColor(...bg);
    this.doc.roundedRect(
      this.margin,
      this.currentY,
      this.contentWidth,
      10,
      2,
      2,
      "F",
    );

    this.doc.setTextColor(...text);
    this.doc.setFontSize(9);
    this.doc.setFont("helvetica", "bold");
    this.doc.text(message, this.margin + 4, this.currentY + 6.5);

    this.currentY += 14;
  }

  // ============================================
  // RELATÓRIO GERAL/RESUMO
  // ============================================
  private addResumoGeral(data: RelatorioData): void {
    this.addSectionTitle("Resumo Geral", "📊");

    const cardWidth = (this.contentWidth - 15) / 4;
    const startX = this.margin;

    // Primeira linha de cards
    this.addInfoCard(
      "Medicamentos",
      data.resumo.totalMedicamentos,
      startX,
      this.currentY,
      cardWidth,
      COLORS.primary,
    );
    this.addInfoCard(
      "Estoque Total",
      data.resumo.estoqueTotal.toLocaleString("pt-BR"),
      startX + cardWidth + 5,
      this.currentY,
      cardWidth,
      COLORS.success,
    );
    this.addInfoCard(
      "Fornecedores",
      data.resumo.totalFornecedores,
      startX + (cardWidth + 5) * 2,
      this.currentY,
      cardWidth,
      COLORS.warning,
    );
    this.addInfoCard(
      "Total Lotes",
      data.resumo.totalLotes,
      startX + (cardWidth + 5) * 3,
      this.currentY,
      cardWidth,
      COLORS.gray,
    );

    this.currentY += 25;

    // Segunda linha - movimentações
    const cardWidth3 = (this.contentWidth - 10) / 3;

    this.addInfoCard(
      `Entradas (${data.resumo.countEntradas} mov.)`,
      `+${data.resumo.totalEntradas.toLocaleString("pt-BR")}`,
      startX,
      this.currentY,
      cardWidth3,
      COLORS.success,
    );
    this.addInfoCard(
      `Saídas (${data.resumo.countSaidas} mov.)`,
      `-${data.resumo.totalSaidas.toLocaleString("pt-BR")}`,
      startX + cardWidth3 + 5,
      this.currentY,
      cardWidth3,
      COLORS.warning,
    );
    this.addInfoCard(
      `Eliminações (${data.resumo.countEliminacoes})`,
      `-${data.resumo.totalEliminacoes.toLocaleString("pt-BR")}`,
      startX + (cardWidth3 + 5) * 2,
      this.currentY,
      cardWidth3,
      COLORS.danger,
    );

    this.currentY += 25;

    // Alertas
    const totalAlertas =
      data.lotesVencidos.length +
      data.lotesProximosVencimento.length +
      data.estoqueBaixo.length;

    if (totalAlertas > 0) {
      this.addAlertBox(
        `⚠ ${totalAlertas} alerta(s): ${data.lotesVencidos.length} vencido(s), ${data.lotesProximosVencimento.length} próximo(s) do vencimento, ${data.estoqueBaixo.length} com estoque baixo`,
        "danger",
      );
    } else {
      this.addAlertBox("✓ Nenhum alerta ativo no momento", "success");
    }
  }

  // ============================================
  // ESTOQUE POR MEDICAMENTO
  // ============================================
  private addEstoquePorMedicamento(data: MedicamentoComLotes[]): void {
    this.addSectionTitle("Estoque por Medicamento", "💊");

    data.forEach((med, index) => {
      this.checkPageBreak(40);

      const totalEstoque = med.lotes.reduce(
        (acc, l) => acc + l.quantidadeAtual,
        0,
      );
      const totalInicial = med.lotes.reduce(
        (acc, l) => acc + l.quantidadeInicial,
        0,
      );

      // Cabeçalho do medicamento
      this.doc.setFillColor(...COLORS.grayLight);
      this.doc.roundedRect(
        this.margin,
        this.currentY,
        this.contentWidth,
        12,
        2,
        2,
        "F",
      );

      this.doc.setTextColor(...COLORS.dark);
      this.doc.setFontSize(10);
      this.doc.setFont("helvetica", "bold");
      this.doc.text(
        `${index + 1}. ${med.nome}`,
        this.margin + 4,
        this.currentY + 5,
      );

      // Informações adicionais
      const infoText = [
        med.principioAtivo,
        med.formaFarmaceutica,
        med.concentracao,
      ]
        .filter(Boolean)
        .join(" | ");

      if (infoText) {
        this.doc.setFontSize(8);
        this.doc.setFont("helvetica", "normal");
        this.doc.setTextColor(...COLORS.gray);
        this.doc.text(infoText, this.margin + 4, this.currentY + 10);
      }

      // Estoque total (lado direito)
      const estoqueColor =
        totalEstoque === 0
          ? COLORS.danger
          : totalEstoque <= 10
            ? COLORS.warning
            : COLORS.success;
      this.doc.setTextColor(...estoqueColor);
      this.doc.setFontSize(11);
      this.doc.setFont("helvetica", "bold");
      this.doc.text(
        `Estoque: ${totalEstoque.toLocaleString("pt-BR")}`,
        this.pageWidth - this.margin - 4,
        this.currentY + 7,
        { align: "right" },
      );

      this.currentY += 16;

      // Tabela de lotes
      if (med.lotes.length > 0) {
        const tableData = med.lotes.map((lote) => {
          const dias = diasParaVencer(lote.dataValidade);
          let status = "Válido";
          if (lote.quantidadeAtual === 0) status = "Esgotado";
          else if (dias < 0) status = "Vencido";
          else if (dias <= 30) status = `${dias}d`;

          return [
            lote.numeroLote,
            lote.fornecedor.nome,
            lote.quantidadeInicial.toString(),
            lote.quantidadeAtual.toString(),
            formatarData(lote.dataValidade),
            status,
          ];
        });

        autoTable(this.doc, {
          startY: this.currentY,
          head: [
            [
              "Lote",
              "Fornecedor",
              "Qtd. Inicial",
              "Qtd. Atual",
              "Validade",
              "Status",
            ],
          ],
          body: tableData,
          margin: { left: this.margin, right: this.margin },
          styles: {
            fontSize: 8,
            cellPadding: 2,
          },
          headStyles: {
            fillColor: COLORS.primary,
            textColor: COLORS.white,
            fontStyle: "bold",
          },
          alternateRowStyles: {
            fillColor: COLORS.grayLight,
          },
          columnStyles: {
            0: { fontStyle: "bold", cellWidth: 25 },
            2: { halign: "center", cellWidth: 20 },
            3: { halign: "center", cellWidth: 20, fontStyle: "bold" },
            4: { halign: "center", cellWidth: 22 },
            5: { halign: "center", cellWidth: 18 },
          },
          didParseCell: (data: any) => {
            // Colorir coluna de status
            if (data.section === "body" && data.column.index === 5) {
              const status = data.cell.raw as string;
              if (status === "Vencido" || status === "Esgotado") {
                data.cell.styles.textColor = COLORS.danger;
                data.cell.styles.fontStyle = "bold";
              } else if (status.includes("d")) {
                data.cell.styles.textColor = COLORS.warning;
                data.cell.styles.fontStyle = "bold";
              } else {
                data.cell.styles.textColor = COLORS.success;
              }
            }
            // Colorir quantidade atual
            if (data.section === "body" && data.column.index === 3) {
              const qtd = parseInt(data.cell.raw as string);
              if (qtd === 0) {
                data.cell.styles.textColor = COLORS.danger;
              } else if (qtd <= 10) {
                data.cell.styles.textColor = COLORS.warning;
              }
            }
          },
        });

        this.currentY = (this.doc as any).lastAutoTable.finalY + 8;
      } else {
        this.doc.setTextColor(...COLORS.gray);
        this.doc.setFontSize(8);
        this.doc.text("Nenhum lote registrado", this.margin + 4, this.currentY);
        this.currentY += 8;
      }
    });
  }

  // ============================================
  // MOVIMENTAÇÕES
  // ============================================
  private addMovimentacoes(data: Movimentacao[], resumo: ResumoData): void {
    this.addSectionTitle("Movimentações", "🔄");

    // Resumo rápido
    this.doc.setFontSize(9);
    this.doc.setFont("helvetica", "normal");
    this.doc.setTextColor(...COLORS.success);
    this.doc.text(
      `▲ Entradas: ${resumo.totalEntradas.toLocaleString("pt-BR")} unidades (${resumo.countEntradas} movimentações)`,
      this.margin,
      this.currentY,
    );

    this.doc.setTextColor(...COLORS.warning);
    this.doc.text(
      `▼ Saídas: ${resumo.totalSaidas.toLocaleString("pt-BR")} unidades (${resumo.countSaidas} movimentações)`,
      this.margin + 90,
      this.currentY,
    );

    this.currentY += 8;

    if (data.length > 0) {
      const tableData = data.map((mov) => [
        formatarDataHora(mov.dataMovimentacao),
        mov.tipoMovimentacao === "ENTRADA" ? "▲ Entrada" : "▼ Saída",
        mov.lote.medicamento.nome,
        mov.lote.numeroLote,
        `${mov.tipoMovimentacao === "ENTRADA" ? "+" : "-"}${mov.quantidade}`,
        mov.user.name || mov.user.email,
      ]);

      autoTable(this.doc, {
        startY: this.currentY,
        head: [
          ["Data/Hora", "Tipo", "Medicamento", "Lote", "Qtd.", "Responsável"],
        ],
        body: tableData,
        margin: { left: this.margin, right: this.margin },
        styles: {
          fontSize: 8,
          cellPadding: 2,
        },
        headStyles: {
          fillColor: COLORS.primary,
          textColor: COLORS.white,
          fontStyle: "bold",
        },
        alternateRowStyles: {
          fillColor: COLORS.grayLight,
        },
        columnStyles: {
          0: { cellWidth: 32 },
          1: { cellWidth: 20 },
          4: { halign: "center", fontStyle: "bold", cellWidth: 15 },
        },
        didParseCell: (data: any) => {
          if (data.section === "body" && data.column.index === 1) {
            const tipo = data.cell.raw as string;
            if (tipo.includes("Entrada")) {
              data.cell.styles.textColor = COLORS.success;
              data.cell.styles.fontStyle = "bold";
            } else {
              data.cell.styles.textColor = COLORS.warning;
              data.cell.styles.fontStyle = "bold";
            }
          }
          if (data.section === "body" && data.column.index === 4) {
            const qtd = data.cell.raw as string;
            if (qtd.startsWith("+")) {
              data.cell.styles.textColor = COLORS.success;
            } else {
              data.cell.styles.textColor = COLORS.warning;
            }
          }
        },
      });

      this.currentY = (this.doc as any).lastAutoTable.finalY + 8;
    } else {
      this.addAlertBox("Nenhuma movimentação encontrada no período", "info");
    }
  }

  // ============================================
  // ELIMINAÇÕES
  // ============================================
  private addEliminacoes(data: Eliminacao[], resumo: ResumoData): void {
    this.addSectionTitle("Eliminações", "🗑️");

    // Resumo
    this.addAlertBox(
      `Total eliminado: ${resumo.totalEliminacoes.toLocaleString("pt-BR")} unidades em ${resumo.countEliminacoes} registro(s)`,
      "danger",
    );

    if (data.length > 0) {
      const tableData = data.map((elim) => [
        formatarDataHora(elim.dataEliminacao),
        elim.lote.medicamento.nome,
        elim.lote.numeroLote,
        `-${elim.quantidade}`,
        elim.motivo,
        elim.user.name || elim.user.email,
      ]);

      autoTable(this.doc, {
        startY: this.currentY,
        head: [
          ["Data/Hora", "Medicamento", "Lote", "Qtd.", "Motivo", "Responsável"],
        ],
        body: tableData,
        margin: { left: this.margin, right: this.margin },
        styles: {
          fontSize: 8,
          cellPadding: 2,
        },
        headStyles: {
          fillColor: COLORS.danger,
          textColor: COLORS.white,
          fontStyle: "bold",
        },
        alternateRowStyles: {
          fillColor: COLORS.dangerLight,
        },
        columnStyles: {
          0: { cellWidth: 32 },
          3: {
            halign: "center",
            fontStyle: "bold",
            textColor: COLORS.danger,
            cellWidth: 15,
          },
          4: { cellWidth: 40 },
        },
      });

      this.currentY = (this.doc as any).lastAutoTable.finalY + 8;
    } else {
      this.addAlertBox("✓ Nenhuma eliminação registrada no período", "success");
    }
  }

  // ============================================
  // ALERTAS
  // ============================================
  private addAlertas(data: RelatorioData): void {
    this.addSectionTitle("Painel de Alertas", "⚠️");

    // Lotes Vencidos
    this.addSubsectionTitle(`🔴 Lotes Vencidos (${data.lotesVencidos.length})`);

    if (data.lotesVencidos.length > 0) {
      const tableData = data.lotesVencidos.map((lote) => {
        const dias = Math.abs(diasParaVencer(lote.dataValidade));
        return [
          lote.medicamento.nome,
          lote.numeroLote,
          lote.fornecedor.nome,
          lote.quantidadeAtual.toString(),
          formatarData(lote.dataValidade),
          `${dias} dia(s)`,
        ];
      });

      autoTable(this.doc, {
        startY: this.currentY,
        head: [
          [
            "Medicamento",
            "Lote",
            "Fornecedor",
            "Qtd.",
            "Venceu em",
            "Dias Vencido",
          ],
        ],
        body: tableData,
        margin: { left: this.margin, right: this.margin },
        styles: { fontSize: 8, cellPadding: 2 },
        headStyles: {
          fillColor: COLORS.danger,
          textColor: COLORS.white,
          fontStyle: "bold",
        },
        alternateRowStyles: { fillColor: COLORS.dangerLight },
        columnStyles: {
          3: { halign: "center", fontStyle: "bold" },
          4: { halign: "center" },
          5: { halign: "center", fontStyle: "bold", textColor: COLORS.danger },
        },
      });

      this.currentY = (this.doc as any).lastAutoTable.finalY + 10;
    } else {
      this.addAlertBox("✓ Nenhum lote vencido com estoque", "success");
    }

    // Próximos do Vencimento
    this.checkPageBreak(30);
    this.addSubsectionTitle(
      `🟡 Próximos do Vencimento - 30 dias (${data.lotesProximosVencimento.length})`,
    );

    if (data.lotesProximosVencimento.length > 0) {
      const tableData = data.lotesProximosVencimento.map((lote) => {
        const dias = diasParaVencer(lote.dataValidade);
        return [
          lote.medicamento.nome,
          lote.numeroLote,
          lote.fornecedor.nome,
          lote.quantidadeAtual.toString(),
          formatarData(lote.dataValidade),
          `${dias} dia(s)`,
        ];
      });

      autoTable(this.doc, {
        startY: this.currentY,
        head: [
          [
            "Medicamento",
            "Lote",
            "Fornecedor",
            "Qtd.",
            "Validade",
            "Dias Restantes",
          ],
        ],
        body: tableData,
        margin: { left: this.margin, right: this.margin },
        styles: { fontSize: 8, cellPadding: 2 },
        headStyles: {
          fillColor: COLORS.warning,
          textColor: COLORS.white,
          fontStyle: "bold",
        },
        alternateRowStyles: { fillColor: COLORS.warningLight },
        columnStyles: {
          3: { halign: "center", fontStyle: "bold" },
          4: { halign: "center" },
          5: { halign: "center", fontStyle: "bold" },
        },
        didParseCell: (data: any) => {
          if (data.section === "body" && data.column.index === 5) {
            const dias = parseInt((data.cell.raw as string).split(" ")[0]);
            if (dias <= 7) {
              data.cell.styles.textColor = COLORS.danger;
            } else if (dias <= 15) {
              data.cell.styles.textColor = COLORS.warning;
            }
          }
        },
      });

      this.currentY = (this.doc as any).lastAutoTable.finalY + 10;
    } else {
      this.addAlertBox("✓ Nenhum lote próximo do vencimento", "success");
    }

    // Estoque Baixo
    this.checkPageBreak(30);
    this.addSubsectionTitle(
      `🟠 Estoque Baixo - ≤10 unidades (${data.estoqueBaixo.length})`,
    );

    if (data.estoqueBaixo.length > 0) {
      const tableData = data.estoqueBaixo.map((lote) => {
        const consumo = lote.quantidadeInicial - lote.quantidadeAtual;
        const percentual = Math.round((consumo / lote.quantidadeInicial) * 100);
        return [
          lote.medicamento.nome,
          lote.numeroLote,
          lote.fornecedor.nome,
          lote.quantidadeInicial.toString(),
          lote.quantidadeAtual.toString(),
          `${percentual}%`,
        ];
      });

      autoTable(this.doc, {
        startY: this.currentY,
        head: [
          [
            "Medicamento",
            "Lote",
            "Fornecedor",
            "Qtd. Inicial",
            "Qtd. Atual",
            "Consumo",
          ],
        ],
        body: tableData,
        margin: { left: this.margin, right: this.margin },
        styles: { fontSize: 8, cellPadding: 2 },
        headStyles: {
          fillColor: [234, 179, 8], // Yellow-500
          textColor: COLORS.dark,
          fontStyle: "bold",
        },
        alternateRowStyles: { fillColor: [254, 249, 195] }, // Yellow-100
        columnStyles: {
          3: { halign: "center" },
          4: { halign: "center", fontStyle: "bold", textColor: COLORS.warning },
          5: { halign: "center", fontStyle: "bold" },
        },
      });

      this.currentY = (this.doc as any).lastAutoTable.finalY + 8;
    } else {
      this.addAlertBox("✓ Todos os lotes com estoque adequado", "success");
    }
  }

  // ============================================
  // FORNECEDORES
  // ============================================
  private addFornecedores(data: FornecedorComLotes[]): void {
    this.addSectionTitle("Relatório por Fornecedor", "🏭");

    data.forEach((forn, index) => {
      this.checkPageBreak(35);

      const totalInicial = forn.lotes.reduce(
        (a, l) => a + l.quantidadeInicial,
        0,
      );
      const totalAtual = forn.lotes.reduce((a, l) => a + l.quantidadeAtual, 0);
      const percentualConsumo =
        totalInicial > 0
          ? Math.round(((totalInicial - totalAtual) / totalInicial) * 100)
          : 0;
      const medicamentosUnicos = [
        ...new Set(forn.lotes.map((l) => l.medicamento.nome)),
      ];

      // Cabeçalho do fornecedor
      this.doc.setFillColor(...COLORS.primaryLight);
      this.doc.roundedRect(
        this.margin,
        this.currentY,
        this.contentWidth,
        22,
        2,
        2,
        "F",
      );

      // Nome
      this.doc.setTextColor(...COLORS.dark);
      this.doc.setFontSize(11);
      this.doc.setFont("helvetica", "bold");
      this.doc.text(
        `${index + 1}. ${forn.nome}`,
        this.margin + 4,
        this.currentY + 6,
      );

      // Estatísticas
      this.doc.setFontSize(8);
      this.doc.setFont("helvetica", "normal");
      this.doc.setTextColor(...COLORS.gray);
      this.doc.text(
        `${forn.lotes.length} lote(s) | Inicial: ${totalInicial.toLocaleString("pt-BR")} | Atual: ${totalAtual.toLocaleString("pt-BR")} | Consumo: ${percentualConsumo}%`,
        this.margin + 4,
        this.currentY + 12,
      );

      // Medicamentos
      if (medicamentosUnicos.length > 0) {
        this.doc.setTextColor(...COLORS.primary);
        this.doc.text(
          `Medicamentos: ${medicamentosUnicos.join(", ")}`,
          this.margin + 4,
          this.currentY + 18,
        );
      }

      // Estoque atual (lado direito)
      this.doc.setTextColor(...COLORS.primary);
      this.doc.setFontSize(14);
      this.doc.setFont("helvetica", "bold");
      this.doc.text(
        totalAtual.toLocaleString("pt-BR"),
        this.pageWidth - this.margin - 4,
        this.currentY + 10,
        { align: "right" },
      );
      this.doc.setFontSize(7);
      this.doc.setFont("helvetica", "normal");
      this.doc.text(
        "em estoque",
        this.pageWidth - this.margin - 4,
        this.currentY + 15,
        { align: "right" },
      );

      this.currentY += 28;
    });

    if (data.length === 0) {
      this.addAlertBox("Nenhum fornecedor encontrado", "info");
    }
  }

  // ============================================
  // MÉTODOS PÚBLICOS DE GERAÇÃO
  // ============================================
  public gerarRelatorioCompleto(data: RelatorioData): void {
    const subtitulo = this.buildSubtitulo(data.filtros);
    this.addHeader("Relatório Completo de Estoque", subtitulo);

    this.addResumoGeral(data);
    this.addAlertas(data);
    this.addEstoquePorMedicamento(data.estoquePorMedicamento);
    this.addMovimentacoes(data.movimentacoes, data.resumo);
    this.addEliminacoes(data.eliminacoes, data.resumo);
    this.addFornecedores(data.estoquePorFornecedor);

    this.addFooter();
  }

  public gerarRelatorioResumo(data: RelatorioData): void {
    const subtitulo = this.buildSubtitulo(data.filtros);
    this.addHeader("Resumo Geral do Estoque", subtitulo);

    this.addResumoGeral(data);

    // Mini resumo de alertas
    if (
      data.lotesVencidos.length > 0 ||
      data.lotesProximosVencimento.length > 0 ||
      data.estoqueBaixo.length > 0
    ) {
      this.addSectionTitle("Resumo de Alertas", "⚠️");

      const alertaData = [
        [
          "Lotes Vencidos",
          data.lotesVencidos.length.toString(),
          "Ação imediata necessária",
        ],
        [
          "Próximos do Vencimento",
          data.lotesProximosVencimento.length.toString(),
          "Nos próximos 30 dias",
        ],
        ["Estoque Baixo", data.estoqueBaixo.length.toString(), "≤ 10 unidades"],
      ];

      autoTable(this.doc, {
        startY: this.currentY,
        head: [["Tipo de Alerta", "Quantidade", "Descrição"]],
        body: alertaData,
        margin: { left: this.margin, right: this.margin },
        styles: { fontSize: 9, cellPadding: 3 },
        headStyles: { fillColor: COLORS.danger, textColor: COLORS.white },
        columnStyles: {
          1: { halign: "center", fontStyle: "bold" },
        },
      });

      this.currentY = (this.doc as any).lastAutoTable.finalY + 8;
    }

    this.addFooter();
  }

  public gerarRelatorioEstoque(data: RelatorioData): void {
    const subtitulo = this.buildSubtitulo(data.filtros);
    this.addHeader("Relatório de Estoque por Medicamento", subtitulo);

    this.addEstoquePorMedicamento(data.estoquePorMedicamento);

    this.addFooter();
  }

  public gerarRelatorioMovimentacoes(data: RelatorioData): void {
    const subtitulo = this.buildSubtitulo(data.filtros);
    this.addHeader("Relatório de Movimentações", subtitulo);

    this.addMovimentacoes(data.movimentacoes, data.resumo);

    this.addFooter();
  }

  public gerarRelatorioEliminacoes(data: RelatorioData): void {
    const subtitulo = this.buildSubtitulo(data.filtros);
    this.addHeader("Relatório de Eliminações", subtitulo);

    this.addEliminacoes(data.eliminacoes, data.resumo);

    this.addFooter();
  }

  public gerarRelatorioAlertas(data: RelatorioData): void {
    const subtitulo = this.buildSubtitulo(data.filtros);
    this.addHeader("Relatório de Alertas", subtitulo);

    this.addAlertas(data);

    this.addFooter();
  }

  public gerarRelatorioFornecedores(data: RelatorioData): void {
    const subtitulo = this.buildSubtitulo(data.filtros);
    this.addHeader("Relatório por Fornecedor", subtitulo);

    this.addFornecedores(data.estoquePorFornecedor);

    this.addFooter();
  }

  private buildSubtitulo(filtros: RelatorioData["filtros"]): string {
    const partes: string[] = [];

    if (filtros.dataInicio && filtros.dataFim) {
      partes.push(
        `Período: ${formatarData(filtros.dataInicio)} a ${formatarData(filtros.dataFim)}`,
      );
    } else if (filtros.dataInicio) {
      partes.push(`A partir de: ${formatarData(filtros.dataInicio)}`);
    } else if (filtros.dataFim) {
      partes.push(`Até: ${formatarData(filtros.dataFim)}`);
    }

    return partes.join(" | ") || "Todos os dados";
  }

  // Download do PDF
  public download(filename: string = "relatorio"): void {
    const dataAtual = new Date().toISOString().split("T")[0];
    this.doc.save(`${filename}_${dataAtual}.pdf`);
  }

  // Abrir em nova aba
  public abrirNovaAba(): void {
    const pdfBlob = this.doc.output("blob");
    const url = URL.createObjectURL(pdfBlob);
    window.open(url, "_blank");
  }

  // Retornar blob para upload
  public getBlob(): Blob {
    return this.doc.output("blob");
  }
}

// ============================================
// FUNÇÃO HELPER PARA USO SIMPLIFICADO
// ============================================
export function gerarPDF(
  data: RelatorioData,
  tipo:
    | "completo"
    | "resumo"
    | "estoque"
    | "movimentacoes"
    | "eliminacoes"
    | "alertas"
    | "fornecedores" = "completo",
  opcoes?: {
    nomeEmpresa?: string;
    logoBase64?: string;
    abrirNovaAba?: boolean;
  },
): void {
  const pdf = new PDFGenerator({
    nomeEmpresa: opcoes?.nomeEmpresa,
    logoBase64: opcoes?.logoBase64,
  });

  switch (tipo) {
    case "resumo":
      pdf.gerarRelatorioResumo(data);
      break;
    case "estoque":
      pdf.gerarRelatorioEstoque(data);
      break;
    case "movimentacoes":
      pdf.gerarRelatorioMovimentacoes(data);
      break;
    case "eliminacoes":
      pdf.gerarRelatorioEliminacoes(data);
      break;
    case "alertas":
      pdf.gerarRelatorioAlertas(data);
      break;
    case "fornecedores":
      pdf.gerarRelatorioFornecedores(data);
      break;
    default:
      pdf.gerarRelatorioCompleto(data);
  }

  if (opcoes?.abrirNovaAba) {
    pdf.abrirNovaAba();
  } else {
    pdf.download(`relatorio_${tipo}`);
  }
}
