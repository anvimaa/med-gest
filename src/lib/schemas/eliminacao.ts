import { z } from "zod";

export const eliminacaoSchema = z.object({
  quantidade: z.coerce.number().int().positive("A quantidade deve ser superior a zero"),
  motivo: z.string().min(5, "O motivo deve ter pelo menos 5 caracteres").max(200, "O motivo é demasiado longo"),
  loteId: z.string().uuid("Lote inválido"),
  userId: z.string().min(1, "Utilizador obrigatório"),
});

export type EliminacaoInput = z.infer<typeof eliminacaoSchema>;
