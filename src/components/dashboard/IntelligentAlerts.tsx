
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Package, ShoppingCart, TrendingUp, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface Alert {
  id: string;
  type: 'warning' | 'info' | 'success' | 'error';
  title: string;
  message: string;
  action?: {
    label: string;
    path: string;
  };
  icon: React.ComponentType<{ className?: string }>;
}

interface IntelligentAlertsProps {
  alerts?: Alert[];
}

const IntelligentAlerts: React.FC<IntelligentAlertsProps> = ({ alerts = [] }) => {
  const navigate = useNavigate();
  const [dismissedAlerts, setDismissedAlerts] = React.useState<string[]>([]);

  // Alertas de exemplo - em produção viriam do hook de métricas
  const defaultAlerts: Alert[] = [
    {
      id: '1',
      type: 'warning',
      title: 'Estoque Baixo',
      message: '3 produtos com estoque abaixo do limite',
      action: { label: 'Ver Produtos', path: '/products?filter=low-stock' },
      icon: Package
    },
    {
      id: '2',
      type: 'info',
      title: 'Pedidos Pendentes',
      message: '5 pedidos aguardando confirmação',
      action: { label: 'Ver Pedidos', path: '/orders?status=pending' },
      icon: ShoppingCart
    },
    {
      id: '3',
      type: 'success',
      title: 'Oportunidade',
      message: 'Vendas aumentaram 15% esta semana',
      action: { label: 'Ver Relatório', path: '/reports' },
      icon: TrendingUp
    }
  ];

  const activeAlerts = (alerts.length > 0 ? alerts : defaultAlerts)
    .filter(alert => !dismissedAlerts.includes(alert.id));

  const handleDismiss = (alertId: string) => {
    setDismissedAlerts(prev => [...prev, alertId]);
  };

  const handleAction = (path: string) => {
    navigate(path);
  };

  const getAlertVariant = (type: Alert['type']) => {
    switch (type) {
      case 'warning':
        return 'destructive';
      case 'error':
        return 'destructive';
      case 'success':
        return 'default';
      case 'info':
        return 'secondary';
      default:
        return 'default';
    }
  };

  if (activeAlerts.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <AlertTriangle className="h-5 w-5 text-orange-500" />
          Alertas Inteligentes
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
                        {alert.type}
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
