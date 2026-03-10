import { prisma } from "$lib/server/prisma";
import type { MedicamentoInput } from "$lib/schemas/medicamento";

export interface ServiceResult {
  success: boolean;
  message?: string;
  data?: any;
}

export async function createMedicamento(data: MedicamentoInput): Promise<ServiceResult> {
  try {
    await prisma.medicamento.create({
      data,
    });
    return { success: true };
  } catch (err: any) {
    if (
      typeof err === "object" &&
      err !== null &&
      "code" in err &&
      err.code === "P2002"
    ) {
      return {
        success: false,
        message: "Já existe um medicamento com este código de barras",
        data,
      };
    }
    return { success: false, message: "Erro ao criar medicamento", data };
  }
}

export async function updateMedicamento(id: string, data: MedicamentoInput): Promise<ServiceResult> {
  try {
    await prisma.medicamento.update({
      where: { id },
      data,
    });
    return { success: true };
  } catch (err: any) {
    if (
      typeof err === "object" &&
      err !== null &&
      "code" in err &&
      err.code === "P2002"
    ) {
      return {
        success: false,
        message: "Já existe um medicamento com este código de barras",
        data,
      };
    }
    return { success: false, message: "Erro ao atualizar medicamento", data };
  }
}

export async function deleteMedicamento(id: string): Promise<ServiceResult> {
  try {
    const batchCount = await prisma.lote.count({
      where: { medicamentoId: id },
    });

    if (batchCount > 0) {
      return {
        success: false,
        message: "Não é possível apagar um medicamento que possui lotes associados",
      };
    }

    await prisma.medicamento.delete({
      where: { id },
    });
    return { success: true };
  } catch (_err) {
    return { success: false, message: "Erro ao apagar medicamento" };
  }
}
