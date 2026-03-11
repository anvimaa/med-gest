import { createMedicamento } from "$lib/server/medicamentos";
import { fail } from "@sveltejs/kit";
import { medicamentoSchema } from "$lib/schemas/medicamento";
import type { Actions } from "./$types";

export const actions: Actions = {
  default: async ({ request }) => {
    const formData = await request.formData();
    const data = Object.fromEntries(formData);

    // Validation in the server action
    const result = medicamentoSchema.safeParse(data);
    if (!result.success) {
      return fail(400, { error: result.error.issues[0].message, data });
    }

    const serviceResult = await createMedicamento(result.data);
    if (!serviceResult.success) {
      return fail(serviceResult.message ? 400 : 500, serviceResult);
    }

    return serviceResult;
  },
};
