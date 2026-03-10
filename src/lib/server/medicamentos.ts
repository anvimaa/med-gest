import { prisma } from "$lib/server/prisma";
import { medicamentoSchema } from "$lib/schemas/medicamento";

export interface ServiceResult {
  success: boolean;
  message?: string;
  errors?: Record<string, string[]>;
  data?: any;
}

export async function createMedicamento(formData: FormData): Promise<ServiceResult> {
  const data = Object.fromEntries(formData);
  const result = medicamentoSchema.safeParse(data);

  if (!result.success) {
    const errors = result.error.flatten().fieldErrors;
    return { success: false, errors: errors as Record<string, string[]>, data };
  }

  try {
    await prisma.medicamento.create({
      data: result.data,
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

export async function updateMedicamento(id: string, formData: FormData): Promise<ServiceResult> {
  const data = Object.fromEntries(formData);
  const result = medicamentoSchema.safeParse(data);

  if (!result.success) {
    const errors = result.error.flatten().fieldErrors;
    return { success: false, errors: errors as Record<string, string[]>, data };
  }

  try {
    await prisma.medicamento.update({
      where: { id },
      data: result.data,
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
