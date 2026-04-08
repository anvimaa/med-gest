// src/lib/utils/pdfGenerator.ts

import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

// ============================================
// TIPOS
// ============================================
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

// ============================================
// CORES - PALETA PROFISSIONAL MINIMALISTA
// ============================================
const COLORS = {
  black: [0, 0, 0] as [number, number, number],
  darkGray: [51, 51, 51] as [number, number, number],
  gray: [128, 128, 128] as [number, number, number],
  lightGray: [200, 200, 200] as [number, number, number],
  veryLightGray: [245, 245, 245] as [number, number, number],
  white: [255, 255, 255] as [number, number, number],
};

// ============================================
// FUNÇÕES UTILITÁRIAS
// ============================================
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
  hoje.setHours(0, 0, 0, 0);
  const validade = new Date(dataValidade);
  validade.setHours(0, 0, 0, 0);
  const diff = validade.getTime() - hoje.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

// ============================================
// CLASSE PRINCIPAL
// ============================================
export class PDFGenerator {
  private doc: jsPDF;
  private pageWidth: number;
  private pageHeight: number;
  private margin: number;
  private contentWidth: number;
  private currentY: number;
  private pageNumber: number;
  private nomeEmpresa: string;

  constructor(options?: { nomeEmpresa?: string }) {
    this.doc = new jsPDF("p", "mm", "a4");
    this.pageWidth = this.doc.internal.pageSize.getWidth();
    this.pageHeight = this.doc.internal.pageSize.getHeight();
    this.margin = 20;
    this.contentWidth = this.pageWidth - 2 * this.margin;
    this.currentY = this.margin;
    this.pageNumber = 1;
    this.nomeEmpresa =
      options?.nomeEmpresa || "Sistema de Gestao de Estoque de Medicamentos";
  }

  // ============================================
  // CABEÇALHO
  // ============================================
  private addHeader(titulo: string, subtitulo?: string): void {
    // Nome da empresa
    this.doc.setTextColor(...COLORS.black);
    this.doc.setFontSize(14);
    this.doc.setFont("helvetica", "bold");
    this.doc.text(this.nomeEmpresa.toUpperCase(), this.margin, this.currentY);

    this.currentY += 6;

    // Linha separadora
    this.doc.setDrawColor(...COLORS.black);
    this.doc.setLineWidth(0.5);
    this.doc.line(
      this.margin,
      this.currentY,
      this.pageWidth - this.margin,
      this.currentY,
    );

    this.currentY += 8;

    // Título do relatório
    this.doc.setFontSize(12);
    this.doc.setFont("helvetica", "bold");
    this.doc.text(titulo, this.margin, this.currentY);

    // Data de geração (lado direito)
    this.doc.setFontSize(9);
    this.doc.setFont("helvetica", "normal");
    this.doc.setTextColor(...COLORS.gray);
    this.doc.text(
      `Emitido em: ${formatarDataHora(new Date())}`,
      this.pageWidth - this.margin,
      this.currentY,
      { align: "right" },
    );

    this.currentY += 5;

    // Subtítulo (período/filtros)
    if (subtitulo) {
      this.doc.setFontSize(9);
      this.doc.setTextColor(...COLORS.gray);
      this.doc.text(subtitulo, this.margin, this.currentY);
      this.currentY += 4;
    }

    // Linha fina
    this.doc.setDrawColor(...COLORS.lightGray);
    this.doc.setLineWidth(0.2);
    this.doc.line(
      this.margin,
      this.currentY,
      this.pageWidth - this.margin,
      this.currentY,
    );

    this.currentY += 10;
  }

  // ============================================
  // RODAPÉ
  // ============================================
  private addFooter(): void {
    const footerY = this.pageHeight - 15;

    // Linha
    this.doc.setDrawColor(...COLORS.lightGray);
    this.doc.setLineWidth(0.2);
    this.doc.line(this.margin, footerY, this.pageWidth - this.margin, footerY);

    // Texto
    this.doc.setTextColor(...COLORS.gray);
    this.doc.setFontSize(8);
    this.doc.setFont("helvetica", "normal");

    this.doc.text("Documento gerado eletronicamente", this.margin, footerY + 5);

    this.doc.text(
      `Pagina ${this.pageNumber}`,
      this.pageWidth / 2,
      footerY + 5,
      { align: "center" },
    );

    this.doc.text(this.nomeEmpresa, this.pageWidth - this.margin, footerY + 5, {
      align: "right",
    });
  }

  // ============================================
  // QUEBRA DE PÁGINA
  // ============================================
  private checkPageBreak(requiredSpace: number = 25): void {
    if (this.currentY + requiredSpace > this.pageHeight - 25) {
      this.addFooter();
      this.doc.addPage();
      this.pageNumber++;
      this.currentY = this.margin;
    }
  }

  // ============================================
  // TÍTULO DE SEÇÃO
  // ============================================
  private addSectionTitle(title: string): void {
    this.checkPageBreak(15);

    this.doc.setTextColor(...COLORS.black);
    this.doc.setFontSize(11);
    this.doc.setFont("helvetica", "bold");
    this.doc.text(title.toUpperCase(), this.margin, this.currentY);

    this.currentY += 2;

    // Linha abaixo do título
    this.doc.setDrawColor(...COLORS.black);
    this.doc.setLineWidth(0.3);
    this.doc.line(this.margin, this.currentY, this.margin + 40, this.currentY);

    this.currentY += 6;
  }

  // ============================================
  // SUBTÍTULO
  // ============================================
  private addSubsectionTitle(title: string): void {
    this.checkPageBreak(12);

    this.doc.setTextColor(...COLORS.darkGray);
    this.doc.setFontSize(10);
    this.doc.setFont("helvetica", "bold");
    this.doc.text(title, this.margin, this.currentY);

    this.currentY += 6;
  }

  // ============================================
  // TEXTO SIMPLES
  // ============================================
  private addText(
    text: string,
    options?: {
      bold?: boolean;
      size?: number;
      color?: [number, number, number];
    },
  ): void {
    this.doc.setTextColor(...(options?.color || COLORS.darkGray));
    this.doc.setFontSize(options?.size || 9);
    this.doc.setFont("helvetica", options?.bold ? "bold" : "normal");
    this.doc.text(text, this.margin, this.currentY);
    this.currentY += 5;
  }

  // ============================================
  // LINHA DE DADOS (label: valor)
  // ============================================
  private addDataLine(
    label: string,
    value: string | number,
    indent: number = 0,
  ): void {
    this.doc.setFontSize(9);
    this.doc.setFont("helvetica", "normal");
    this.doc.setTextColor(...COLORS.gray);
    this.doc.text(`${label}:`, this.margin + indent, this.currentY);

    this.doc.setFont("helvetica", "bold");
    this.doc.setTextColor(...COLORS.darkGray);
    this.doc.text(String(value), this.margin + indent + 35, this.currentY);

    this.currentY += 5;
  }

  // ============================================
  // TABELA DE RESUMO (grid de dados)
  // ============================================
  private addSummaryGrid(
    items: { label: string; value: string | number }[],
    columns: number = 4,
  ): void {
    const colWidth = this.contentWidth / columns;
    const rowHeight = 12;

    items.forEach((item, index) => {
      const col = index % columns;
      const row = Math.floor(index / columns);

      if (col === 0 && row > 0) {
        this.currentY += rowHeight;
        this.checkPageBreak(rowHeight + 5);
      }

      const x = this.margin + col * colWidth;
      const y = this.currentY;

      // Label
      this.doc.setFontSize(8);
      this.doc.setFont("helvetica", "normal");
      this.doc.setTextColor(...COLORS.gray);
      this.doc.text(item.label, x, y);

      // Valor
      this.doc.setFontSize(12);
      this.doc.setFont("helvetica", "bold");
      this.doc.setTextColor(...COLORS.black);
      this.doc.text(String(item.value), x, y + 5);
    });

    const totalRows = Math.ceil(items.length / columns);
    this.currentY += totalRows * rowHeight + 5;
  }

  // ============================================
  // RESUMO GERAL
  // ============================================
  private addResumoGeral(data: RelatorioData): void {
    this.addSectionTitle("Resumo Geral");

    // Grid de resumo principal
    this.addSummaryGrid([
      {
        label: "Total de Medicamentos",
        value: data.resumo.totalMedicamentos.toLocaleString("pt-BR"),
      },
      {
        label: "Estoque Total (unidades)",
        value: data.resumo.estoqueTotal.toLocaleString("pt-BR"),
      },
      {
        label: "Fornecedores Cadastrados",
        value: data.resumo.totalFornecedores.toLocaleString("pt-BR"),
      },
      {
        label: "Lotes Registrados",
        value: data.resumo.totalLotes.toLocaleString("pt-BR"),
      },
    ]);

    this.currentY += 3;

    // Movimentações
    this.addSubsectionTitle("Movimentacoes no Periodo");

    const movData = [
      ["Tipo", "Quantidade", "Total de Movimentacoes"],
      [
        "Entradas",
        `+${data.resumo.totalEntradas.toLocaleString("pt-BR")}`,
        data.resumo.countEntradas.toString(),
      ],
      [
        "Saidas",
        `-${data.resumo.totalSaidas.toLocaleString("pt-BR")}`,
        data.resumo.countSaidas.toString(),
      ],
      [
        "Eliminacoes",
        `-${data.resumo.totalEliminacoes.toLocaleString("pt-BR")}`,
        data.resumo.countEliminacoes.toString(),
      ],
    ];

    autoTable(this.doc, {
      startY: this.currentY,
      head: [movData[0]],
      body: movData.slice(1),
      margin: { left: this.margin, right: this.margin },
      styles: {
        fontSize: 9,
        cellPadding: 3,
        lineColor: COLORS.lightGray,
        lineWidth: 0.1,
      },
      headStyles: {
        fillColor: COLORS.veryLightGray,
        textColor: COLORS.black,
        fontStyle: "bold",
      },
      alternateRowStyles: {
        fillColor: COLORS.white,
      },
      columnStyles: {
        1: { halign: "right", fontStyle: "bold" },
        2: { halign: "center" },
      },
    });

    this.currentY = (this.doc as any).lastAutoTable.finalY + 8;

    // Alertas
    const totalAlertas =
      data.lotesVencidos.length +
      data.lotesProximosVencimento.length +
      data.estoqueBaixo.length;

    if (totalAlertas > 0) {
      this.addSubsectionTitle("Situacoes que Requerem Atencao");

      const alertasData = [];
      if (data.lotesVencidos.length > 0) {
        alertasData.push([
          "Lotes com validade expirada",
          data.lotesVencidos.length.toString(),
        ]);
      }
      if (data.lotesProximosVencimento.length > 0) {
        alertasData.push([
          "Lotes proximos do vencimento (30 dias)",
          data.lotesProximosVencimento.length.toString(),
        ]);
      }
      if (data.estoqueBaixo.length > 0) {
        alertasData.push([
          "Lotes com estoque baixo (10 ou menos)",
          data.estoqueBaixo.length.toString(),
        ]);
      }

      autoTable(this.doc, {
        startY: this.currentY,
        head: [["Descricao", "Quantidade"]],
        body: alertasData,
        margin: { left: this.margin, right: this.margin },
        styles: {
          fontSize: 9,
          cellPadding: 3,
          lineColor: COLORS.lightGray,
          lineWidth: 0.1,
        },
        headStyles: {
          fillColor: COLORS.veryLightGray,
          textColor: COLORS.black,
          fontStyle: "bold",
        },
        columnStyles: {
          1: { halign: "center", fontStyle: "bold" },
        },
      });

      this.currentY = (this.doc as any).lastAutoTable.finalY + 8;
    }
  }

  // ============================================
  // ESTOQUE POR MEDICAMENTO
  // ============================================
  private addEstoquePorMedicamento(data: MedicamentoComLotes[]): void {
    this.addSectionTitle("Estoque por Medicamento");

    if (data.length === 0) {
      this.addText("Nenhum medicamento encontrado com os filtros aplicados.");
      return;
    }

    data.forEach((med, index) => {
      this.checkPageBreak(35);

      const totalEstoque = med.lotes.reduce(
        (acc, l) => acc + l.quantidadeAtual,
        0,
      );

      // Nome do medicamento
      this.doc.setFontSize(10);
      this.doc.setFont("helvetica", "bold");
      this.doc.setTextColor(...COLORS.black);
      this.doc.text(`${index + 1}. ${med.nome}`, this.margin, this.currentY);

      // Estoque total
      this.doc.setFont("helvetica", "normal");
      this.doc.text(
        `Estoque: ${totalEstoque.toLocaleString("pt-BR")} un.`,
        this.pageWidth - this.margin,
        this.currentY,
        { align: "right" },
      );

      this.currentY += 4;

      // Detalhes
      const detalhes = [
        med.principioAtivo,
        med.formaFarmaceutica,
        med.concentracao,
      ]
        .filter(Boolean)
        .join(" | ");

      if (detalhes) {
        this.doc.setFontSize(8);
        this.doc.setTextColor(...COLORS.gray);
        this.doc.text(detalhes, this.margin, this.currentY);
        this.currentY += 4;
      }

      // Tabela de lotes
      if (med.lotes.length > 0) {
        const tableData = med.lotes.map((lote) => {
          const dias = diasParaVencer(lote.dataValidade);
          let situacao = "Regular";
          if (lote.quantidadeAtual === 0) situacao = "Esgotado";
          else if (dias < 0) situacao = "Vencido";
          else if (dias <= 30) situacao = `Vence em ${dias}d`;

          return [
            lote.numeroLote,
            lote.fornecedor.nome,
            lote.quantidadeInicial.toLocaleString("pt-BR"),
            lote.quantidadeAtual.toLocaleString("pt-BR"),
            formatarData(lote.dataValidade),
            situacao,
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
              "Situacao",
            ],
          ],
          body: tableData,
          margin: { left: this.margin, right: this.margin },
          styles: {
            fontSize: 8,
            cellPadding: 2,
            lineColor: COLORS.lightGray,
            lineWidth: 0.1,
          },
          headStyles: {
            fillColor: COLORS.veryLightGray,
            textColor: COLORS.darkGray,
            fontStyle: "bold",
          },
          columnStyles: {
            0: { cellWidth: 25 },
            2: { halign: "right" },
            3: { halign: "right", fontStyle: "bold" },
            4: { halign: "center" },
            5: { halign: "center" },
          },
        });

        this.currentY = (this.doc as any).lastAutoTable.finalY + 8;
      } else {
        this.doc.setFontSize(8);
        this.doc.setTextColor(...COLORS.gray);
        this.doc.text("Sem lotes registrados", this.margin + 5, this.currentY);
        this.currentY += 8;
      }
    });
  }

  // ============================================
  // MOVIMENTAÇÕES
  // ============================================
  private addMovimentacoes(data: Movimentacao[], resumo: ResumoData): void {
    this.addSectionTitle("Registro de Movimentacoes");

    // Resumo
    this.doc.setFontSize(9);
    this.doc.setTextColor(...COLORS.darkGray);
    this.doc.text(
      `Total de entradas: +${resumo.totalEntradas.toLocaleString("pt-BR")} unidades (${resumo.countEntradas} registros)  |  ` +
        `Total de saidas: -${resumo.totalSaidas.toLocaleString("pt-BR")} unidades (${resumo.countSaidas} registros)`,
      this.margin,
      this.currentY,
    );
    this.currentY += 6;

    if (data.length === 0) {
      this.addText("Nenhuma movimentacao encontrada no periodo.");
      return;
    }

    const tableData = data.map((mov) => [
      formatarDataHora(mov.dataMovimentacao),
      mov.tipoMovimentacao === "ENTRADA" ? "Entrada" : "Saida",
      mov.lote.medicamento.nome,
      mov.lote.numeroLote,
      mov.tipoMovimentacao === "ENTRADA"
        ? `+${mov.quantidade}`
        : `-${mov.quantidade}`,
      mov.user.name || mov.user.email,
    ]);

    autoTable(this.doc, {
      startY: this.currentY,
      head: [
        ["Data/Hora", "Tipo", "Medicamento", "Lote", "Qtd.", "Responsavel"],
      ],
      body: tableData,
      margin: { left: this.margin, right: this.margin },
      styles: {
        fontSize: 8,
        cellPadding: 2,
        lineColor: COLORS.lightGray,
        lineWidth: 0.1,
      },
      headStyles: {
        fillColor: COLORS.veryLightGray,
        textColor: COLORS.darkGray,
        fontStyle: "bold",
      },
      columnStyles: {
        0: { cellWidth: 28 },
        1: { cellWidth: 18 },
        4: { halign: "right", fontStyle: "bold" },
      },
    });

    this.currentY = (this.doc as any).lastAutoTable.finalY + 8;
  }

  // ============================================
  // ELIMINAÇÕES
  // ============================================
  private addEliminacoes(data: Eliminacao[], resumo: ResumoData): void {
    this.addSectionTitle("Registro de Eliminacoes");

    this.doc.setFontSize(9);
    this.doc.setTextColor(...COLORS.darkGray);
    this.doc.text(
      `Total eliminado: ${resumo.totalEliminacoes.toLocaleString("pt-BR")} unidades em ${resumo.countEliminacoes} registro(s)`,
      this.margin,
      this.currentY,
    );
    this.currentY += 6;

    if (data.length === 0) {
      this.addText("Nenhuma eliminacao registrada no periodo.");
      return;
    }

    const tableData = data.map((elim) => [
      formatarDataHora(elim.dataEliminacao),
      elim.lote.medicamento.nome,
      elim.lote.numeroLote,
      elim.quantidade.toString(),
      elim.motivo,
      elim.user.name || elim.user.email,
    ]);

    autoTable(this.doc, {
      startY: this.currentY,
      head: [
        ["Data/Hora", "Medicamento", "Lote", "Qtd.", "Motivo", "Responsavel"],
      ],
      body: tableData,
      margin: { left: this.margin, right: this.margin },
      styles: {
        fontSize: 8,
        cellPadding: 2,
        lineColor: COLORS.lightGray,
        lineWidth: 0.1,
      },
      headStyles: {
        fillColor: COLORS.veryLightGray,
        textColor: COLORS.darkGray,
        fontStyle: "bold",
      },
      columnStyles: {
        0: { cellWidth: 28 },
        3: { halign: "right", fontStyle: "bold" },
      },
    });

    this.currentY = (this.doc as any).lastAutoTable.finalY + 8;
  }

  // ============================================
  // ALERTAS
  // ============================================
  private addAlertas(data: RelatorioData): void {
    this.addSectionTitle("Alertas e Pendencias");

    // LOTES VENCIDOS
    this.addSubsectionTitle(`Lotes Vencidos (${data.lotesVencidos.length})`);

    if (data.lotesVencidos.length > 0) {
      const tableData = data.lotesVencidos.map((lote) => {
        const dias = Math.abs(diasParaVencer(lote.dataValidade));
        return [
          lote.medicamento.nome,
          lote.numeroLote,
          lote.fornecedor.nome,
          lote.quantidadeAtual.toLocaleString("pt-BR"),
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
            "Qtd. Atual",
            "Data Vencimento",
            "Vencido ha",
          ],
        ],
        body: tableData,
        margin: { left: this.margin, right: this.margin },
        styles: {
          fontSize: 8,
          cellPadding: 2,
          lineColor: COLORS.lightGray,
          lineWidth: 0.1,
        },
        headStyles: {
          fillColor: COLORS.veryLightGray,
          textColor: COLORS.darkGray,
          fontStyle: "bold",
        },
        columnStyles: {
          3: { halign: "right" },
          4: { halign: "center" },
          5: { halign: "center", fontStyle: "bold" },
        },
      });

      this.currentY = (this.doc as any).lastAutoTable.finalY + 8;
    } else {
      this.addText("Nenhum lote vencido com estoque.");
    }

    // PRÓXIMOS DO VENCIMENTO
    this.checkPageBreak(20);
    this.addSubsectionTitle(
      `Lotes Proximos do Vencimento - 30 dias (${data.lotesProximosVencimento.length})`,
    );

    if (data.lotesProximosVencimento.length > 0) {
      const tableData = data.lotesProximosVencimento.map((lote) => {
        const dias = diasParaVencer(lote.dataValidade);
        return [
          lote.medicamento.nome,
          lote.numeroLote,
          lote.fornecedor.nome,
          lote.quantidadeAtual.toLocaleString("pt-BR"),
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
            "Qtd. Atual",
            "Data Vencimento",
            "Dias Restantes",
          ],
        ],
        body: tableData,
        margin: { left: this.margin, right: this.margin },
        styles: {
          fontSize: 8,
          cellPadding: 2,
          lineColor: COLORS.lightGray,
          lineWidth: 0.1,
        },
        headStyles: {
          fillColor: COLORS.veryLightGray,
          textColor: COLORS.darkGray,
          fontStyle: "bold",
        },
        columnStyles: {
          3: { halign: "right" },
          4: { halign: "center" },
          5: { halign: "center", fontStyle: "bold" },
        },
      });

      this.currentY = (this.doc as any).lastAutoTable.finalY + 8;
    } else {
      this.addText("Nenhum lote proximo do vencimento.");
    }

    // ESTOQUE BAIXO
    this.checkPageBreak(20);
    this.addSubsectionTitle(
      `Lotes com Estoque Baixo - 10 unidades ou menos (${data.estoqueBaixo.length})`,
    );

    if (data.estoqueBaixo.length > 0) {
      const tableData = data.estoqueBaixo.map((lote) => {
        const consumido = lote.quantidadeInicial - lote.quantidadeAtual;
        const percentual = Math.round(
          (consumido / lote.quantidadeInicial) * 100,
        );
        return [
          lote.medicamento.nome,
          lote.numeroLote,
          lote.fornecedor.nome,
          lote.quantidadeInicial.toLocaleString("pt-BR"),
          lote.quantidadeAtual.toLocaleString("pt-BR"),
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
            "% Consumido",
          ],
        ],
        body: tableData,
        margin: { left: this.margin, right: this.margin },
        styles: {
          fontSize: 8,
          cellPadding: 2,
          lineColor: COLORS.lightGray,
          lineWidth: 0.1,
        },
        headStyles: {
          fillColor: COLORS.veryLightGray,
          textColor: COLORS.darkGray,
          fontStyle: "bold",
        },
        columnStyles: {
          3: { halign: "right" },
          4: { halign: "right", fontStyle: "bold" },
          5: { halign: "center" },
        },
      });

      this.currentY = (this.doc as any).lastAutoTable.finalY + 8;
    } else {
      this.addText("Todos os lotes com estoque adequado.");
    }
  }

  // ============================================
  // FORNECEDORES
  // ============================================
  private addFornecedores(data: FornecedorComLotes[]): void {
    this.addSectionTitle("Relatorio por Fornecedor");

    if (data.length === 0) {
      this.addText("Nenhum fornecedor encontrado.");
      return;
    }

    const tableData = data.map((forn) => {
      const totalInicial = forn.lotes.reduce(
        (a, l) => a + l.quantidadeInicial,
        0,
      );
      const totalAtual = forn.lotes.reduce((a, l) => a + l.quantidadeAtual, 0);
      const consumido = totalInicial - totalAtual;
      const percentual =
        totalInicial > 0 ? Math.round((consumido / totalInicial) * 100) : 0;
      const medicamentos = [
        ...new Set(forn.lotes.map((l) => l.medicamento.nome)),
      ];

      return [
        forn.nome,
        forn.lotes.length.toString(),
        totalInicial.toLocaleString("pt-BR"),
        totalAtual.toLocaleString("pt-BR"),
        `${percentual}%`,
        medicamentos.slice(0, 3).join(", ") +
          (medicamentos.length > 3 ? "..." : ""),
      ];
    });

    autoTable(this.doc, {
      startY: this.currentY,
      head: [
        [
          "Fornecedor",
          "Lotes",
          "Qtd. Inicial",
          "Qtd. Atual",
          "Consumo",
          "Medicamentos",
        ],
      ],
      body: tableData,
      margin: { left: this.margin, right: this.margin },
      styles: {
        fontSize: 8,
        cellPadding: 2,
        lineColor: COLORS.lightGray,
        lineWidth: 0.1,
      },
      headStyles: {
        fillColor: COLORS.veryLightGray,
        textColor: COLORS.darkGray,
        fontStyle: "bold",
      },
      columnStyles: {
        1: { halign: "center" },
        2: { halign: "right" },
        3: { halign: "right", fontStyle: "bold" },
        4: { halign: "center" },
        5: { cellWidth: 50 },
      },
    });

    this.currentY = (this.doc as any).lastAutoTable.finalY + 8;
  }

  // ============================================
  // CONSTRUIR SUBTÍTULO
  // ============================================
  private buildSubtitulo(filtros: RelatorioData["filtros"]): string {
    const partes: string[] = [];

    if (filtros.dataInicio && filtros.dataFim) {
      partes.push(
        `Periodo: ${formatarData(filtros.dataInicio)} a ${formatarData(filtros.dataFim)}`,
      );
    } else if (filtros.dataInicio) {
      partes.push(`A partir de: ${formatarData(filtros.dataInicio)}`);
    } else if (filtros.dataFim) {
      partes.push(`Ate: ${formatarData(filtros.dataFim)}`);
    } else {
      partes.push("Periodo: Todos os registros");
    }

    return partes.join(" | ");
  }

  // ============================================
  // MÉTODOS PÚBLICOS
  // ============================================
  public gerarRelatorioCompleto(data: RelatorioData): void {
    const subtitulo = this.buildSubtitulo(data.filtros);
    this.addHeader("Relatorio Geral de Estoque", subtitulo);

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
    this.addHeader("Resumo Executivo de Estoque", subtitulo);
    this.addResumoGeral(data);
    this.addFooter();
  }

  public gerarRelatorioEstoque(data: RelatorioData): void {
    const subtitulo = this.buildSubtitulo(data.filtros);
    this.addHeader("Relatorio de Estoque por Medicamento", subtitulo);
    this.addEstoquePorMedicamento(data.estoquePorMedicamento);
    this.addFooter();
  }

  public gerarRelatorioMovimentacoes(data: RelatorioData): void {
    const subtitulo = this.buildSubtitulo(data.filtros);
    this.addHeader("Relatorio de Movimentacoes", subtitulo);
    this.addMovimentacoes(data.movimentacoes, data.resumo);
    this.addFooter();
  }

  public gerarRelatorioEliminacoes(data: RelatorioData): void {
    const subtitulo = this.buildSubtitulo(data.filtros);
    this.addHeader("Relatorio de Eliminacoes", subtitulo);
    this.addEliminacoes(data.eliminacoes, data.resumo);
    this.addFooter();
  }

  public gerarRelatorioAlertas(data: RelatorioData): void {
    const subtitulo = this.buildSubtitulo(data.filtros);
    this.addHeader("Relatorio de Alertas e Pendencias", subtitulo);
    this.addAlertas(data);
    this.addFooter();
  }

  public gerarRelatorioFornecedores(data: RelatorioData): void {
    const subtitulo = this.buildSubtitulo(data.filtros);
    this.addHeader("Relatorio por Fornecedor", subtitulo);
    this.addFornecedores(data.estoquePorFornecedor);
    this.addFooter();
  }

  // ============================================
  // EXPORTAÇÃO
  // ============================================
  public download(filename: string = "relatorio"): void {
    const dataAtual = new Date().toISOString().split("T")[0];
    this.doc.save(`${filename}_${dataAtual}.pdf`);
  }

  public abrirNovaAba(): void {
    const pdfBlob = this.doc.output("blob");
    const url = URL.createObjectURL(pdfBlob);
    window.open(url, "_blank");
  }

  public getBlob(): Blob {
    return this.doc.output("blob");
  }

  public getBase64(): string {
    return this.doc.output("datauristring");
  }
}

// ============================================
// FUNÇÃO HELPER
// ============================================
export type TipoRelatorio =
  | "completo"
  | "resumo"
  | "estoque"
  | "movimentacoes"
  | "eliminacoes"
  | "alertas"
  | "fornecedores";

export function gerarPDF(
  data: RelatorioData,
  tipo: TipoRelatorio = "completo",
  opcoes?: {
    nomeEmpresa?: string;
    abrirNovaAba?: boolean;
  },
): void {
  const pdf = new PDFGenerator({
    nomeEmpresa: opcoes?.nomeEmpresa,
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

export async function gerarPDFAsync(
  data: RelatorioData,
  tipo: TipoRelatorio = "completo",
  opcoes?: { nomeEmpresa?: string },
): Promise<Blob> {
  return new Promise((resolve) => {
    const pdf = new PDFGenerator({ nomeEmpresa: opcoes?.nomeEmpresa });

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

    resolve(pdf.getBlob());
  });
}
