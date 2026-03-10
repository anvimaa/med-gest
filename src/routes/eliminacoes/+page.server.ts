import { getEliminacoes } from "$lib/server/eliminacoes";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ locals }) => {
    if (!locals.user) {
        return { eliminacoes: [] };
    }

    const eliminacoes = await getEliminacoes();

    return {
        eliminacoes
    };
};
