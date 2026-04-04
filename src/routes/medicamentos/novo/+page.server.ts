import { createMedicamento } from "$lib/server/medicamentos";
import { fail } from "@sveltejs/kit";
import { medicamentoSchema } from "$lib/schemas/medicamento";
import type { Actions } from "./$types";
import crypto from "crypto";
import fs from "node:fs";
import path from "node:path";
import process from "process";
import "dotenv/config";

export const actions: Actions = {
  default: async ({ request }) => {
    const formData = await request.formData();
    const data = Object.fromEntries(formData);
    
    // Process image upload
    const imagem = formData.get("imagem") as File;
    if (imagem && imagem.size > 0) {
      const ext = path.extname(imagem.name) || ".jpg";
      const filename = crypto.randomUUID() + ext;
      const uploadDir = process.env.UPLOAD_DIR || "../medgest-uploads";
      const absoluteUploadDir = path.resolve(process.cwd(), uploadDir);
      
      if (!fs.existsSync(absoluteUploadDir)) {
        fs.mkdirSync(absoluteUploadDir, { recursive: true });
      }
      
      const filePath = path.join(absoluteUploadDir, filename);
      const arrayBuffer = await imagem.arrayBuffer();
      fs.writeFileSync(filePath, Buffer.from(arrayBuffer));
      
      data.imagemUrl = `/api/uploads/${filename}`;
    } else {
      delete data.imagem; // zod won't care, but clean up
    }

    // Validation in the server action
    const result = medicamentoSchema.safeParse(data);
    if (!result.success) {
      return fail(400, { error: result.error.issues[0].message, data });
    }

    const serviceResult = await createMedicamento(result.data);
    if (!serviceResult.success) {
      return fail(serviceResult.message ? 400 : 500, serviceResult);
    }

    return serviceResult;
  },
};

