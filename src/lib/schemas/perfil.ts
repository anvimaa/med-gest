import { z } from "zod";

export const perfilSchema = z.object({
  name: z.string().min(2, "O nome deve ter pelo menos 2 caracteres").max(100, "O nome é demasiado longo"),
  email: z.string().email("Email inválido").max(100, "O email é demasiado longo"),
});

export type PerfilInput = z.infer<typeof perfilSchema>;
