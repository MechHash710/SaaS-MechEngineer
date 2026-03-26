import { z } from 'zod';

export const solarFormSchema = z.object({
  localizacao: z.string().min(3, 'Digite a cidade e estado (ex: São Paulo, SP)'),
  num_peoples: z.number().min(1, 'No mínimo 1 pessoa').max(50, 'Máximo 50 pessoas para sistema residencial'),
  consumo_por_pessoa: z.number().min(10, 'Consumo mínimo irreal').max(200, 'Consumo máximo 200L/pessoa'),
  temp_fria: z.number().min(5, 'Água fria mínima de 5°C').max(35, 'Água fria máxima de 35°C'),
  temp_quente: z.number().min(35, 'Água quente mínima de 35°C').max(70, 'Temperatura limite excedida (Perigo)'),
  tipo_sistema: z.enum(['circulacao_natural', 'forcada']),
  tipo_coletor: z.enum(['plano', 'vacuo']),
  orientacao_telhado: z.string().min(3, 'Orientação obrigatória'),
  inclinacao_telhado: z.number().min(0).max(90, 'Inclinação máxima 90 graus')
});

export type SolarFormValues = z.infer<typeof solarFormSchema>;
