import { createFornecedor } from "$lib/server/fornecedores";
import { fail } from "@sveltejs/kit";
import { fornecedorSchema } from "$lib/schemas/fornecedor";
import type { Actions } from "./$types";

export const actions: Actions = {
  default: async ({ request }) => {
    const formData = await request.formData();
    const data = Object.fromEntries(formData);

    const result = fornecedorSchema.safeParse(data);
    if (!result.success) {
      return fail(400, { error: result.error.issues[0].message, data });
    }

    const serviceResult = await createFornecedor(result.data);
    if (!serviceResult.success) {
      return fail(serviceResult.message ? 400 : 500, serviceResult);
    }

    return serviceResult;
  },
};
