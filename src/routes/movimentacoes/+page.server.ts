import { getMovimentacoes } from "$lib/server/movimentacoes";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ locals }) => {
    if (!locals.user) {
        return { movimentacoes: [] };
    }

    const movimentacoes = await getMovimentacoes();

    return {
        movimentacoes
    };
};
