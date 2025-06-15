
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { subDays, startOfDay, endOfDay, startOfMonth, endOfMonth, subMonths } from 'date-fns';

export interface DashboardMetrics {
  salesThisMonth: number;
  ordersToday: number;
  activeProducts: number;
  visitors: number;
  salesGrowth: number;
  ordersGrowth: number;
  productsGrowth: number;
  visitorsGrowth: number;
}

export const useDashboardMetrics = () => {
  const { profile } = useAuth();

  const fetchDashboardMetrics = async (): Promise<DashboardMetrics> => {
    if (!profile?.store_id) throw new Error('Store ID não encontrado');

    const now = new Date();
    const today = new Date();
    const monthStart = startOfMonth(now);
    const monthEnd = endOfMonth(now);
    const lastMonthStart = startOfMonth(subMonths(now, 1));
    const lastMonthEnd = endOfMonth(subMonths(now, 1));
    const todayStart = startOfDay(today);
    const todayEnd = endOfDay(today);
    const yesterdayStart = startOfDay(subDays(today, 1));
    const yesterdayEnd = endOfDay(subDays(today, 1));

    // Vendas deste mês
    const { data: salesThisMonth, error: salesError } = await supabase
      .from('orders')
      .select('total_amount')
      .eq('store_id', profile.store_id)
      .gte('created_at', monthStart.toISOString())
      .lte('created_at', monthEnd.toISOString())
      .in('status', ['confirmed', 'shipping', 'delivered']);

    if (salesError) throw salesError;

    // Vendas mês passado
    const { data: salesLastMonth, error: salesLastError } = await supabase
      .from('orders')
      .select('total_amount')
      .eq('store_id', profile.store_id)
      .gte('created_at', lastMonthStart.toISOString())
      .lte('created_at', lastMonthEnd.toISOString())
      .in('status', ['confirmed', 'shipping', 'delivered']);

    if (salesLastError) throw salesLastError;

    // Pedidos hoje
    const { data: ordersToday, error: ordersTodayError } = await supabase
      .from('orders')
      .select('id')
      .eq('store_id', profile.store_id)
      .gte('created_at', todayStart.toISOString())
      .lte('created_at', todayEnd.toISOString());

    if (ordersTodayError) throw ordersTodayError;

    // Pedidos ontem
    const { data: ordersYesterday, error: ordersYesterdayError } = await supabase
      .from('orders')
      .select('id')
      .eq('store_id', profile.store_id)
      .gte('created_at', yesterdayStart.toISOString())
      .lte('created_at', yesterdayEnd.toISOString());

    if (ordersYesterdayError) throw ordersYesterdayError;

    // Produtos ativos
    const { data: productsActive, error: productsError } = await supabase
      .from('products')
      .select('id')
      .eq('store_id', profile.store_id)
      .eq('is_active', true);

    if (productsError) throw productsError;

    // Total de produtos (para calcular crescimento)
    const { data: allProducts, error: allProductsError } = await supabase
      .from('products')
      .select('id, created_at')
      .eq('store_id', profile.store_id);

    if (allProductsError) throw allProductsError;

    // Calcular métricas
    const salesThisMonthTotal = salesThisMonth.reduce((sum, order) => sum + Number(order.total_amount), 0);
    const salesLastMonthTotal = salesLastMonth.reduce((sum, order) => sum + Number(order.total_amount), 0);
    
    const ordersThisMonth = salesThisMonth.length;
    const ordersLastMonthCount = salesLastMonth.length;
    
    const activeProductsCount = productsActive.length;
    const productsThisMonth = allProducts.filter(p => 
      new Date(p.created_at) >= monthStart && new Date(p.created_at) <= monthEnd
    ).length;
    const productsLastMonthCount = allProducts.filter(p => 
      new Date(p.created_at) >= lastMonthStart && new Date(p.created_at) <= lastMonthEnd
    ).length;

    // Calcular growths
    const salesGrowth = salesLastMonthTotal > 0 ? 
      ((salesThisMonthTotal - salesLastMonthTotal) / salesLastMonthTotal) * 100 : 0;
    
    const ordersGrowth = ordersYesterday.length > 0 ? 
      ((ordersToday.length - ordersYesterday.length) / ordersYesterday.length) * 100 : 0;
    
    const productsGrowth = productsLastMonthCount > 0 ? 
      ((productsThisMonth - productsLastMonthCount) / productsLastMonthCount) * 100 : 0;

    // Simulação básica de visitantes (baseado em pedidos)
    const visitorsToday = Math.max(ordersToday.length * 8, 50); // Estimativa: 8 visitantes por pedido
    const visitorsYesterday = Math.max(ordersYesterday.length * 8, 50);
    const visitorsGrowth = visitorsYesterday > 0 ? 
      ((visitorsToday - visitorsYesterday) / visitorsYesterday) * 100 : 0;

    return {
      salesThisMonth: salesThisMonthTotal,
      ordersToday: ordersToday.length,
      activeProducts: activeProductsCount,
      visitors: visitorsToday,
      salesGrowth,
      ordersGrowth,
      productsGrowth,
      visitorsGrowth
    };
  };

  return useQuery({
    queryKey: ['dashboardMetrics', profile?.store_id],
    queryFn: fetchDashboardMetrics,
    enabled: !!profile?.store_id,
    refetchOnWindowFocus: false,
    staleTime: 5 * 60 * 1000, // 5 minutos
  });
};
