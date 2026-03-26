import { z } from 'zod';

export const hvacCompleteSchema = z.object({
  area_m2: z.number().positive('A área deve ser maior que 0.'),
  pe_direito: z.number().positive('O pé-direito deve ser maior que 0.'),
  num_peoples: z.number().int().nonnegative('O número de pessoas não pode ser negativo.'),
  num_equipment: z.number().int().nonnegative('O número de equipamentos não pode ser negativo.'),
  watts_per_equipment: z.number().nonnegative('A potência dos equipamentos não pode ser negativa.'),
  sun_exposure: z.enum(['nenhuma', 'manhas', 'tardes', 'dia_todo']),
  localizacao: z.string().optional(),
  environment_type: z.enum(['escritorio', 'auditorio', 'sala_aula', 'loja']),
  distancia_tubulacao_m: z.number().positive('A distância linear deve ser maior que zero.')
});

export type HVACCompleteFormValues = z.infer<typeof hvacCompleteSchema>;
