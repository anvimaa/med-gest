import { getLoteById, updateLote } from "$lib/server/lotes";
import { prisma } from "$lib/server/prisma";
import { error, fail } from "@sveltejs/kit";
import { loteSchema } from "$lib/schemas/lote";
import type { PageServerLoad, Actions } from "./$types";

export const load: PageServerLoad = async ({ params }) => {
  const [lote, medicamentos, fornecedores] = await Promise.all([
    getLoteById(params.id),
    prisma.medicamento.findMany({ orderBy: { nome: "asc" } }),
    prisma.fornecedor.findMany({ orderBy: { nome: "asc" } }),
  ]);

  if (!lote) throw error(404, "Lote não encontrado");

  return { 
    lote,
    medicamentos,
    fornecedores
  };
};

export const actions: Actions = {
  default: async ({ params, request }) => {
    const formData = await request.formData();
    const data = Object.fromEntries(formData);

    const result = loteSchema.safeParse(data);
    if (!result.success) {
      return fail(400, { error: result.error.issues[0].message, data });
    }

    const serviceResult = await updateLote(params.id, result.data);
    if (!serviceResult.success) {
      return fail(400, { error: serviceResult.message, data });
    }

    return serviceResult;
  },
};
