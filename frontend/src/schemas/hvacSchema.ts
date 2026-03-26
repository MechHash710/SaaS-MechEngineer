import { z } from "zod";

export const hvacFormSchema = z.object({
  area_m2: z.number().min(1, "A área deve ser de pelo menos 1 m²").max(5000, "Acima de 5000 m² requer projeto não-simplificado"),
  pe_direito: z.number().min(2.0, "Pé-direito mínimo realista é 2.0m").max(10.0, "Galpões / Lojas com mais de 10m fogem da tabela padrão"),
  num_peoples: z.number().int("Deve ser um número inteiro").min(0, "Não pode ser negativo"),
  num_equipment: z.number().int("Deve ser um número inteiro").min(0, "Não pode ser negativo"),
  watts_per_equipment: z.number().min(0, "Não pode ser repassada potência negativa"),
  sun_exposure: z.enum(['manhas', 'tardes', 'dia_todo', 'nenhuma']),
  localizacao: z.string().optional(),
});

export type HvacFormValues = z.infer<typeof hvacFormSchema>;
