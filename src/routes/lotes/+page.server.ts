import { prisma } from "$lib/server/prisma";
import { fail } from "@sveltejs/kit";
import { deleteLote } from "$lib/server/lotes";
import type { PageServerLoad, Actions } from "./$types";

export const load: PageServerLoad = async ({ url, locals }) => {
  if (!locals.user) {
    return { lotes: [] };
  }

  const search = url.searchParams.get("search") || "";

  const lotes = await prisma.lote.findMany({
    where: {
      OR: [
        { numeroLote: { contains: search } },
        { medicamento: { nome: { contains: search } } },
        { fornecedor: { nome: { contains: search } } },
      ],
    },
    include: {
      medicamento: true,
      fornecedor: true,
    },
    orderBy: {
      dataEntrada: "desc",
    },
  });

  return {
    lotes,
    search,
  };
};

export const actions: Actions = {
  delete: async ({ request }) => {
    const formData = await request.formData();
    const id = formData.get("id")?.toString();
    if (!id) return fail(400, { success: false, message: "ID não fornecido" });

    const result = await deleteLote(id);
    if (!result.success) {
      return fail(400, result);
    }
    return result;
  },
};
