import type { PageServerLoad } from "./$types";
import { prisma } from "$lib/server/prisma";

export const load: PageServerLoad = async ({ url }) => {
  const dataInicio = url.searchParams.get("dataInicio");
  const dataFim = url.searchParams.get("dataFim");
  const tipoRelatorio = url.searchParams.get("tipo") || "geral";
  const medicamentoId = url.searchParams.get("medicamentoId") || "";
  const fornecedorId = url.searchParams.get("fornecedorId") || "";

  // Filtros de data
  const filtroData: { gte?: Date; lte?: Date } = {};
  if (dataInicio) filtroData.gte = new Date(dataInicio);
  if (dataFim) filtroData.lte = new Date(dataFim + "T23:59:59.999Z");

  // ============================================
  // RESUMO GERAL
  // ============================================
  const totalMedicamentos = await prisma.medicamento.count();
  const totalFornecedores = await prisma.fornecedor.count();
  const totalLotes = await prisma.lote.count();

  const estoqueTotal = await prisma.lote.aggregate({
    _sum: { quantidadeAtual: true },
  });

  // ============================================
  // MEDICAMENTOS COM ESTOQUE BAIXO (< 10 unidades)
  // ============================================
  const estoqueBaixo = await prisma.lote.findMany({
    where: {
      quantidadeAtual: { gt: 0, lte: 10 },
    },
    include: {
      medicamento: true,
      fornecedor: true,
    },
    orderBy: { quantidadeAtual: "asc" },
  });

  // ============================================
  // LOTES VENCIDOS
  // ============================================
  const lotesVencidos = await prisma.lote.findMany({
    where: {
      dataValidade: { lt: new Date() },
      quantidadeAtual: { gt: 0 },
    },
    include: {
      medicamento: true,
      fornecedor: true,
    },
    orderBy: { dataValidade: "asc" },
  });

  // ============================================
  // LOTES PRÓXIMOS DO VENCIMENTO (30 dias)
  // ============================================
  const dataLimite = new Date();
  dataLimite.setDate(dataLimite.getDate() + 30);

  const lotesProximosVencimento = await prisma.lote.findMany({
    where: {
      dataValidade: {
        gte: new Date(),
        lte: dataLimite,
      },
      quantidadeAtual: { gt: 0 },
    },
    include: {
      medicamento: true,
      fornecedor: true,
    },
    orderBy: { dataValidade: "asc" },
  });

  // ============================================
  // MOVIMENTAÇÕES (com filtros)
  // ============================================
  const whereMovimentacao: any = {};
  if (dataInicio || dataFim) {
    whereMovimentacao.dataMovimentacao = filtroData;
  }
  if (medicamentoId) {
    whereMovimentacao.lote = { medicamentoId };
  }

  const movimentacoes = await prisma.movimentacao.findMany({
    where: whereMovimentacao,
    include: {
      lote: {
        include: {
          medicamento: true,
        },
      },
      user: {
        select: { name: true, email: true },
      },
    },
    orderBy: { dataMovimentacao: "desc" },
    take: 50,
  });

  // Totais de movimentação por tipo
  const entradasAggregate = await prisma.movimentacao.aggregate({
    where: {
      ...whereMovimentacao,
      tipoMovimentacao: "ENTRADA",
    },
    _sum: { quantidade: true },
    _count: true,
  });

  const saidasAggregate = await prisma.movimentacao.aggregate({
    where: {
      ...whereMovimentacao,
      tipoMovimentacao: "SAIDA",
    },
    _sum: { quantidade: true },
    _count: true,
  });

  // ============================================
  // ELIMINAÇÕES (com filtros)
  // ============================================
  const whereEliminacao: any = {};
  if (dataInicio || dataFim) {
    whereEliminacao.dataEliminacao = filtroData;
  }
  if (medicamentoId) {
    whereEliminacao.lote = { medicamentoId };
  }

  const eliminacoes = await prisma.eliminacao.findMany({
    where: whereEliminacao,
    include: {
      lote: {
        include: {
          medicamento: true,
        },
      },
      user: {
        select: { name: true, email: true },
      },
    },
    orderBy: { dataEliminacao: "desc" },
    take: 50,
  });

  const eliminacoesAggregate = await prisma.eliminacao.aggregate({
    where: whereEliminacao,
    _sum: { quantidade: true },
    _count: true,
  });

  // ============================================
  // ESTOQUE POR MEDICAMENTO
  // ============================================
  const estoquePorMedicamento = await prisma.medicamento.findMany({
    where: medicamentoId ? { id: medicamentoId } : undefined,
    include: {
      lotes: {
        select: {
          id: true,
          numeroLote: true,
          quantidadeAtual: true,
          quantidadeInicial: true,
          dataValidade: true,
          dataEntrada: true,
          fornecedor: {
            select: { nome: true },
          },
        },
        orderBy: { dataValidade: "asc" },
      },
    },
    orderBy: { nome: "asc" },
  });

  // ============================================
  // ESTOQUE POR FORNECEDOR
  // ============================================
  const estoquePorFornecedor = await prisma.fornecedor.findMany({
    where: fornecedorId ? { id: fornecedorId } : undefined,
    include: {
      lotes: {
        select: {
          quantidadeAtual: true,
          quantidadeInicial: true,
          medicamento: {
            select: { nome: true },
          },
        },
      },
    },
    orderBy: { nome: "asc" },
  });

  // ============================================
  // LISTAS PARA FILTROS
  // ============================================
  const medicamentos = await prisma.medicamento.findMany({
    select: { id: true, nome: true },
    orderBy: { nome: "asc" },
  });

  const fornecedores = await prisma.fornecedor.findMany({
    select: { id: true, nome: true },
    orderBy: { nome: "asc" },
  });

  return {
    // Resumo
    resumo: {
      totalMedicamentos,
      totalFornecedores,
      totalLotes,
      estoqueTotal: estoqueTotal._sum.quantidadeAtual || 0,
      totalEntradas: entradasAggregate._sum.quantidade || 0,
      totalSaidas: saidasAggregate._sum.quantidade || 0,
      totalEliminacoes: eliminacoesAggregate._sum.quantidade || 0,
      countEntradas: entradasAggregate._count || 0,
      countSaidas: saidasAggregate._count || 0,
      countEliminacoes: eliminacoesAggregate._count || 0,
    },
    // Alertas
    estoqueBaixo,
    lotesVencidos,
    lotesProximosVencimento,
    // Dados detalhados
    movimentacoes,
    eliminacoes,
    estoquePorMedicamento,
    estoquePorFornecedor,
    // Filtros
    filtros: {
      dataInicio: dataInicio || "",
      dataFim: dataFim || "",
      tipoRelatorio,
      medicamentoId,
      fornecedorId,
    },
    medicamentos,
    fornecedores,
  };
};
