import { prisma } from "$lib/server/prisma";
import type { MovimentacaoInput } from "$lib/schemas/movimentacao";

export interface ServiceResult {
  success: boolean;
  message?: string;
  data?: any;
}

export async function getMovimentacoes() {
  return await prisma.movimentacao.findMany({
    include: {
      lote: {
        include: {
          medicamento: true
        }
      },
      user: true,
    },
    orderBy: { dataMovimentacao: 'desc' }
  });
}

export async function createMovimentacao(data: MovimentacaoInput): Promise<ServiceResult> {
  try {
    return await prisma.$transaction(async (tx) => {
      const lote = await tx.lote.findUnique({
        where: { id: data.loteId }
      });

      if (!lote) return { success: false, message: "Lote não encontrado" };

      if (data.tipoMovimentacao === "SAIDA" && lote.quantidadeAtual < data.quantidade) {
        return { success: false, message: "Quantidade insuficiente em stock" };
      }

      const novaQuantidade = data.tipoMovimentacao === "ENTRADA" 
        ? lote.quantidadeAtual + data.quantidade 
        : lote.quantidadeAtual - data.quantidade;

      await tx.lote.update({
        where: { id: data.loteId },
        data: { quantidadeAtual: novaQuantidade }
      });

      const movimentacao = await tx.movimentacao.create({
        data,
      });

      return { success: true, data: movimentacao };
    });
  } catch (err: any) {
    console.error(err);
    return { success: false, message: "Erro ao registar movimentação" };
  }
}
