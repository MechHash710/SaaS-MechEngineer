import type { ValidationAlert } from './hvac';

export interface SolarHeatingInput {
  localizacao: string;
  num_peoples: number;
  consumo_por_pessoa: number;
  temp_fria: number;
  temp_quente: number;
  tipo_sistema: 'circulacao_natural' | 'forcada';
  tipo_coletor: 'plano' | 'vacuo';
  orientacao_telhado: string;
  inclinacao_telhado: number;
}

export interface SolarHeatingOutput {
  consumo_diario_l: number;
  energia_necessaria_kwh_dia: number;
  area_coletores_m2: number;
  volume_boiler_l: number;
  num_coletores: number;
  fracao_solar: number;
  economia_mensal_kwh: number;
  economia_anual_brl: number;
  recomendacao_sistema: string;
  step_by_step: Record<string, string | number>;
  constants_used: Record<string, string | number>;
  references: string[];
  warnings?: ValidationAlert[];
}
