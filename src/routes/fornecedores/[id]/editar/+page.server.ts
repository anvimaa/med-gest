import { getFornecedorById, updateFornecedor } from "$lib/server/fornecedores";
import { error, fail } from "@sveltejs/kit";
import { fornecedorSchema } from "$lib/schemas/fornecedor";
import type { PageServerLoad, Actions } from "./$types";

export const load: PageServerLoad = async ({ params }) => {
  const fornecedor = await getFornecedorById(params.id);
  
  if (!fornecedor) {
    throw error(404, "Fornecedor não encontrado");
  }

  return { fornecedor };
};

export const actions: Actions = {
  default: async ({ params, request }) => {
    const formData = await request.formData();
    const data = Object.fromEntries(formData);

    const result = fornecedorSchema.safeParse(data);
    if (!result.success) {
      const errors: Record<string, string[]> = {};
      for (const issue of result.error.issues) {
        const path = issue.path[0] as string;
        if (!errors[path]) errors[path] = [];
        errors[path].push(issue.message);
      }
      return fail(400, { errors, data });
    }

    const serviceResult = await updateFornecedor(params.id, result.data);
    if (!serviceResult.success) {
      return fail(serviceResult.message ? 400 : 500, serviceResult);
    }

    return serviceResult;
  },
};
