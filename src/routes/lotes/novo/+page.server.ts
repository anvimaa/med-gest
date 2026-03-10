import { prisma } from "$lib/server/prisma";
import { createLote } from "$lib/server/lotes";
import { fail } from "@sveltejs/kit";
import { loteSchema } from "$lib/schemas/lote";
import type { PageServerLoad, Actions } from "./$types";

export const load: PageServerLoad = async ({ locals }) => {
  if (!locals.user) return { medicamentos: [], fornecedores: [] };

  const [medicamentos, fornecedores] = await Promise.all([
    prisma.medicamento.findMany({ orderBy: { nome: 'asc' } }),
    prisma.fornecedor.findMany({ orderBy: { nome: 'asc' } })
  ]);

  return { medicamentos, fornecedores };
};

export const actions: Actions = {
  default: async ({ request }) => {
    const formData = await request.formData();
    const data = Object.fromEntries(formData);

    // Initial check for dates
    const result = loteSchema.safeParse(data);
    if (!result.success) {
      const errors: Record<string, string[]> = {};
      for (const issue of result.error.issues) {
        const path = issue.path[0] as string;
        if (!errors[path]) errors[path] = [];
        errors[path].push(issue.message);
      }
      return fail(400, { errors, data });
    }

    const serviceResult = await createLote(result.data);
    if (!serviceResult.success) {
      return fail(400, serviceResult);
    }

    return serviceResult;
  },
};
