import { getLoteById } from "$lib/server/lotes";
import { createEliminacao } from "$lib/server/eliminacoes";
import { error, fail } from "@sveltejs/kit";
import { eliminacaoSchema } from "$lib/schemas/eliminacao";
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
    
    const payload = {
      ...data,
      loteId: params.id,
      userId: locals.user!.id
    };

    const result = eliminacaoSchema.safeParse(payload);
    if (!result.success) {
      const errors: Record<string, string[]> = {};
      for (const issue of result.error.issues) {
        const path = issue.path[0] as string;
        if (!errors[path]) errors[path] = [];
        errors[path].push(issue.message);
      }
      return fail(400, { errors, data });
    }

    const serviceResult = await createEliminacao(result.data);
    if (!serviceResult.success) {
      return fail(400, serviceResult);
    }

    return serviceResult;
  },
};
