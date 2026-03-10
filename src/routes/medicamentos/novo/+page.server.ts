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
      // Map Zod errors to Record<string, string[]> manually to avoid deprecated flatten()
      const errors: Record<string, string[]> = {};
      for (const issue of result.error.issues) {
        const path = issue.path[0] as string;
        if (!errors[path]) errors[path] = [];
        errors[path].push(issue.message);
      }
      return fail(400, { errors, data });
    }

    const serviceResult = await createMedicamento(result.data);
    if (!serviceResult.success) {
      return fail(serviceResult.message ? 400 : 500, serviceResult);
    }

    return serviceResult;
  },
};
