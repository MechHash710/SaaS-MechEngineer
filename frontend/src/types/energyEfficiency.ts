export interface EnergyEfficiencyOutput {
  consumo_anual_kwh: number;
  score_eficiencia: string;
  indicador_kwh_m2_ano: number;
  recomendacao: string;
  step_by_step: Record<string, number>;
  constants_used: Record<string, string>;
  references: string[];
  warnings: { severity: string; message: string }[];
}
