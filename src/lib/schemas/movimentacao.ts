import { z } from "zod";

export const movimentacaoSchema = z.object({
  tipoMovimentacao: z.enum(["ENTRADA", "SAIDA"]),
  quantidade: z.coerce.number().int().positive("A quantidade deve ser superior a zero"),
  loteId: z.string().uuid("Lote inválido"),
  userId: z.string().min(1, "Utilizador obrigatório"),
});

export type MovimentacaoInput = z.infer<typeof movimentacaoSchema>;
