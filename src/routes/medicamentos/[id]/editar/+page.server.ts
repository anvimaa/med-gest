import { prisma } from "$lib/server/prisma";
import { error } from "@sveltejs/kit";
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
        return await updateMedicamento(params.id, await request.formData());
    }
};
