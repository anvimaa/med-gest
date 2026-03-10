import { prisma } from "$lib/server/prisma";
import { fail } from "@sveltejs/kit";
import { deleteFornecedor } from "$lib/server/fornecedores";
import type { PageServerLoad, Actions } from "./$types";

export const load: PageServerLoad = async ({ url, locals }) => {
    if (!locals.user) {
        return { fornecedores: [] };
    }

    const search = url.searchParams.get("search") || "";

    const fornecedores = await prisma.fornecedor.findMany({
        where: {
            OR: [
                { nome: { contains: search, mode: 'insensitive' } },
                { nif: { contains: search, mode: 'insensitive' } },
                { email: { contains: search, mode: 'insensitive' } }
            ]
        },
        orderBy: {
            nome: 'asc'
        }
    });

    return {
        fornecedores,
        search
    };
};

export const actions: Actions = {
    delete: async ({ request }) => {
        const formData = await request.formData();
        const id = formData.get("id")?.toString();
        if (!id) return fail(400, { success: false, message: "ID não fornecido" });
        
        const result = await deleteFornecedor(id);
        if (!result.success) {
            return fail(400, result);
        }
        return result;
    }
};
