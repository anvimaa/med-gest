import { prisma } from "$lib/server/prisma";
import { error, fail } from "@sveltejs/kit";
import type { PageServerLoad, Actions } from "./$types";
import { updateMedicamento } from "$lib/server/medicamentos";

export const load: PageServerLoad = async ({ params }) => {
    const medicamento = await prisma.medicamento.findUnique({
        where: { id: params.id }
    });

    if (!medicamento) {
        throw error(404, "Medicamento não encontrado");
    }

    return {
        medicamento
    };
};

export const actions: Actions = {
    default: async ({ params, request }) => {
        const result = await updateMedicamento(params.id, await request.formData());
        if (!result.success) {
            return fail(result.errors ? 400 : 500, result);
        }
        return result;
    }
};
