import { createMedicamento } from "$lib/server/medicamentos";
import { fail } from "@sveltejs/kit";
import type { Actions } from "./$types";

export const actions: Actions = {
    default: async ({ request }) => {
        const result = await createMedicamento(await request.formData());
        if (!result.success) {
            return fail(result.errors ? 400 : 500, result);
        }
        return result;
    }
};
