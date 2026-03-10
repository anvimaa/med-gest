import { prisma } from "$lib/server/prisma";
import { fail } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";
import { deleteMedicamento } from "$lib/server/medicamentos";
import type { Actions } from "./$types";

export const load: PageServerLoad = async ({ url, locals }) => {
    if (!locals.user) {
        return { medicamentos: [] };
    }

    const search = url.searchParams.get("search") || "";

    const medicamentos = await prisma.medicamento.findMany({
        where: {
            OR: [
                { nome: { contains: search, mode: 'insensitive' } },
                { principioAtivo: { contains: search, mode: 'insensitive' } },
                { codigoBarras: { contains: search, mode: 'insensitive' } }
            ]
        },
        orderBy: {
            nome: 'asc'
        }
    });

    return {
        medicamentos,
        search
    };
};

export const actions: Actions = {
    delete: async ({ request }) => {
        const formData = await request.formData();
        const id = formData.get("id")?.toString();
        if (!id) return fail(400, { success: false, message: "ID não fornecido" });
        
        const result = await deleteMedicamento(id);
        if (!result.success) {
            return fail(400, result);
        }
        return result;
    }
};
