import type { ValidationAlert } from './hvac';

export interface HVACCompleteOutput {
  carga_termica_btu_h: number;
  vazao_ar_m3h: number;
  equipamento_recomendado: string;
  eficiencia_estimada: string;
  potencia_eletrica_estimada_w: number;
  duto_diametro_mm: number;
  tubulacao_liquida: string;
  tubulacao_succao: string;
  comprimento_tubulacao_m: number;
  step_by_step: Record<string, string | number>;
  warnings: ValidationAlert[];
  constants_used: Record<string, string | number>;
  references: string[];
}
