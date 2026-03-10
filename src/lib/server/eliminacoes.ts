import { prisma } from "$lib/server/prisma";
import type { EliminacaoInput } from "$lib/schemas/eliminacao";

export interface ServiceResult {
  success: boolean;
  message?: string;
  data?: any;
}

export async function getEliminacoes() {
  return await prisma.eliminacao.findMany({
    include: {
      lote: {
        include: {
          medicamento: true
        }
      },
      user: true,
    },
    orderBy: { dataEliminacao: 'desc' }
  });
}

export async function createEliminacao(data: EliminacaoInput): Promise<ServiceResult> {
  try {
    return await prisma.$transaction(async (tx) => {
      const lote = await tx.lote.findUnique({
        where: { id: data.loteId }
      });

      if (!lote) return { success: false, message: "Lote não encontrado" };

      if (lote.quantidadeAtual < data.quantidade) {
        return { success: false, message: "Quantidade insuficiente para eliminar" };
      }

      await tx.lote.update({
        where: { id: data.loteId },
        data: { quantidadeAtual: lote.quantidadeAtual - data.quantidade }
      });

      const eliminacao = await tx.eliminacao.create({
        data,
      });

      // Also record as a movement for robust history
      await tx.movimentacao.create({
        data: {
          tipoMovimentacao: "SAIDA",
          quantidade: data.quantidade,
          loteId: data.loteId,
          userId: data.userId,
        }
      });

      return { success: true, data: eliminacao };
    });
  } catch (err: any) {
    console.error(err);
    return { success: false, message: "Erro ao registar eliminação e movimento" };
  }
}
