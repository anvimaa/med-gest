import { createMedicamento } from "$lib/server/medicamentos";
import type { Actions } from "./$types";

export const actions: Actions = {
    default: async ({ request }) => {
        return await createMedicamento(await request.formData());
    }
};
