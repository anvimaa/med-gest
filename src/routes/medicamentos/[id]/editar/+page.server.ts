import { prisma } from "$lib/server/prisma";
import { error, fail } from "@sveltejs/kit";
import { medicamentoSchema } from "$lib/schemas/medicamento";
import { updateMedicamento } from "$lib/server/medicamentos";
import type { PageServerLoad, Actions } from "./$types";

export const load: PageServerLoad = async ({ params }) => {
  const medicamento = await prisma.medicamento.findUnique({
    where: { id: params.id },
  });

  if (!medicamento) {
    throw error(404, "Medicamento não encontrado");
  }

  return {
    medicamento,
  };
};

export const actions: Actions = {
  default: async ({ params, request }) => {
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

    const serviceResult = await updateMedicamento(params.id, result.data);
    if (!serviceResult.success) {
      return fail(serviceResult.message ? 400 : 500, serviceResult);
    }

    return serviceResult;
  },
};
