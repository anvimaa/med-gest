import { redirect, type Handle } from "@sveltejs/kit";
import { building } from "$app/environment";
import { auth } from "$lib/server/auth";
import { svelteKitHandler } from "better-auth/svelte-kit";

export const handle: Handle = async ({ event, resolve }) => {
  const session = await auth.api.getSession({ headers: event.request.headers });

  if (session) {
    event.locals.session = session.session;
    event.locals.user = session.user;
  }

  const { pathname } = event.url;
  const user = event.locals.user;

  // Public routes
  const isPublicRoute = pathname === "/login";

  if (!user && !isPublicRoute && !pathname.startsWith("/api")) {
    redirect(302, "/login");
  }

  if (user) {
    // Somente Admin pode gerir utilizadores
    if (pathname.startsWith("/usuarios") && user.role !== "admin") {
      redirect(302, "/dashboard");
    }

    // Signup restrito a Admin
    if (pathname === "/signup" && user.role !== "admin") {
      redirect(302, "/dashboard");
    }

    // Restrições para Operador
    if (user.role === "user") {
      // Operador não pode ver fornecedores nem eliminações
      const adminOnlyPaths = ["/fornecedores", "/eliminacoes"];
      if (adminOnlyPaths.some((path) => pathname.startsWith(path))) {
        redirect(302, "/dashboard");
      }

      // Medicamentos e Lotes: Operador pode ver, mas não pode criar/editar/eliminar
      const restrictedPaths = ["/medicamentos"];
      if (
        restrictedPaths.some((path) => pathname.startsWith(path)) &&
        event.request.method !== "GET"
      ) {
        redirect(302, pathname); // Redirect to the same page but without performing the action
      }
    }
  }

  return svelteKitHandler({ event, resolve, auth, building });
};
