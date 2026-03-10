import { prisma } from "$lib/server/prisma";
import { fail, redirect } from "@sveltejs/kit";
import { medicamentoSchema } from "$lib/schemas/medicamento";

export async function createMedicamento(formData: FormData) {
  const data = Object.fromEntries(formData);
  const result = medicamentoSchema.safeParse(data);

  if (!result.success) {
    const errors = result.error.flatten().fieldErrors;
    return fail(400, { errors, data });
  }

  try {
    await prisma.medicamento.create({
      data: result.data,
    });
  } catch (err: any) {
    if (
      typeof err === "object" &&
      err !== null &&
      "code" in err &&
      err.code === "P2002"
    ) {
      return fail(400, {
        message: "Já existe um medicamento com este código de barras",
        data,
      });
    }
    return fail(500, { message: "Erro ao criar medicamento", data });
  }

  throw redirect(303, "/medicamentos");
}

export async function updateMedicamento(id: string, formData: FormData) {
  const data = Object.fromEntries(formData);
  const result = medicamentoSchema.safeParse(data);

  if (!result.success) {
    const errors = result.error.flatten().fieldErrors;
    return fail(400, { errors, data });
  }

  try {
    await prisma.medicamento.update({
      where: { id },
      data: result.data,
    });
  } catch (err: any) {
    if (
      typeof err === "object" &&
      err !== null &&
      "code" in err &&
      err.code === "P2002"
    ) {
      return fail(400, {
        message: "Já existe um medicamento com este código de barras",
        data,
      });
    }
    return fail(500, { message: "Erro ao atualizar medicamento", data });
  }

  throw redirect(303, "/medicamentos");
}

export async function deleteMedicamento(id: string) {
  try {
    // Check if there are batches linked to this medication
    const batchCount = await prisma.lote.count({
      where: { medicamentoId: id },
    });

    if (batchCount > 0) {
      return fail(400, {
        message:
          "Não é possível apagar um medicamento que possui lotes associados",
      });
    }

    await prisma.medicamento.delete({
      where: { id },
    });
  } catch (_err) {
    return fail(500, { message: "Erro ao apagar medicamento" });
  }

  return { success: true };
}
