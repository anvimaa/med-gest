import { prisma } from "$lib/server/prisma";
import type { LoteInput } from "$lib/schemas/lote";

export interface ServiceResult {
  success: boolean;
  message?: string;
  data?: any;
}

export async function getLotes() {
  return await prisma.lote.findMany({
    include: {
      medicamento: true,
      fornecedor: true,
    },
    orderBy: { dataValidade: 'asc' }
  });
}

export async function getLoteById(id: string) {
  return await prisma.lote.findUnique({
    where: { id },
    include: {
      medicamento: true,
      fornecedor: true,
    }
  });
}

export async function createLote(data: LoteInput): Promise<ServiceResult> {
  try {
    const lote = await prisma.lote.create({
      data,
    });
    return { success: true, data: lote };
  } catch (err: any) {
    console.error(err);
    return { success: false, message: "Erro ao criar lote" };
  }
}

export async function updateLote(id: string, data: LoteInput): Promise<ServiceResult> {
  try {
    await prisma.lote.update({
      where: { id },
      data,
    });
    return { success: true };
  } catch (err: any) {
    console.error(err);
    return { success: false, message: "Erro ao atualizar lote" };
  }
}

export async function deleteLote(id: string): Promise<ServiceResult> {
  try {
    const movimentacoesCount = await prisma.movimentacao.count({
      where: { loteId: id },
    });
    const eliminacoesCount = await prisma.eliminacao.count({
      where: { loteId: id },
    });

    if (movimentacoesCount > 0 || eliminacoesCount > 0) {
      return {
        success: false,
        message: "Não é possível apagar um lote que possui movimentações ou eliminações associadas",
      };
    }

    await prisma.lote.delete({
      where: { id },
    });
    return { success: true };
  } catch (_err) {
    return { success: false, message: "Erro ao apagar lote" };
  }
}
