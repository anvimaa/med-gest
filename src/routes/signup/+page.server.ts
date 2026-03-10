import { fail, redirect } from "@sveltejs/kit";
import type { Actions } from "./$types";
import type { PageServerLoad } from "./$types";
import { auth } from "$lib/server/auth";
import { APIError } from "better-auth/api";

export const load: PageServerLoad = async (event) => {
  if (event.locals.user) {
    return redirect(302, "/dashboard");
  }
  return {};
};

export const actions: Actions = {
  signUpEmail: async (event) => {
    const formData = await event.request.formData();
    const email = formData.get("email")?.toString() ?? "";
    const password = formData.get("password")?.toString() ?? "";
    const name = formData.get("name")?.toString() ?? "";

    if (!email || !password || !name) {
        return fail(400, { message: "Preencha todos os campos" });
    }

    try {
      await auth.api.signUpEmail({
        body: {
          email,
          password,
          name,
        },
      });
    } catch (error) {
      if (error instanceof APIError) {
        return fail(400, { message: error.message || "Falha no registo" });
      }
      return fail(500, { message: "Erro inesperado" });
    }

    return redirect(302, "/dashboard");
  },
};
