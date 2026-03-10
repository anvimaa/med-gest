import { prisma } from "$lib/server/prisma";
import type { FornecedorInput } from "$lib/schemas/fornecedor";

export interface ServiceResult {
  success: boolean;
  message?: string;
  data?: any;
}

export async function getFornecedores() {
  return await prisma.fornecedor.findMany({
    orderBy: { nome: 'asc' }
  });
}

export async function getFornecedorById(id: string) {
  return await prisma.fornecedor.findUnique({
    where: { id }
  });
}

export async function createFornecedor(data: FornecedorInput): Promise<ServiceResult> {
  try {
    const fornecedor = await prisma.fornecedor.create({
      data,
    });
    return { success: true, data: fornecedor };
  } catch (err: any) {
    return { success: false, message: "Erro ao criar fornecedor", data };
  }
}

export async function updateFornecedor(id: string, data: FornecedorInput): Promise<ServiceResult> {
  try {
    await prisma.fornecedor.update({
      where: { id },
      data,
    });
    return { success: true };
  } catch (err: any) {
    return { success: false, message: "Erro ao atualizar fornecedor", data };
  }
}

export async function deleteFornecedor(id: string): Promise<ServiceResult> {
  try {
    const lotesCount = await prisma.lote.count({
      where: { fornecedorId: id },
    });

    if (lotesCount > 0) {
      return {
        success: false,
        message: "Não é possível apagar um fornecedor que possui lotes associados",
      };
    }

    await prisma.fornecedor.delete({
      where: { id },
    });
    return { success: true };
  } catch (_err) {
    return { success: false, message: "Erro ao apagar fornecedor" };
  }
}
