
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { startOfDay, endOfDay, startOfMonth, endOfMonth } from 'date-fns';

export interface SuperadminMetrics {
  totalStores: number;
  totalRevenue: number;
  ordersToday: number;
  totalProducts: number;
  storesGrowth: number;
  revenueGrowth: number;
  ordersGrowth: number;
  productsGrowth: number;
}

export const useSuperadminMetrics = () => {
  const fetchSuperadminMetrics = async (): Promise<SuperadminMetrics> => {
    const now = new Date();
    const today = new Date();
    const monthStart = startOfMonth(now);
    const monthEnd = endOfMonth(now);
    const todayStart = startOfDay(today);
    const todayEnd = endOfDay(today);

    // Total de lojas ativas
    const { data: stores, error: storesError } = await supabase
      .from('stores')
      .select('id, created_at')
      .eq('is_active', true);

    if (storesError) throw storesError;

    // Receita total do mês
    const { data: orders, error: ordersError } = await supabase
      .from('orders')
      .select('total_amount, created_at, store_id')
      .gte('created_at', monthStart.toISOString())
      .lte('created_at', monthEnd.toISOString())
      .in('status', ['confirmed', 'shipping', 'delivered']);

    if (ordersError) throw ordersError;

    // Pedidos hoje
    const { data: ordersToday, error: ordersTodayError } = await supabase
      .from('orders')
      .select('id')
      .gte('created_at', todayStart.toISOString())
      .lte('created_at', todayEnd.toISOString());

    if (ordersTodayError) throw ordersTodayError;

    // Total de produtos
    const { data: products, error: productsError } = await supabase
      .from('products')
      .select('id, created_at')
      .eq('is_active', true);

    if (productsError) throw productsError;

    // Calcular métricas
    const totalRevenue = orders.reduce((sum, order) => sum + Number(order.total_amount), 0);

    return {
      totalStores: stores.length,
      totalRevenue,
      ordersToday: ordersToday.length,
      totalProducts: products.length,
      storesGrowth: 12, // Simulado por enquanto
      revenueGrowth: 8, // Simulado por enquanto
      ordersGrowth: 15, // Simulado por enquanto
      productsGrowth: 23 // Simulado por enquanto
    };
  };

  return useQuery({
    queryKey: ['superadminMetrics'],
    queryFn: fetchSuperadminMetrics,
    refetchOnWindowFocus: false,
    staleTime: 5 * 60 * 1000, // 5 minutos
  });
};
