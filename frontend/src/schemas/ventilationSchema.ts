import { z } from 'zod';

export const ventilationSchema = z.object({
  area_m2: z.number().min(1, 'Área deve ser maior que 0').max(10000, 'Área muito grande'),
  pe_direito: z.number().min(2.0, 'Pé-direito mínimo recomendado é 2.0m').max(10, 'Pé-direito muito alto'),
  num_peoples: z.number().min(1, 'Deve haver pelo menos 1 ocupante'),
  environment_type: z.enum(['escritorio', 'auditorio', 'sala_aula', 'loja']),
});

export type VentilationFormValues = z.infer<typeof ventilationSchema>;
