import { supabase } from '../config/supabase';

export const romaneiosService = {
  async getDashboardData(filters: any, from?: number, to?: number) {
    let query = supabase
      .from('view_painel_operacoes')
      .select('*', { count: 'exact' });

    if (filters.unit?.length > 0) query = query.in('unit', filters.unit);
    if (filters.priority?.length > 0) query = query.in('priority', filters.priority);
    if (filters.transportador?.length > 0) query = query.in('carrier', filters.transportador);
    if (filters.material?.length > 0) query = query.in('material', filters.material);
    if (filters.area?.length > 0) query = query.in('area', filters.area);
    
    if (filters.year?.length > 0) query = query.in('ano', filters.year.map(Number));
    if (filters.month?.length > 0) query = query.in('mes', filters.month.map(Number));
    if (filters.day?.length > 0) query = query.in('dia', filters.day.map(Number));

    if (from !== undefined && to !== undefined) {
      query = query.range(from, to);
    }

    const { data, error, count } = await query
      .order('ano', { ascending: false })
      .order('mes', { ascending: false })
      .order('dia', { ascending: false })
      .order('ts_inicial', { ascending: false });

    if (error) throw error;
    return { data, count };
  },

  async getFilterOptions() {
    const { data, error } = await supabase
      .from('vw_romaneios_filtros')
      .select('*');

    if (error) throw error;
    return data;
  },

  async getPremises() {
    const { data: premisesData, error: premError } = await supabase
      .from('unit_premises')
      .select('*');

    if (premError) throw premError;

    const { data: exceptionsData, error: excError } = await supabase
      .from('unit_calendar_exceptions')
      .select('*');

    if (excError) throw excError;

    return { premisesData, exceptionsData };
  }
};
