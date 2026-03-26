export interface VentilationOutput {
  vazao_ar_externo_m3h: number;
  renovacoes_por_hora_ach: number;
  diametro_duto_principal_mm: number;
  velocidade_duto_m_s: number;
  recomendacao: string;
  step_by_step: Record<string, number>;
  constants_used: Record<string, string>;
  references: string[];
  warnings: { severity: string; message: string }[];
}
