import { z } from 'zod';

export const energyEfficiencySchema = z.object({
  area_m2: z.number().min(1, 'Área deve ser maior que 0').max(100000, 'Área muito grande'),
  iluminacao_w_m2: z.number().min(1, 'Densidade deve ser maior que 0').max(100, 'Densidade irreal >100 W/m²'),
  ar_condicionado_cop: z.number().min(1, 'COP mínimo é 1').max(10, 'COP irreal >10'),
  fator_vidro_percent: z.number().min(0).max(100, 'Percentual não pode passar de 100%'),
  horas_uso_dia: z.number().min(1).max(24),
  dias_uso_ano: z.number().min(1).max(365),
});

export type EnergyEfficiencyFormValues = z.infer<typeof energyEfficiencySchema>;
