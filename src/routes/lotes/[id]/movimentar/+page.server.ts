import { getLoteById } from "$lib/server/lotes";
import { createMovimentacao } from "$lib/server/movimentacoes";
import { error, fail } from "@sveltejs/kit";
import { movimentacaoSchema } from "$lib/schemas/movimentacao";
import type { PageServerLoad, Actions } from "./$types";

export const load: PageServerLoad = async ({ params }) => {
  const lote = await getLoteById(params.id);
  if (!lote) throw error(404, "Lote não encontrado");
  return { lote };
};

export const actions: Actions = {
  default: async ({ params, request, locals }) => {
    const formData = await request.formData();
    const data = Object.fromEntries(formData);

    // Add hidden fields
    const payload = {
      ...data,
      loteId: params.id,
      userId: locals.user!.id,
    };

    const result = movimentacaoSchema.safeParse(payload);
    if (!result.success) {
      return fail(400, { message: result.error.issues[0].message, data });
    }

    const serviceResult = await createMovimentacao(result.data);
    if (!serviceResult.success) {
      return fail(400, serviceResult);
    }

    return serviceResult;
  },
};
