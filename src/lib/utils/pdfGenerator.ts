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
// CORES DO TEMA (RGB)
// ============================================
const COLORS = {
  primary: [79, 70, 229] as [number, number, number],
  primaryDark: [67, 56, 202] as [number, number, number],
  primaryLight: [238, 242, 255] as [number, number, number],
  success: [22, 163, 74] as [number, number, number],
  successLight: [220, 252, 231] as [number, number, number],
  warning: [234, 88, 12] as [number, number, number],
  warningLight: [255, 237, 213] as [number, number, number],
  danger: [220, 38, 38] as [number, number, number],
  dangerLight: [254, 226, 226] as [number, number, number],
  yellow: [202, 138, 4] as [number, number, number],
  yellowLight: [254, 249, 195] as [number, number, number],
  gray: [107, 114, 128] as [number, number, number],
  grayLight: [249, 250, 251] as [number, number, number],
  grayMedium: [229, 231, 235] as [number, number, number],
  dark: [17, 24, 39] as [number, number, number],
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
    this.margin = 15;
    this.contentWidth = this.pageWidth - 2 * this.margin;
    this.currentY = this.margin;
    this.pageNumber = 1;
    this.nomeEmpresa = options?.nomeEmpresa || "Sistema de Gestao de Estoque";
  }

  // ============================================
  // DESENHAR ÍCONES GEOMÉTRICOS
  // ============================================
  private drawIcon(
    type:
      | "pill"
      | "box"
      | "building"
      | "alert"
      | "check"
      | "x"
      | "clock"
      | "arrow-down"
      | "arrow-up"
      | "trash"
      | "chart",
    x: number,
    y: number,
    size: number,
    color: [number, number, number],
  ): void {
    this.doc.setDrawColor(...color);
    this.doc.setFillColor(...color);

    switch (type) {
      case "pill":
        // Cápsula/Pílula
        this.doc.setLineWidth(0.5);
        this.doc.roundedRect(
          x,
          y + size * 0.2,
          size * 0.4,
          size * 0.6,
          1,
          1,
          "S",
        );
        this.doc.roundedRect(
          x + size * 0.5,
          y + size * 0.2,
          size * 0.4,
          size * 0.6,
          1,
          1,
          "F",
        );
        break;

      case "box":
        // Caixa/Pacote
        this.doc.setLineWidth(0.4);
        this.doc.rect(
          x + size * 0.1,
          y + size * 0.3,
          size * 0.8,
          size * 0.6,
          "S",
        );
        this.doc.line(
          x + size * 0.1,
          y + size * 0.5,
          x + size * 0.9,
          y + size * 0.5,
        );
        this.doc.line(
          x + size * 0.5,
          y + size * 0.3,
          x + size * 0.5,
          y + size * 0.5,
        );
        break;

      case "building":
        // Prédio/Fornecedor
        this.doc.setLineWidth(0.4);
        this.doc.rect(
          x + size * 0.2,
          y + size * 0.1,
          size * 0.6,
          size * 0.8,
          "S",
        );
        this.doc.rect(
          x + size * 0.35,
          y + size * 0.25,
          size * 0.12,
          size * 0.15,
          "F",
        );
        this.doc.rect(
          x + size * 0.55,
          y + size * 0.25,
          size * 0.12,
          size * 0.15,
          "F",
        );
        this.doc.rect(
          x + size * 0.35,
          y + size * 0.5,
          size * 0.12,
          size * 0.15,
          "F",
        );
        this.doc.rect(
          x + size * 0.55,
          y + size * 0.5,
          size * 0.12,
          size * 0.15,
          "F",
        );
        break;

      case "alert":
        // Triângulo de alerta
        this.doc.setLineWidth(0.5);
        this.doc.triangle(
          x + size * 0.5,
          y + size * 0.1,
          x + size * 0.1,
          y + size * 0.9,
          x + size * 0.9,
          y + size * 0.9,
          "S",
        );
        this.doc.setFontSize(size * 2);
        this.doc.text("!", x + size * 0.42, y + size * 0.75);
        break;

      case "check":
        // Check/Verificado
        this.doc.setLineWidth(0.6);
        this.doc.circle(x + size * 0.5, y + size * 0.5, size * 0.4, "S");
        this.doc.line(
          x + size * 0.25,
          y + size * 0.5,
          x + size * 0.45,
          y + size * 0.7,
        );
        this.doc.line(
          x + size * 0.45,
          y + size * 0.7,
          x + size * 0.75,
          y + size * 0.3,
        );
        break;

      case "x":
        // X/Erro
        this.doc.setLineWidth(0.6);
        this.doc.circle(x + size * 0.5, y + size * 0.5, size * 0.4, "S");
        this.doc.line(
          x + size * 0.3,
          y + size * 0.3,
          x + size * 0.7,
          y + size * 0.7,
        );
        this.doc.line(
          x + size * 0.7,
          y + size * 0.3,
          x + size * 0.3,
          y + size * 0.7,
        );
        break;

      case "clock":
        // Relógio
        this.doc.setLineWidth(0.4);
        this.doc.circle(x + size * 0.5, y + size * 0.5, size * 0.4, "S");
        this.doc.line(
          x + size * 0.5,
          y + size * 0.5,
          x + size * 0.5,
          y + size * 0.25,
        );
        this.doc.line(
          x + size * 0.5,
          y + size * 0.5,
          x + size * 0.7,
          y + size * 0.5,
        );
        break;

      case "arrow-down":
        // Seta para baixo (entrada)
        this.doc.setLineWidth(0.5);
        this.doc.line(
          x + size * 0.5,
          y + size * 0.15,
          x + size * 0.5,
          y + size * 0.7,
        );
        this.doc.line(
          x + size * 0.25,
          y + size * 0.5,
          x + size * 0.5,
          y + size * 0.75,
        );
        this.doc.line(
          x + size * 0.75,
          y + size * 0.5,
          x + size * 0.5,
          y + size * 0.75,
        );
        break;

      case "arrow-up":
        // Seta para cima (saída)
        this.doc.setLineWidth(0.5);
        this.doc.line(
          x + size * 0.5,
          y + size * 0.85,
          x + size * 0.5,
          y + size * 0.3,
        );
        this.doc.line(
          x + size * 0.25,
          y + size * 0.5,
          x + size * 0.5,
          y + size * 0.25,
        );
        this.doc.line(
          x + size * 0.75,
          y + size * 0.5,
          x + size * 0.5,
          y + size * 0.25,
        );
        break;

      case "trash":
        // Lixeira
        this.doc.setLineWidth(0.4);
        this.doc.rect(
          x + size * 0.25,
          y + size * 0.3,
          size * 0.5,
          size * 0.6,
          "S",
        );
        this.doc.line(
          x + size * 0.15,
          y + size * 0.3,
          x + size * 0.85,
          y + size * 0.3,
        );
        this.doc.rect(
          x + size * 0.35,
          y + size * 0.15,
          size * 0.3,
          size * 0.15,
          "S",
        );
        break;

      case "chart":
        // Gráfico de barras
        this.doc.setLineWidth(0.4);
        this.doc.rect(
          x + size * 0.15,
          y + size * 0.5,
          size * 0.2,
          size * 0.4,
          "F",
        );
        this.doc.rect(
          x + size * 0.4,
          y + size * 0.25,
          size * 0.2,
          size * 0.65,
          "F",
        );
        this.doc.rect(
          x + size * 0.65,
          y + size * 0.4,
          size * 0.2,
          size * 0.5,
          "F",
        );
        break;
    }
  }

  // ============================================
  // CABEÇALHO
  // ============================================
  private addHeader(titulo: string, subtitulo?: string): void {
    // Fundo gradiente do cabeçalho
    this.doc.setFillColor(...COLORS.primary);
    this.doc.rect(0, 0, this.pageWidth, 32, "F");

    // Faixa decorativa inferior
    this.doc.setFillColor(...COLORS.primaryDark);
    this.doc.rect(0, 32, this.pageWidth, 3, "F");

    // Ícone decorativo
    this.doc.setFillColor(...COLORS.white);
    this.doc.roundedRect(this.margin, 8, 16, 16, 2, 2, "F");
    this.drawIcon("chart", this.margin + 2, 10, 12, COLORS.primary);

    // Nome da empresa
    this.doc.setTextColor(...COLORS.white);
    this.doc.setFontSize(16);
    this.doc.setFont("helvetica", "bold");
    this.doc.text(this.nomeEmpresa, this.margin + 22, 15);

    // Título do relatório
    this.doc.setFontSize(11);
    this.doc.setFont("helvetica", "normal");
    this.doc.text(titulo, this.margin + 22, 22);

    // Subtítulo (filtros/período)
    if (subtitulo) {
      this.doc.setFontSize(8);
      this.doc.text(subtitulo, this.margin + 22, 28);
    }

    // Data de geração
    this.doc.setFontSize(8);
    this.doc.text(
      `Gerado em: ${formatarDataHora(new Date())}`,
      this.pageWidth - this.margin,
      28,
      { align: "right" },
    );

    this.currentY = 42;
  }

  // ============================================
  // RODAPÉ
  // ============================================
  private addFooter(): void {
    const footerY = this.pageHeight - 12;

    // Linha separadora
    this.doc.setDrawColor(...COLORS.grayMedium);
    this.doc.setLineWidth(0.3);
    this.doc.line(
      this.margin,
      footerY - 3,
      this.pageWidth - this.margin,
      footerY - 3,
    );

    // Texto do rodapé
    this.doc.setTextColor(...COLORS.gray);
    this.doc.setFontSize(7);
    this.doc.setFont("helvetica", "normal");

    this.doc.text(this.nomeEmpresa, this.margin, footerY);
    this.doc.text(`Pagina ${this.pageNumber}`, this.pageWidth / 2, footerY, {
      align: "center",
    });
    this.doc.text(
      "Documento gerado automaticamente",
      this.pageWidth - this.margin,
      footerY,
      { align: "right" },
    );
  }

  // ============================================
  // VERIFICAÇÃO DE QUEBRA DE PÁGINA
  // ============================================
  private checkPageBreak(requiredSpace: number = 30): void {
    if (this.currentY + requiredSpace > this.pageHeight - 20) {
      this.addFooter();
      this.doc.addPage();
      this.pageNumber++;
      this.currentY = 15;
    }
  }

  // ============================================
  // TÍTULO DE SEÇÃO
  // ============================================
  private addSectionTitle(
    title: string,
    iconType?:
      | "pill"
      | "box"
      | "building"
      | "alert"
      | "chart"
      | "arrow-down"
      | "arrow-up"
      | "trash",
  ): void {
    this.checkPageBreak(20);

    // Fundo
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

    // Borda esquerda colorida
    this.doc.setFillColor(...COLORS.primary);
    this.doc.roundedRect(this.margin, this.currentY, 3, 10, 1, 1, "F");

    // Ícone
    if (iconType) {
      this.drawIcon(
        iconType,
        this.margin + 6,
        this.currentY + 1.5,
        7,
        COLORS.primary,
      );
    }

    // Texto
    this.doc.setTextColor(...COLORS.primary);
    this.doc.setFontSize(11);
    this.doc.setFont("helvetica", "bold");
    this.doc.text(
      title,
      this.margin + (iconType ? 16 : 8),
      this.currentY + 6.5,
    );

    this.currentY += 15;
  }

  // ============================================
  // SUBTÍTULO
  // ============================================
  private addSubsectionTitle(
    title: string,
    color: [number, number, number] = COLORS.dark,
  ): void {
    this.checkPageBreak(12);

    this.doc.setTextColor(...color);
    this.doc.setFontSize(10);
    this.doc.setFont("helvetica", "bold");
    this.doc.text(title, this.margin, this.currentY);

    this.currentY += 6;
  }

  // ============================================
  // CARD DE INFORMAÇÃO
  // ============================================
  private addInfoCard(
    label: string,
    value: string | number,
    x: number,
    y: number,
    width: number,
    color: [number, number, number] = COLORS.primary,
    iconType?: "pill" | "box" | "building" | "alert" | "check",
  ): void {
    // Fundo
    this.doc.setFillColor(...COLORS.grayLight);
    this.doc.roundedRect(x, y, width, 20, 2, 2, "F");

    // Borda colorida à esquerda
    this.doc.setFillColor(...color);
    this.doc.roundedRect(x, y, 3, 20, 1, 1, "F");

    // Ícone
    if (iconType) {
      this.drawIcon(iconType, x + 5, y + 4, 8, color);
    }

    const textX = iconType ? x + 16 : x + 6;

    // Label
    this.doc.setTextColor(...COLORS.gray);
    this.doc.setFontSize(7);
    this.doc.setFont("helvetica", "normal");
    this.doc.text(label, textX, y + 6);

    // Valor
    this.doc.setTextColor(...COLORS.dark);
    this.doc.setFontSize(14);
    this.doc.setFont("helvetica", "bold");
    this.doc.text(String(value), textX, y + 15);
  }

  // ============================================
  // CAIXA DE ALERTA
  // ============================================
  private addAlertBox(
    message: string,
    type: "success" | "warning" | "danger" | "info" = "info",
  ): void {
    this.checkPageBreak(14);

    const colors = {
      success: {
        bg: COLORS.successLight,
        border: COLORS.success,
        text: COLORS.success,
      },
      warning: {
        bg: COLORS.warningLight,
        border: COLORS.warning,
        text: COLORS.warning,
      },
      danger: {
        bg: COLORS.dangerLight,
        border: COLORS.danger,
        text: COLORS.danger,
      },
      info: {
        bg: COLORS.primaryLight,
        border: COLORS.primary,
        text: COLORS.primary,
      },
    };

    const { bg, border, text } = colors[type];

    // Fundo
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

    // Borda esquerda
    this.doc.setFillColor(...border);
    this.doc.roundedRect(this.margin, this.currentY, 3, 10, 1, 1, "F");

    // Ícone
    const iconType =
      type === "success" ? "check" : type === "danger" ? "x" : "alert";
    this.drawIcon(iconType, this.margin + 5, this.currentY + 1.5, 7, border);

    // Texto
    this.doc.setTextColor(...text);
    this.doc.setFontSize(9);
    this.doc.setFont("helvetica", "bold");
    this.doc.text(message, this.margin + 15, this.currentY + 6.5);

    this.currentY += 14;
  }

  // ============================================
  // BARRA DE PROGRESSO
  // ============================================
  private drawProgressBar(
    x: number,
    y: number,
    width: number,
    height: number,
    percentage: number,
    color: [number, number, number] = COLORS.primary,
  ): void {
    // Fundo
    this.doc.setFillColor(...COLORS.grayMedium);
    this.doc.roundedRect(x, y, width, height, height / 2, height / 2, "F");

    // Progresso
    if (percentage > 0) {
      const progressWidth = (width * Math.min(percentage, 100)) / 100;
      this.doc.setFillColor(...color);
      this.doc.roundedRect(
        x,
        y,
        progressWidth,
        height,
        height / 2,
        height / 2,
        "F",
      );
    }
  }

  // ============================================
  // RESUMO GERAL
  // ============================================
  private addResumoGeral(data: RelatorioData): void {
    this.addSectionTitle("Resumo Geral", "chart");

    const cardWidth = (this.contentWidth - 15) / 4;
    const startX = this.margin;

    // Primeira linha de cards
    this.addInfoCard(
      "Medicamentos",
      data.resumo.totalMedicamentos.toLocaleString("pt-BR"),
      startX,
      this.currentY,
      cardWidth,
      COLORS.primary,
      "pill",
    );
    this.addInfoCard(
      "Estoque Total",
      data.resumo.estoqueTotal.toLocaleString("pt-BR"),
      startX + cardWidth + 5,
      this.currentY,
      cardWidth,
      COLORS.success,
      "box",
    );
    this.addInfoCard(
      "Fornecedores",
      data.resumo.totalFornecedores.toLocaleString("pt-BR"),
      startX + (cardWidth + 5) * 2,
      this.currentY,
      cardWidth,
      COLORS.warning,
      "building",
    );
    this.addInfoCard(
      "Total de Lotes",
      data.resumo.totalLotes.toLocaleString("pt-BR"),
      startX + (cardWidth + 5) * 3,
      this.currentY,
      cardWidth,
      COLORS.gray,
    );

    this.currentY += 26;

    // Segunda linha - movimentações
    const cardWidth3 = (this.contentWidth - 10) / 3;

    // Card Entradas
    this.doc.setFillColor(...COLORS.successLight);
    this.doc.roundedRect(startX, this.currentY, cardWidth3, 22, 2, 2, "F");
    this.drawIcon(
      "arrow-down",
      startX + 4,
      this.currentY + 5,
      10,
      COLORS.success,
    );
    this.doc.setTextColor(...COLORS.success);
    this.doc.setFontSize(8);
    this.doc.setFont("helvetica", "bold");
    this.doc.text("ENTRADAS", startX + 18, this.currentY + 8);
    this.doc.setFontSize(12);
    this.doc.text(
      `+${data.resumo.totalEntradas.toLocaleString("pt-BR")}`,
      startX + 18,
      this.currentY + 15,
    );
    this.doc.setFontSize(7);
    this.doc.setFont("helvetica", "normal");
    this.doc.text(
      `${data.resumo.countEntradas} movimentacoes`,
      startX + 18,
      this.currentY + 20,
    );

    // Card Saídas
    this.doc.setFillColor(...COLORS.warningLight);
    this.doc.roundedRect(
      startX + cardWidth3 + 5,
      this.currentY,
      cardWidth3,
      22,
      2,
      2,
      "F",
    );
    this.drawIcon(
      "arrow-up",
      startX + cardWidth3 + 9,
      this.currentY + 5,
      10,
      COLORS.warning,
    );
    this.doc.setTextColor(...COLORS.warning);
    this.doc.setFontSize(8);
    this.doc.setFont("helvetica", "bold");
    this.doc.text("SAIDAS", startX + cardWidth3 + 23, this.currentY + 8);
    this.doc.setFontSize(12);
    this.doc.text(
      `-${data.resumo.totalSaidas.toLocaleString("pt-BR")}`,
      startX + cardWidth3 + 23,
      this.currentY + 15,
    );
    this.doc.setFontSize(7);
    this.doc.setFont("helvetica", "normal");
    this.doc.text(
      `${data.resumo.countSaidas} movimentacoes`,
      startX + cardWidth3 + 23,
      this.currentY + 20,
    );

    // Card Eliminações
    this.doc.setFillColor(...COLORS.dangerLight);
    this.doc.roundedRect(
      startX + (cardWidth3 + 5) * 2,
      this.currentY,
      cardWidth3,
      22,
      2,
      2,
      "F",
    );
    this.drawIcon(
      "trash",
      startX + (cardWidth3 + 5) * 2 + 4,
      this.currentY + 5,
      10,
      COLORS.danger,
    );
    this.doc.setTextColor(...COLORS.danger);
    this.doc.setFontSize(8);
    this.doc.setFont("helvetica", "bold");
    this.doc.text(
      "ELIMINACOES",
      startX + (cardWidth3 + 5) * 2 + 18,
      this.currentY + 8,
    );
    this.doc.setFontSize(12);
    this.doc.text(
      `-${data.resumo.totalEliminacoes.toLocaleString("pt-BR")}`,
      startX + (cardWidth3 + 5) * 2 + 18,
      this.currentY + 15,
    );
    this.doc.setFontSize(7);
    this.doc.setFont("helvetica", "normal");
    this.doc.text(
      `${data.resumo.countEliminacoes} registros`,
      startX + (cardWidth3 + 5) * 2 + 18,
      this.currentY + 20,
    );

    this.currentY += 28;

    // Alertas
    const totalAlertas =
      data.lotesVencidos.length +
      data.lotesProximosVencimento.length +
      data.estoqueBaixo.length;

    if (totalAlertas > 0) {
      this.addAlertBox(
        `${totalAlertas} alerta(s): ${data.lotesVencidos.length} vencido(s), ${data.lotesProximosVencimento.length} proximo(s) do vencimento, ${data.estoqueBaixo.length} com estoque baixo`,
        "danger",
      );
    } else {
      this.addAlertBox("Nenhum alerta ativo no momento", "success");
    }
  }

  // ============================================
  // ESTOQUE POR MEDICAMENTO
  // ============================================
  private addEstoquePorMedicamento(data: MedicamentoComLotes[]): void {
    this.addSectionTitle("Estoque por Medicamento", "pill");

    data.forEach((med, index) => {
      this.checkPageBreak(45);

      const totalEstoque = med.lotes.reduce(
        (acc, l) => acc + l.quantidadeAtual,
        0,
      );

      // Cabeçalho do medicamento
      this.doc.setFillColor(...COLORS.grayLight);
      this.doc.roundedRect(
        this.margin,
        this.currentY,
        this.contentWidth,
        14,
        2,
        2,
        "F",
      );

      // Número
      this.doc.setFillColor(...COLORS.primary);
      this.doc.roundedRect(
        this.margin + 2,
        this.currentY + 2,
        10,
        10,
        1,
        1,
        "F",
      );
      this.doc.setTextColor(...COLORS.white);
      this.doc.setFontSize(8);
      this.doc.setFont("helvetica", "bold");
      this.doc.text(String(index + 1), this.margin + 7, this.currentY + 8.5, {
        align: "center",
      });

      // Nome
      this.doc.setTextColor(...COLORS.dark);
      this.doc.setFontSize(10);
      this.doc.setFont("helvetica", "bold");
      this.doc.text(med.nome, this.margin + 16, this.currentY + 6);

      // Informações adicionais
      const infoText = [
        med.principioAtivo,
        med.formaFarmaceutica,
        med.concentracao,
      ]
        .filter(Boolean)
        .join(" | ");
      if (infoText) {
        this.doc.setFontSize(7);
        this.doc.setFont("helvetica", "normal");
        this.doc.setTextColor(...COLORS.gray);
        this.doc.text(
          infoText.substring(0, 60),
          this.margin + 16,
          this.currentY + 11,
        );
      }

      // Estoque total
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
        this.currentY + 8,
        { align: "right" },
      );

      this.currentY += 18;

      // Tabela de lotes
      if (med.lotes.length > 0) {
        const tableData = med.lotes.map((lote) => {
          const dias = diasParaVencer(lote.dataValidade);
          let status = "Valido";
          if (lote.quantidadeAtual === 0) status = "Esgotado";
          else if (dias < 0) status = "Vencido";
          else if (dias <= 30) status = `${dias}d`;

          return [
            lote.numeroLote,
            lote.fornecedor.nome.substring(0, 20),
            lote.quantidadeInicial.toString(),
            lote.quantidadeAtual.toString(),
            formatarData(lote.dataValidade),
            status,
          ];
        });

        autoTable(this.doc, {
          startY: this.currentY,
          head: [
            ["Lote", "Fornecedor", "Inicial", "Atual", "Validade", "Status"],
          ],
          body: tableData,
          margin: { left: this.margin, right: this.margin },
          styles: {
            fontSize: 8,
            cellPadding: 2,
            lineColor: COLORS.grayMedium,
            lineWidth: 0.1,
          },
          headStyles: {
            fillColor: COLORS.primary,
            textColor: COLORS.white,
            fontStyle: "bold",
            halign: "center",
          },
          alternateRowStyles: {
            fillColor: COLORS.grayLight,
          },
          columnStyles: {
            0: { fontStyle: "bold", cellWidth: 28 },
            1: { cellWidth: 40 },
            2: { halign: "center", cellWidth: 18 },
            3: { halign: "center", cellWidth: 18, fontStyle: "bold" },
            4: { halign: "center", cellWidth: 24 },
            5: { halign: "center", cellWidth: 20 },
          },
          didParseCell: (hookData) => {
            if (hookData.section === "body" && hookData.column.index === 5) {
              const status = hookData.cell.raw as string;
              if (status === "Vencido" || status === "Esgotado") {
                hookData.cell.styles.textColor = COLORS.danger;
                hookData.cell.styles.fontStyle = "bold";
              } else if (status.includes("d")) {
                hookData.cell.styles.textColor = COLORS.warning;
                hookData.cell.styles.fontStyle = "bold";
              } else {
                hookData.cell.styles.textColor = COLORS.success;
              }
            }
            if (hookData.section === "body" && hookData.column.index === 3) {
              const qtd = parseInt(hookData.cell.raw as string);
              if (qtd === 0) {
                hookData.cell.styles.textColor = COLORS.danger;
              } else if (qtd <= 10) {
                hookData.cell.styles.textColor = COLORS.warning;
              }
            }
          },
        });

        this.currentY = (this.doc as any).lastAutoTable.finalY + 8;
      } else {
        this.doc.setTextColor(...COLORS.gray);
        this.doc.setFontSize(8);
        this.doc.setFont("helvetica", "italic");
        this.doc.text(
          "Nenhum lote registrado para este medicamento",
          this.margin + 4,
          this.currentY,
        );
        this.currentY += 10;
      }
    });

    if (data.length === 0) {
      this.addAlertBox("Nenhum medicamento encontrado", "info");
    }
  }

  // ============================================
  // MOVIMENTAÇÕES
  // ============================================
  private addMovimentacoes(data: Movimentacao[], resumo: ResumoData): void {
    this.addSectionTitle("Movimentacoes", "box");

    // Resumo rápido
    this.doc.setFontSize(9);
    this.doc.setFont("helvetica", "normal");

    this.drawIcon(
      "arrow-down",
      this.margin,
      this.currentY - 1,
      6,
      COLORS.success,
    );
    this.doc.setTextColor(...COLORS.success);
    this.doc.text(
      `Entradas: +${resumo.totalEntradas.toLocaleString("pt-BR")} (${resumo.countEntradas} mov.)`,
      this.margin + 8,
      this.currentY + 3,
    );

    this.drawIcon(
      "arrow-up",
      this.margin + 70,
      this.currentY - 1,
      6,
      COLORS.warning,
    );
    this.doc.setTextColor(...COLORS.warning);
    this.doc.text(
      `Saidas: -${resumo.totalSaidas.toLocaleString("pt-BR")} (${resumo.countSaidas} mov.)`,
      this.margin + 78,
      this.currentY + 3,
    );

    this.currentY += 8;

    if (data.length > 0) {
      const tableData = data.map((mov) => [
        formatarDataHora(mov.dataMovimentacao),
        mov.tipoMovimentacao === "ENTRADA" ? "Entrada" : "Saida",
        mov.lote.medicamento.nome.substring(0, 25),
        mov.lote.numeroLote,
        `${mov.tipoMovimentacao === "ENTRADA" ? "+" : "-"}${mov.quantidade}`,
        (mov.user.name || mov.user.email).substring(0, 18),
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
          lineColor: COLORS.grayMedium,
          lineWidth: 0.1,
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
          0: { cellWidth: 30 },
          1: { cellWidth: 18 },
          2: { cellWidth: 45 },
          3: { cellWidth: 25 },
          4: { halign: "center", fontStyle: "bold", cellWidth: 15 },
          5: { cellWidth: 35 },
        },
        didParseCell: (hookData) => {
          if (hookData.section === "body" && hookData.column.index === 1) {
            const tipo = hookData.cell.raw as string;
            if (tipo === "Entrada") {
              hookData.cell.styles.textColor = COLORS.success;
              hookData.cell.styles.fontStyle = "bold";
            } else {
              hookData.cell.styles.textColor = COLORS.warning;
              hookData.cell.styles.fontStyle = "bold";
            }
          }
          if (hookData.section === "body" && hookData.column.index === 4) {
            const qtd = hookData.cell.raw as string;
            if (qtd.startsWith("+")) {
              hookData.cell.styles.textColor = COLORS.success;
            } else {
              hookData.cell.styles.textColor = COLORS.warning;
            }
          }
        },
      });

      this.currentY = (this.doc as any).lastAutoTable.finalY + 8;
    } else {
      this.addAlertBox("Nenhuma movimentacao encontrada no periodo", "info");
    }
  }

  // ============================================
  // ELIMINAÇÕES
  // ============================================
  private addEliminacoes(data: Eliminacao[], resumo: ResumoData): void {
    this.addSectionTitle("Eliminacoes", "trash");

    this.addAlertBox(
      `Total eliminado: ${resumo.totalEliminacoes.toLocaleString("pt-BR")} unidades em ${resumo.countEliminacoes} registro(s)`,
      "danger",
    );

    if (data.length > 0) {
      const tableData = data.map((elim) => [
        formatarDataHora(elim.dataEliminacao),
        elim.lote.medicamento.nome.substring(0, 25),
        elim.lote.numeroLote,
        `-${elim.quantidade}`,
        elim.motivo.substring(0, 25),
        (elim.user.name || elim.user.email).substring(0, 18),
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
          lineColor: COLORS.grayMedium,
          lineWidth: 0.1,
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
          0: { cellWidth: 30 },
          2: { cellWidth: 25 },
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
      this.addAlertBox("Nenhuma eliminacao registrada no periodo", "success");
    }
  }

  // ============================================
  // ALERTAS
  // ============================================
  private addAlertas(data: RelatorioData): void {
    this.addSectionTitle("Painel de Alertas", "alert");

    // LOTES VENCIDOS
    this.checkPageBreak(25);

    // Cabeçalho da subseção
    this.doc.setFillColor(...COLORS.dangerLight);
    this.doc.roundedRect(
      this.margin,
      this.currentY,
      this.contentWidth,
      10,
      2,
      2,
      "F",
    );
    this.doc.setFillColor(...COLORS.danger);
    this.doc.roundedRect(this.margin, this.currentY, 3, 10, 1, 1, "F");
    this.drawIcon("x", this.margin + 5, this.currentY + 1.5, 7, COLORS.danger);
    this.doc.setTextColor(...COLORS.danger);
    this.doc.setFontSize(10);
    this.doc.setFont("helvetica", "bold");
    this.doc.text(
      `Lotes Vencidos (${data.lotesVencidos.length})`,
      this.margin + 15,
      this.currentY + 6.5,
    );
    this.currentY += 14;

    if (data.lotesVencidos.length > 0) {
      const tableData = data.lotesVencidos.map((lote) => {
        const dias = Math.abs(diasParaVencer(lote.dataValidade));
        return [
          lote.medicamento.nome.substring(0, 25),
          lote.numeroLote,
          lote.fornecedor.nome.substring(0, 20),
          lote.quantidadeAtual.toString(),
          formatarData(lote.dataValidade),
          `${dias}d`,
        ];
      });

      autoTable(this.doc, {
        startY: this.currentY,
        head: [
          ["Medicamento", "Lote", "Fornecedor", "Qtd.", "Venceu em", "Dias"],
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
          3: { halign: "center", fontStyle: "bold", textColor: COLORS.danger },
          4: { halign: "center" },
          5: { halign: "center", fontStyle: "bold", textColor: COLORS.danger },
        },
      });

      this.currentY = (this.doc as any).lastAutoTable.finalY + 10;
    } else {
      this.addAlertBox("Nenhum lote vencido com estoque", "success");
    }

    // PRÓXIMOS DO VENCIMENTO
    this.checkPageBreak(25);

    this.doc.setFillColor(...COLORS.warningLight);
    this.doc.roundedRect(
      this.margin,
      this.currentY,
      this.contentWidth,
      10,
      2,
      2,
      "F",
    );
    this.doc.setFillColor(...COLORS.warning);
    this.doc.roundedRect(this.margin, this.currentY, 3, 10, 1, 1, "F");
    this.drawIcon(
      "clock",
      this.margin + 5,
      this.currentY + 1.5,
      7,
      COLORS.warning,
    );
    this.doc.setTextColor(...COLORS.warning);
    this.doc.setFontSize(10);
    this.doc.setFont("helvetica", "bold");
    this.doc.text(
      `Proximos do Vencimento - 30 dias (${data.lotesProximosVencimento.length})`,
      this.margin + 15,
      this.currentY + 6.5,
    );
    this.currentY += 14;

    if (data.lotesProximosVencimento.length > 0) {
      const tableData = data.lotesProximosVencimento.map((lote) => {
        const dias = diasParaVencer(lote.dataValidade);
        return [
          lote.medicamento.nome.substring(0, 25),
          lote.numeroLote,
          lote.fornecedor.nome.substring(0, 20),
          lote.quantidadeAtual.toString(),
          formatarData(lote.dataValidade),
          `${dias}d`,
        ];
      });

      autoTable(this.doc, {
        startY: this.currentY,
        head: [
          ["Medicamento", "Lote", "Fornecedor", "Qtd.", "Validade", "Restam"],
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
        didParseCell: (hookData) => {
          if (hookData.section === "body" && hookData.column.index === 5) {
            const diasStr = hookData.cell.raw as string;
            const dias = parseInt(diasStr);
            if (dias <= 7) {
              hookData.cell.styles.textColor = COLORS.danger;
            } else if (dias <= 15) {
              hookData.cell.styles.textColor = COLORS.warning;
            } else {
              hookData.cell.styles.textColor = COLORS.yellow;
            }
          }
        },
      });

      this.currentY = (this.doc as any).lastAutoTable.finalY + 10;
    } else {
      this.addAlertBox("Nenhum lote proximo do vencimento", "success");
    }

    // ESTOQUE BAIXO
    this.checkPageBreak(25);

    this.doc.setFillColor(...COLORS.yellowLight);
    this.doc.roundedRect(
      this.margin,
      this.currentY,
      this.contentWidth,
      10,
      2,
      2,
      "F",
    );
    this.doc.setFillColor(...COLORS.yellow);
    this.doc.roundedRect(this.margin, this.currentY, 3, 10, 1, 1, "F");
    this.drawIcon(
      "alert",
      this.margin + 5,
      this.currentY + 1.5,
      7,
      COLORS.yellow,
    );
    this.doc.setTextColor(...COLORS.yellow);
    this.doc.setFontSize(10);
    this.doc.setFont("helvetica", "bold");
    this.doc.text(
      `Estoque Baixo - 10 unidades ou menos (${data.estoqueBaixo.length})`,
      this.margin + 15,
      this.currentY + 6.5,
    );
    this.currentY += 14;

    if (data.estoqueBaixo.length > 0) {
      const tableData = data.estoqueBaixo.map((lote) => {
        const consumo = lote.quantidadeInicial - lote.quantidadeAtual;
        const percentual = Math.round((consumo / lote.quantidadeInicial) * 100);
        return [
          lote.medicamento.nome.substring(0, 25),
          lote.numeroLote,
          lote.fornecedor.nome.substring(0, 20),
          lote.quantidadeInicial.toString(),
          lote.quantidadeAtual.toString(),
          `${percentual}%`,
        ];
      });

      autoTable(this.doc, {
        startY: this.currentY,
        head: [
          ["Medicamento", "Lote", "Fornecedor", "Inicial", "Atual", "Consumo"],
        ],
        body: tableData,
        margin: { left: this.margin, right: this.margin },
        styles: { fontSize: 8, cellPadding: 2 },
        headStyles: {
          fillColor: COLORS.yellow,
          textColor: COLORS.dark,
          fontStyle: "bold",
        },
        alternateRowStyles: { fillColor: COLORS.yellowLight },
        columnStyles: {
          3: { halign: "center" },
          4: { halign: "center", fontStyle: "bold", textColor: COLORS.warning },
          5: { halign: "center", fontStyle: "bold" },
        },
      });

      this.currentY = (this.doc as any).lastAutoTable.finalY + 8;
    } else {
      this.addAlertBox("Todos os lotes com estoque adequado", "success");
    }
  }

  // ============================================
  // FORNECEDORES
  // ============================================
  private addFornecedores(data: FornecedorComLotes[]): void {
    this.addSectionTitle("Relatorio por Fornecedor", "building");

    data.forEach((forn, index) => {
      this.checkPageBreak(30);

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

      // Card do fornecedor
      this.doc.setFillColor(...COLORS.primaryLight);
      this.doc.roundedRect(
        this.margin,
        this.currentY,
        this.contentWidth,
        28,
        2,
        2,
        "F",
      );

      // Número
      this.doc.setFillColor(...COLORS.primary);
      this.doc.roundedRect(
        this.margin + 3,
        this.currentY + 3,
        10,
        10,
        1,
        1,
        "F",
      );
      this.doc.setTextColor(...COLORS.white);
      this.doc.setFontSize(8);
      this.doc.setFont("helvetica", "bold");
      this.doc.text(String(index + 1), this.margin + 8, this.currentY + 9.5, {
        align: "center",
      });

      // Nome do fornecedor
      this.doc.setTextColor(...COLORS.dark);
      this.doc.setFontSize(11);
      this.doc.setFont("helvetica", "bold");
      this.doc.text(forn.nome, this.margin + 17, this.currentY + 8);

      // Info
      this.doc.setFontSize(7);
      this.doc.setFont("helvetica", "normal");
      this.doc.setTextColor(...COLORS.gray);
      this.doc.text(
        `${forn.lotes.length} lote(s) | Inicial: ${totalInicial.toLocaleString("pt-BR")} | Atual: ${totalAtual.toLocaleString("pt-BR")}`,
        this.margin + 17,
        this.currentY + 13,
      );

      // Barra de progresso
      this.drawProgressBar(
        this.margin + 17,
        this.currentY + 16,
        60,
        3,
        percentualConsumo,
        COLORS.primary,
      );
      this.doc.setFontSize(7);
      this.doc.setTextColor(...COLORS.primary);
      this.doc.text(
        `${percentualConsumo}% consumido`,
        this.margin + 80,
        this.currentY + 18.5,
      );

      // Medicamentos
      if (medicamentosUnicos.length > 0) {
        this.doc.setFontSize(6);
        this.doc.setTextColor(...COLORS.gray);
        const medsText = `Medicamentos: ${medicamentosUnicos.join(", ").substring(0, 80)}`;
        this.doc.text(medsText, this.margin + 17, this.currentY + 24);
      }

      // Estoque atual (lado direito)
      this.doc.setTextColor(...COLORS.primary);
      this.doc.setFontSize(14);
      this.doc.setFont("helvetica", "bold");
      this.doc.text(
        totalAtual.toLocaleString("pt-BR"),
        this.pageWidth - this.margin - 5,
        this.currentY + 12,
        { align: "right" },
      );
      this.doc.setFontSize(7);
      this.doc.setFont("helvetica", "normal");
      this.doc.text(
        "em estoque",
        this.pageWidth - this.margin - 5,
        this.currentY + 17,
        { align: "right" },
      );

      this.currentY += 33;
    });

    if (data.length === 0) {
      this.addAlertBox("Nenhum fornecedor encontrado", "info");
    }
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
    }

    return partes.join(" | ") || "Todos os dados";
  }

  // ============================================
  // MÉTODOS PÚBLICOS DE GERAÇÃO
  // ============================================
  public gerarRelatorioCompleto(data: RelatorioData): void {
    const subtitulo = this.buildSubtitulo(data.filtros);
    this.addHeader("Relatorio Completo de Estoque", subtitulo);

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

    const totalAlertas =
      data.lotesVencidos.length +
      data.lotesProximosVencimento.length +
      data.estoqueBaixo.length;

    if (totalAlertas > 0) {
      this.addSectionTitle("Resumo de Alertas", "alert");

      const alertaData = [
        [
          "Lotes Vencidos",
          data.lotesVencidos.length.toString(),
          "Acao imediata necessaria",
        ],
        [
          "Proximos do Vencimento",
          data.lotesProximosVencimento.length.toString(),
          "Nos proximos 30 dias",
        ],
        [
          "Estoque Baixo",
          data.estoqueBaixo.length.toString(),
          "10 unidades ou menos",
        ],
      ];

      autoTable(this.doc, {
        startY: this.currentY,
        head: [["Tipo de Alerta", "Quantidade", "Descricao"]],
        body: alertaData,
        margin: { left: this.margin, right: this.margin },
        styles: { fontSize: 9, cellPadding: 3 },
        headStyles: { fillColor: COLORS.danger, textColor: COLORS.white },
        columnStyles: { 1: { halign: "center", fontStyle: "bold" } },
      });

      this.currentY = (this.doc as any).lastAutoTable.finalY + 8;
    }

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
    this.addHeader("Relatorio de Alertas", subtitulo);
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
// FUNÇÃO HELPER PARA USO SIMPLIFICADO
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

// ============================================
// EXPORTAR PARA USO ASSÍNCRONO
// ============================================
export async function gerarPDFAsync(
  data: RelatorioData,
  tipo: TipoRelatorio = "completo",
  opcoes?: {
    nomeEmpresa?: string;
  },
): Promise<Blob> {
  return new Promise((resolve) => {
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

    resolve(pdf.getBlob());
  });
}
