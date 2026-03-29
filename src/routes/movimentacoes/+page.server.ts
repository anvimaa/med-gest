import { getMovimentacoes } from "$lib/server/movimentacoes";
import { redirect } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ locals }) => {
  const movimentacoes = await getMovimentacoes();

  return {
    movimentacoes,
  };
};
