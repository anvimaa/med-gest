import { z } from "zod";

export const fornecedorSchema = z.object({
  nome: z.string().min(2, "O nome deve ter pelo menos 2 caracteres").max(100, "O nome é demasiado longo"),
  nif: z.string().max(20, "O NIF é demasiado longo").optional().nullable().or(z.literal("")),
  telefone: z.string().max(20, "O telefone é demasiado longo").optional().nullable().or(z.literal("")),
  email: z.string().email("Email inválido").max(100, "O email é demasiado longo").optional().nullable().or(z.literal("")),
  endereco: z.string().max(200, "O endereço é demasiado longo").optional().nullable().or(z.literal("")),
});

export type FornecedorInput = z.infer<typeof fornecedorSchema>;
