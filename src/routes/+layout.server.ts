import { redirect } from "@sveltejs/kit";
import type { LayoutServerLoad } from "./$types";

export const load: LayoutServerLoad = async ({ locals, url }) => {
  // somente login e signup não precisam de autenticação
  if (!locals.user && !["/login", "/signup"].includes(url.pathname)) {
    redirect(302, "/login");
  }
  return {
    user: locals.user,
    session: locals.session,
  };
};
