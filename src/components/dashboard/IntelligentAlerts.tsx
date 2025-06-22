
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Package, ShoppingCart, TrendingUp, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface Alert {
  id: string;
  type: 'warning' | 'info' | 'success' | 'error';
  title: string;
  message: string;
  count?: number;
  action?: {
    label: string;
    path: string;
  };
  icon: React.ComponentType<{ className?: string }>;
}

const IntelligentAlerts: React.FC = () => {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const [dismissedAlerts, setDismissedAlerts] = React.useState<string[]>([]);

  // Buscar produtos com estoque baixo
  const { data: lowStockProducts } = useQuery({
    queryKey: ['lowStockProducts', profile?.store_id],
    queryFn: async () => {
      if (!profile?.store_id) return [];
      
      const { data, error } = await supabase
        .from('products')
        .select('id, name, stock, stock_alert_threshold')
        .eq('store_id', profile.store_id)
        .eq('is_active', true);

      if (error) throw error;

      return data.filter(product => {
        const threshold = product.stock_alert_threshold || 5;
        return product.stock <= threshold && product.stock > 0;
      });
    },
    enabled: !!profile?.store_id
  });

  // Buscar produtos sem estoque
  const { data: outOfStockProducts } = useQuery({
    queryKey: ['outOfStockProducts', profile?.store_id],
    queryFn: async () => {
      if (!profile?.store_id) return [];
      
      const { data, error } = await supabase
        .from('products')
        .select('id, name, stock')
        .eq('store_id', profile.store_id)
        .eq('is_active', true)
        .eq('stock', 0);

      if (error) throw error;
      return data;
    },
    enabled: !!profile?.store_id
  });

  // Buscar pedidos pendentes
  const { data: pendingOrders } = useQuery({
    queryKey: ['pendingOrders', profile?.store_id],
    queryFn: async () => {
      if (!profile?.store_id) return [];
      
      const { data, error } = await supabase
        .from('orders')
        .select('id, customer_name, total_amount, created_at')
        .eq('store_id', profile.store_id)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!profile?.store_id
  });

  // Gerar alertas baseados nos dados reais
  const generateAlerts = (): Alert[] => {
    const alerts: Alert[] = [];

    // Alerta de estoque baixo
    if (lowStockProducts && lowStockProducts.length > 0) {
      alerts.push({
        id: 'low-stock',
        type: 'warning',
        title: 'Estoque Baixo',
        message: `${lowStockProducts.length} produto${lowStockProducts.length > 1 ? 's' : ''} com estoque baixo`,
        count: lowStockProducts.length,
        action: { label: 'Ver Produtos', path: '/products?filter=low-stock' },
        icon: Package
      });
    }

    // Alerta de produtos sem estoque
    if (outOfStockProducts && outOfStockProducts.length > 0) {
      alerts.push({
        id: 'out-of-stock',
        type: 'error',
        title: 'Sem Estoque',
        message: `${outOfStockProducts.length} produto${outOfStockProducts.length > 1 ? 's' : ''} sem estoque`,
        count: outOfStockProducts.length,
        action: { label: 'Repor Estoque', path: '/products?filter=out-of-stock' },
        icon: Package
      });
    }

    // Alerta de pedidos pendentes
    if (pendingOrders && pendingOrders.length > 0) {
      alerts.push({
        id: 'pending-orders',
        type: 'info',
        title: 'Pedidos Pendentes',
        message: `${pendingOrders.length} pedido${pendingOrders.length > 1 ? 's' : ''} aguardando confirmação`,
        count: pendingOrders.length,
        action: { label: 'Ver Pedidos', path: '/orders?status=pending' },
        icon: ShoppingCart
      });
    }

    return alerts;
  };

  const alerts = generateAlerts();
  const activeAlerts = alerts.filter(alert => !dismissedAlerts.includes(alert.id));

  const handleDismiss = (alertId: string) => {
    setDismissedAlerts(prev => [...prev, alertId]);
  };

  const handleAction = (path: string) => {
    navigate(path);
  };

  const getAlertVariant = (type: Alert['type']) => {
    switch (type) {
      case 'warning':
        return 'secondary';
      case 'error':
        return 'destructive';
      case 'success':
        return 'default';
      case 'info':
        return 'outline';
      default:
        return 'default';
    }
  };

  if (activeAlerts.length === 0) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <TrendingUp className="h-5 w-5 text-green-500" />
            Tudo em Ordem
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Parabéns! Não há alertas importantes no momento. Sua loja está funcionando perfeitamente.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <AlertTriangle className="h-5 w-5 text-orange-500" />
          Alertas Inteligentes
          <Badge variant="secondary" className="ml-auto">
            {activeAlerts.length}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {activeAlerts.map((alert) => {
          const IconComponent = alert.icon;
          return (
            <div
              key={alert.id}
              className="flex items-start gap-3 p-3 rounded-lg border bg-muted/20 hover:bg-muted/40 transition-colors"
            >
              <div className="flex-shrink-0 mt-0.5">
                <IconComponent className="h-4 w-4 text-muted-foreground" />
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-sm font-medium">{alert.title}</p>
                      <Badge variant={getAlertVariant(alert.type)} className="text-xs">
                        {alert.count || 1}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{alert.message}</p>
                  </div>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDismiss(alert.id)}
                    className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
                
                {alert.action && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleAction(alert.action!.path)}
                    className="mt-2 h-7 text-xs"
                  >
                    {alert.action.label}
                  </Button>
                )}
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
};

export default IntelligentAlerts;
