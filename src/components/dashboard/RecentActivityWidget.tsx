
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Clock, Package, ShoppingCart, TrendingUp, User } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface ActivityItem {
  id: string;
  type: 'order' | 'product' | 'stock' | 'customer';
  title: string;
  description: string;
  timestamp: Date;
  status?: 'success' | 'warning' | 'info';
}

interface RecentActivityWidgetProps {
  maxItems?: number;
}

const RecentActivityWidget: React.FC<RecentActivityWidgetProps> = ({ 
  maxItems = 8 
}) => {
  const { profile } = useAuth();

  // Buscar pedidos recentes
  const { data: recentOrders } = useQuery({
    queryKey: ['recentOrders', profile?.store_id],
    queryFn: async () => {
      if (!profile?.store_id) return [];
      
      const { data, error } = await supabase
        .from('orders')
        .select('id, customer_name, total_amount, status, created_at')
        .eq('store_id', profile.store_id)
        .order('created_at', { ascending: false })
        .limit(5);

      if (error) throw error;
      return data;
    },
    enabled: !!profile?.store_id
  });

  // Buscar produtos recentes
  const { data: recentProducts } = useQuery({
    queryKey: ['recentProducts', profile?.store_id],
    queryFn: async () => {
      if (!profile?.store_id) return [];
      
      const { data, error } = await supabase
        .from('products')
        .select('id, name, retail_price, created_at')
        .eq('store_id', profile.store_id)
        .order('created_at', { ascending: false })
        .limit(3);

      if (error) throw error;
      return data;
    },
    enabled: !!profile?.store_id
  });

  // Buscar movimentações de estoque recentes
  const { data: recentStockMovements } = useQuery({
    queryKey: ['recentStockMovements', profile?.store_id],
    queryFn: async () => {
      if (!profile?.store_id) return [];
      
      const { data, error } = await supabase
        .from('stock_movements')
        .select(`
          id,
          movement_type,
          quantity,
          created_at,
          products!inner(name)
        `)
        .eq('store_id', profile.store_id)
        .order('created_at', { ascending: false })
        .limit(3);

      if (error) throw error;
      return data;
    },
    enabled: !!profile?.store_id
  });

  // Gerar atividades combinadas
  const generateActivities = (): ActivityItem[] => {
    const activities: ActivityItem[] = [];

    // Adicionar pedidos
    recentOrders?.forEach(order => {
      activities.push({
        id: `order-${order.id}`,
        type: 'order',
        title: `Pedido #${order.id.slice(-6).toUpperCase()}`,
        description: `${order.customer_name} - ${new Intl.NumberFormat('pt-BR', {
          style: 'currency',
          currency: 'BRL'
        }).format(Number(order.total_amount))}`,
        timestamp: new Date(order.created_at),
        status: order.status === 'confirmed' ? 'success' : 
               order.status === 'pending' ? 'warning' : 'info'
      });
    });

    // Adicionar produtos
    recentProducts?.forEach(product => {
      activities.push({
        id: `product-${product.id}`,
        type: 'product',
        title: 'Produto Cadastrado',
        description: `${product.name} - ${new Intl.NumberFormat('pt-BR', {
          style: 'currency',
          currency: 'BRL'
        }).format(Number(product.retail_price))}`,
        timestamp: new Date(product.created_at),
        status: 'info'
      });
    });

    // Adicionar movimentações de estoque
    recentStockMovements?.forEach(movement => {
      const isPositive = movement.movement_type === 'entry' || movement.movement_type === 'adjustment_in';
      activities.push({
        id: `stock-${movement.id}`,
        type: 'stock',
        title: `Estoque ${isPositive ? 'Entrada' : 'Saída'}`,
        description: `${movement.products?.name || 'Produto'} - ${isPositive ? '+' : '-'}${movement.quantity} un.`,
        timestamp: new Date(movement.created_at),
        status: isPositive ? 'success' : 'warning'
      });
    });

    // Ordenar por data mais recente e limitar
    return activities
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, maxItems);
  };

  const activities = generateActivities();

  const getActivityIcon = (type: ActivityItem['type']) => {
    switch (type) {
      case 'order':
        return ShoppingCart;
      case 'product':
        return Package;
      case 'stock':
        return TrendingUp;
      case 'customer':
        return User;
      default:
        return Clock;
    }
  };

  const getStatusColor = (status?: ActivityItem['status']) => {
    switch (status) {
      case 'success':
        return 'text-green-500';
      case 'warning':
        return 'text-orange-500';
      case 'info':
        return 'text-blue-500';
      default:
        return 'text-muted-foreground';
    }
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Clock className="h-5 w-5 text-blue-500" />
          Atividade Recente
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3 max-h-80 overflow-y-auto">
          {activities.map((activity) => {
            const IconComponent = getActivityIcon(activity.type);
            return (
              <div key={activity.id} className="flex items-start gap-3 p-2 hover:bg-muted/50 rounded-lg transition-colors">
                <div className={`flex-shrink-0 mt-1 ${getStatusColor(activity.status)}`}>
                  <IconComponent className="h-4 w-4" />
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-foreground truncate">
                        {activity.title}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {activity.description}
                      </p>
                    </div>
                    
                    <time className="text-xs text-muted-foreground whitespace-nowrap">
                      {formatDistanceToNow(activity.timestamp, {
                        addSuffix: true,
                        locale: ptBR
                      })}
                    </time>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        
        {activities.length === 0 && (
          <div className="text-center py-6 text-muted-foreground">
            <Clock className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">Nenhuma atividade recente</p>
            <p className="text-xs mt-1">Suas próximas ações aparecerão aqui</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default RecentActivityWidget;
