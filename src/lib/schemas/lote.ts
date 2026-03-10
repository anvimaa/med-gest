import { z } from "zod";

export const loteSchema = z.object({
  numeroLote: z.string().min(1, "O número do lote é obrigatório").max(50, "O número do lote é demasiado longo"),
  dataFabricacao: z.string().or(z.date()).transform((val) => new Date(val)),
  dataValidade: z.string().or(z.date()).transform((val) => new Date(val)),
  quantidadeInicial: z.coerce.number().int().min(0, "A quantidade inicial não pode ser negativa"),
  quantidadeAtual: z.coerce.number().int().min(0, "A quantidade atual não pode ser negativa"),
  medicamentoId: z.string().uuid("Medicamento inválido"),
  fornecedorId: z.string().uuid("Fornecedor inválido"),
});

export type LoteInput = z.infer<typeof loteSchema>;
