import { z } from "zod";

export const medicamentoSchema = z.object({
  nome: z.string().min(2, "O nome deve ter pelo menos 2 caracteres").max(100, "O nome é demasiado longo"),
  descricao: z.string().max(500, "A descrição é demasiado longa").optional().nullable().or(z.literal("")),
  principioAtivo: z.string().max(100, "O princípio ativo é demasiado longo").optional().nullable().or(z.literal("")),
  formaFarmaceutica: z.string().max(50, "A forma farmacêutica é demasiado longa").optional().nullable().or(z.literal("")),
  concentracao: z.string().max(50, "A concentração é demasiado longa").optional().nullable().or(z.literal("")),
  fabricante: z.string().max(100, "O fabricante é demasiado longo").optional().nullable().or(z.literal("")),
  codigoBarras: z.string().max(50, "O código de barras é demasiado longo").optional().nullable().or(z.literal("")),
});

export type MedicamentoInput = z.infer<typeof medicamentoSchema>;
