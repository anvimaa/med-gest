import { auth } from "$lib/server/auth";
import { redirect, type Actions } from "@sveltejs/kit";

export const actions: Actions = {
    default: async ({ request, cookies }) => {
        await auth.api.signOut({
            headers: request.headers
        });
        throw redirect(303, "/login");
    }
};
