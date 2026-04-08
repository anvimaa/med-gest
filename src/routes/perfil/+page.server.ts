import { prisma } from "$lib/server/prisma";
import { fail } from "@sveltejs/kit";
import { perfilSchema } from "$lib/schemas/perfil";
import type { PageServerLoad, Actions } from "./$types";
import { auth } from "$lib/server/auth";
import { APIError } from "better-auth/api";
import fs, { writeFileSync, mkdirSync } from "node:fs";
import path, { join, resolve } from "node:path";
import process from "process";
import crypto from "crypto";
import "dotenv/config";

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
      return fail(400, { error: result.error.issues[0].message, data });
    }

    try {
      await prisma.user.update({
        where: { id: locals.user.id },
        data: result.data,
      });

      return { success: true };
    } catch (err: any) {
      if (err.code === "P2002") {
        return fail(400, {
          error: "Este email já está em uso por outro utilizador",
        });
      }
      return fail(500, { error: "Erro ao atualizar perfil" });
    }
  },

  updateImage: async ({ request, locals }) => {
    if (!locals.user) return fail(401, { error: "Não autorizado" });

    const formData = await request.formData();
    const image = formData.get("image") as File;

    if (!image || image.size === 0) {
      return fail(400, { error: "Nenhuma imagem selecionada" });
    }

    if (!image.type.startsWith("image/")) {
      return fail(400, { error: "O ficheiro deve ser uma imagem" });
    }

    try {
      const buffer = Buffer.from(await image.arrayBuffer());
      const ext = path.extname(image.name) || ".jpg";
      const fileName = `${locals.user.id}-${Date.now()}${ext}`;
      const uploadDirRaw = process.env.UPLOAD_DIR || "../medgest-uploads";
      const uploadDir = resolve(process.cwd(), uploadDirRaw);

      // Ensure directory exists
      mkdirSync(uploadDir, { recursive: true });

      const filePath = join(uploadDir, fileName);
      writeFileSync(filePath, buffer);

      const imageUrl = `/api/uploads/${fileName}`;

      await prisma.user.update({
        where: { id: locals.user.id },
        data: { image: imageUrl },
      });

      return { success: true, imageUrl };
    } catch (err) {
      console.error(err);
      return fail(500, { error: "Erro ao guardar imagem" });
    }
  },

  changePassword: async ({ request, locals }) => {
    if (!locals.user) return fail(401, { error: "Não autorizado" });

    const formData = await request.formData();
    const currentPassword = formData.get("currentPassword")?.toString();
    const newPassword = formData.get("newPassword")?.toString();
    const confirmPassword = formData.get("confirmPassword")?.toString();

    if (!currentPassword || !newPassword || !confirmPassword) {
      return fail(400, { error: "Todos os campos de senha são obrigatórios" });
    }

    if (newPassword !== confirmPassword) {
      return fail(400, { error: "As novas senhas não coincidem" });
    }

    try {
      await auth.api.changePassword({
        body: {
          currentPassword,
          newPassword,
          revokeOtherSessions: true,
        },
        headers: request.headers,
      });

      return { success: true, passwordChanged: true };
    } catch (error) {
      console.error(error);
      if (error instanceof APIError) {
        return fail(400, { error: error.message || "Falha ao mudar senha" });
      }
      return fail(500, { error: "Erro inesperado ao mudar senha" });
    }
  },
};
