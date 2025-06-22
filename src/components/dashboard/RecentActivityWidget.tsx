
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, Package, ShoppingCart, TrendingUp, User } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface ActivityItem {
  id: string;
  type: 'order' | 'product' | 'stock' | 'customer';
  title: string;
  description: string;
  timestamp: Date;
  status?: 'success' | 'warning' | 'info';
}

interface RecentActivityWidgetProps {
  activities?: ActivityItem[];
  maxItems?: number;
}

const RecentActivityWidget: React.FC<RecentActivityWidgetProps> = ({ 
  activities = [], 
  maxItems = 5 
}) => {
  // Atividades de exemplo - em produção viriam de hooks de dados reais
  const defaultActivities: ActivityItem[] = [
    {
      id: '1',
      type: 'order',
      title: 'Novo Pedido #1234',
      description: 'João Silva - R$ 150,00',
      timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 min atrás
      status: 'success'
    },
    {
      id: '2',
      type: 'product',
      title: 'Produto Cadastrado',
      description: 'Camiseta Polo Azul',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2h atrás
      status: 'info'
    },
    {
      id: '3',
      type: 'stock',
      title: 'Estoque Atualizado',
      description: 'Tênis Esportivo - Nova entrada',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4), // 4h atrás
      status: 'info'
    },
    {
      id: '4',
      type: 'order',
      title: 'Pedido Confirmado #1230',
      description: 'Maria Santos - R$ 89,90',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 6), // 6h atrás
      status: 'success'
    },
    {
      id: '5',
      type: 'customer',
      title: 'Novo Cliente',
      description: 'Carlos Oliveira se cadastrou',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 8), // 8h atrás
      status: 'info'
    }
  ];

  const displayActivities = (activities.length > 0 ? activities : defaultActivities)
    .slice(0, maxItems);

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
        <div className="space-y-3">
          {displayActivities.map((activity) => {
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
        
        {displayActivities.length === 0 && (
          <div className="text-center py-6 text-muted-foreground">
            <Clock className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">Nenhuma atividade recente</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default RecentActivityWidget;
