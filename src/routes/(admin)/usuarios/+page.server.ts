import { prisma } from "$lib/server/prisma";
import { fail, redirect } from "@sveltejs/kit";
import type { Actions, PageServerLoad } from "./$types";
import { auth } from "$lib/server/auth";

export const load: PageServerLoad = async ({ locals }) => {
  if (!locals.user || locals.user.role !== "admin") {
    throw redirect(303, "/dashboard");
  }

  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
  });

  return {
    users,
  };
};

export const actions: Actions = {
  createUser: async (event) => {
    const { request, locals } = event;
    if (!locals.user || locals.user.role !== "admin") {
      return fail(403, { message: "Não autorizado" });
    }

    const formData = await request.formData();
    const email = formData.get("email")?.toString() ?? "";
    const password = formData.get("password")?.toString() ?? "";
    const name = formData.get("name")?.toString() ?? "";
    const role = formData.get("role")?.toString() ?? "user";

    if (!email || !password || !name) {
      return fail(400, { message: "Preencha todos os campos" });
    }

    try {
      await auth.api.createUser({
        body: {
          email,
          password,
          name,
          role: role as "admin" | "user",
        },
      });

      return { success: true };
    } catch (error: any) {
      return fail(400, {
        message: error.message || "Erro ao criar utilizador",
      });
    }
  },
  deleteUser: async ({ request, locals }) => {
    if (!locals.user || locals.user.role !== "admin") {
      return fail(403, { message: "Não autorizado" });
    }

    const formData = await request.formData();
    const id = formData.get("id")?.toString() ?? "";

    if (id === locals.user.id) {
      return fail(400, { message: "Não pode eliminar a sua própria conta" });
    }

    try {
      await prisma.user.delete({ where: { id } });
      return { success: true };
    } catch (error) {
      return fail(500, { message: "Erro ao eliminar utilizador" });
    }
  },
};
