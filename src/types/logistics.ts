export type Unit = 'JPA' | 'CPV' | 'REC' | 'MCZ' | 'AJU' | 'VIX' | 'FOR' | 'SLZ' | 'THE' | 'NAT' | 'CPG' | 'MSR';

export interface ServiceWindow {
  id: string;
  start: string;
  end: string;
}

export interface CalendarException {
  id?: string;
  unit: string;
  date: string;
  is_active: boolean;
  start_time: string | null;
  end_time: string | null;
  description: string | null;
}

export interface UnitPremises {
  unit: Unit;
  operatingDays: number[];
  windows: ServiceWindow[];
  priorityPlates: string[];
  meta_aguardando_liberacao?: number;
  meta_aguardando_doca?: number;
  meta_em_doca?: number;
  meta_concluido_saida?: number;
  refresh_seconds?: number;
  exceptions? : CalendarException[];
}

export type Priority = 'Alta' | 'Média' | 'Baixa' | 'Normal';

export type Status = 'Aguardando Liberação' | 'Aguardando Doca' | 'Em Doca' | 'Concluído/Saída';

export interface Vehicle {
  id: string;
  order_num: string;
  unit: Unit;
  plate: string;
  plate_trailer: string;
  driver: string;
  carrier: string;
  material: string;
  destination: string;
  uf: string;
  dock: string;
  priority: Priority;
  status: Status;
  ts_inicial: string;
  ts_romaneio: string;
  ts_entrada: string;
  ts_saida: string;
  observation: string;
  created_at: string;
  area: string;
  dia?: string;
  mes?: string;
  ano?: string;
  tmp_liberacao_min: number;
  tmp_doca_min: number;
  tmp_em_doca_min: number;
  tmp_total_min: number;
}
