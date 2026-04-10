export interface ValidationAlert {
  severity: 'info' | 'warning' | 'critical';
  message: string;
}

export interface SimulatorData {
  area_m2: number;
  pe_direito: number;
  num_peoples: number;
  num_equipment: number;
  watts_per_equipment: number;
  sun_exposure: 'manhas' | 'tardes' | 'dia_todo' | 'nenhuma';
  localizacao: string;
}

export interface ProductOption {
  brand_model: string;
  type_desc: string;
  capacity: string;
  efficiency: string;
  price_estimate: string;
  buy_link: string;
}

export interface SimulatorResponse {
  total_btu_h: number;
  total_watts: number;
  suggested_equipment: string;
  recommended_options?: ProductOption[];
  step_by_step: Record<string, string | number>;
  warnings?: ValidationAlert[];
  constants_used?: Record<string, string | number>;
  references?: string[];
}

export interface BudgetItem {
  name: string;
  quantity: number;
  unit_price: number;
  total: number;
}

export interface BudgetResponse {
  project_id: string;
  items: BudgetItem[];
  total_cost: number;
}

export interface ArtData {
  atividade: string;
  tipo_obra: string;
  descricao_complementar: string;
  crea_responsavel: string;
  normas_aplicadas: string[];
  memorial_calculo?: Record<string, string | number>;
}
