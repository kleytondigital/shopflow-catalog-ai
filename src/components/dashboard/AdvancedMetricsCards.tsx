
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, Users, ShoppingBag, Percent, DollarSign } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { subDays, startOfDay, endOfDay } from 'date-fns';
import { DateRange } from './DateRangeFilter';
import { Skeleton } from '@/components/ui/skeleton';

interface AdvancedMetricsCardsProps {
  dateRange: DateRange;
}

interface AdvancedMetrics {
  conversionRate: number;
  averageTicket: number;
  repeatCustomers: number;
  topCategory: string;
  categorySales: number;
}

const AdvancedMetricsCards: React.FC<AdvancedMetricsCardsProps> = ({ dateRange }) => {
  const { profile } = useAuth();

  const getDaysFromRange = (range: DateRange): number => {
    switch (range) {
      case '7d': return 7;
      case '30d': return 30;
      case '90d': return 90;
      case '1y': return 365;
      default: return 30;
    }
  };

  const { data: metrics, isLoading } = useQuery({
    queryKey: ['advancedMetrics', profile?.store_id, dateRange],
    queryFn: async (): Promise<AdvancedMetrics> => {
      if (!profile?.store_id) throw new Error('Store ID não encontrado');

      const days = getDaysFromRange(dateRange);
      const fromDate = startOfDay(subDays(new Date(), days));
      const toDate = endOfDay(new Date());

      // Buscar pedidos do período
      const { data: orders, error: ordersError } = await supabase
        .from('orders')
        .select('id, customer_email, total_amount, items, created_at')
        .eq('store_id', profile.store_id)
        .gte('created_at', fromDate.toISOString())
        .lte('created_at', toDate.toISOString())
        .in('status', ['confirmed', 'shipping', 'delivered']);

      if (ordersError) throw ordersError;

      // Calcular ticket médio
      const totalRevenue = orders.reduce((sum, order) => sum + Number(order.total_amount), 0);
      const averageTicket = orders.length > 0 ? totalRevenue / orders.length : 0;

      // Calcular clientes recorrentes
      const customerEmails = orders
        .filter(order => order.customer_email)
        .map(order => order.customer_email);
      
      const uniqueCustomers = new Set(customerEmails).size;
      const totalOrders = orders.length;
      const repeatCustomers = totalOrders > uniqueCustomers ? totalOrders - uniqueCustomers : 0;

      // Buscar visitantes estimados (baseado em produtos visualizados ou estimativa)
      const estimatedVisitors = Math.max(totalOrders * 8, 100); // Estimativa: 8 visitantes por pedido
      const conversionRate = estimatedVisitors > 0 ? (totalOrders / estimatedVisitors) * 100 : 0;

      // Análise por categoria
      const categoryStats: { [key: string]: number } = {};
      orders.forEach(order => {
        if (order.items && Array.isArray(order.items)) {
          order.items.forEach((item: any) => {
            const category = item.category || 'Sem categoria';
            categoryStats[category] = (categoryStats[category] || 0) + (item.quantity * Number(item.price));
          });
        }
      });

      const topCategory = Object.keys(categoryStats).reduce((a, b) => 
        categoryStats[a] > categoryStats[b] ? a : b, 'Sem categoria'
      );
      const categorySales = categoryStats[topCategory] || 0;

      return {
        conversionRate,
        averageTicket,
        repeatCustomers,
        topCategory,
        categorySales
      };
    },
    enabled: !!profile?.store_id,
    refetchOnWindowFocus: false
  });

  const formatCurrency = (value: number) => {
    return new Int NumeFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
        {[1, 2, 3, 4, 5].map((index) => (
          <Card key={index}>
            <CardHeader className="pb-2">
              <Skeleton className="h-4 w-20" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-16 mb-2" />
              <Skeleton className="h-3 w-24" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!metrics) return null;

  const cards = [
    {
      title: 'Taxa Conversão',
      value: `${metrics.conversionRate.toFixed(1)}%`,
      description: 'visitantes compraram',
      icon: Percent,
      color: 'text-blue-600'
    },
    {
      title: 'Ticket Médio',
      value: formatCurrency(metrics.averageTicket),
      description: 'valor por pedido',
      icon: DollarSign,
      color: 'text-green-600'
    },
    {
      title: 'Clientes Recorrentes',
      value: metrics.repeatCustomers.toString(),
      description: 'compraram novamente',
      icon: Users,
      color: 'text-purple-600'
    },
    {
      title: 'Top Categoria',
      value: metrics.topCategory,
      description: formatCurrency(metrics.categorySales),
      icon: ShoppingBag,
      color: 'text-orange-600'
    },
    {
      title: 'Performance',
      value: metrics.conversionRate > 2 ? 'Excelente' : metrics.conversionRate > 1 ? 'Boa' : 'Regular',
      description: 'tendência geral',
      icon: TrendingUp,
      color: metrics.conversionRate > 2 ? 'text-green-600' : metrics.conversionRate > 1 ? 'text-yellow-600' : 'text-red-600'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
      {cards.map((card, index) => (
        <Card key={index} className="hover:shadow-md transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <card.icon className={`h-4 w-4 ${card.color}`} />
              {card.title}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              <p className="text-2xl font-bold">{card.value}</p>
              <p className="text-xs text-muted-foreground">{card.description}</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default AdvancedMetricsCards;
