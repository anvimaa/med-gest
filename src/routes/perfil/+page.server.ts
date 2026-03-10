import { prisma } from "$lib/server/prisma";
import { fail } from "@sveltejs/kit";
import { perfilSchema } from "$lib/schemas/perfil";
import type { PageServerLoad, Actions } from "./$types";

export const load: PageServerLoad = async ({ locals }) => {
  if (!locals.user) return { user: null };
  return { user: locals.user };
};

export const actions: Actions = {
  update: async ({ request, locals }) => {
    if (!locals.user) return fail(401, { message: "Não autorizado" });

    const formData = await request.formData();
    const data = Object.fromEntries(formData);

    const result = perfilSchema.safeParse(data);
    if (!result.success) {
      const errors: Record<string, string[]> = {};
      for (const issue of result.error.issues) {
        const path = issue.path[0] as string;
        if (!errors[path]) errors[path] = [];
        errors[path].push(issue.message);
      }
      return fail(400, { errors, data });
    }

    try {
      await prisma.user.update({
        where: { id: locals.user.id },
        data: result.data,
      });
      return { success: true };
    } catch (err: any) {
      if (err.code === "P2002") {
        return fail(400, { message: "Este email já está em uso por outro utilizador" });
      }
      return fail(500, { message: "Erro ao atualizar perfil" });
    }
  },
};
