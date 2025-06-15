
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { usePlanPermissions } from '@/hooks/usePlanPermissions';
import { Badge } from '@/components/ui/badge';
import { Lock } from 'lucide-react';
import { toast } from 'sonner';
import { 
  Package, ShoppingCart, Settings, BarChart3, 
  Users, Tag, Truck, CreditCard
} from 'lucide-react';

interface NavigationItem {
  title: string;
  description: string;
  icon: React.ElementType;
  route: string;
  color: string;
  bgColor: string;
  benefitKey?: string;
  requiresPremium?: boolean;
}

const ProtectedMobileNavigationPanel = () => {
  const navigate = useNavigate();
  const { hasBenefit, isSuperadmin } = usePlanPermissions();

  const navigationItems: NavigationItem[] = [
    {
      title: 'Produtos',
      description: 'Gerencie catálogo',
      icon: Package,
      route: '/products',
      color: 'text-blue-600',
      bgColor: 'bg-blue-100'
    },
    {
      title: 'Pedidos',
      description: 'Acompanhe vendas',
      icon: ShoppingCart,
      route: '/orders',
      color: 'text-green-600',
      bgColor: 'bg-green-100'
    },
    {
      title: 'Clientes',
      description: 'Base de clientes',
      icon: Users,
      route: '/customers',
      color: 'text-purple-600',
      bgColor: 'bg-purple-100'
    },
    {
      title: 'Cupons',
      description: 'Promoções',
      icon: Tag,
      route: '/coupons',
      color: 'text-orange-600',
      bgColor: 'bg-orange-100',
      benefitKey: 'discount_coupons',
      requiresPremium: true
    },
    {
      title: 'Relatórios',
      description: 'Análises',
      icon: BarChart3,
      route: '/reports',
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-100',
      benefitKey: 'dedicated_support',
      requiresPremium: true
    },
    {
      title: 'Envios',
      description: 'Entregas',
      icon: Truck,
      route: '/deliveries',
      color: 'text-teal-600',
      bgColor: 'bg-teal-100',
      benefitKey: 'shipping_calculator',
      requiresPremium: true
    },
    {
      title: 'Pagamentos',
      description: 'Métodos',
      icon: CreditCard,
      route: '/payments',
      color: 'text-cyan-600',
      bgColor: 'bg-cyan-100'
    },
    {
      title: 'Configurações',
      description: 'Ajustes',
      icon: Settings,
      route: '/settings',
      color: 'text-gray-600',
      bgColor: 'bg-gray-100'
    }
  ];

  const handleItemClick = (item: NavigationItem) => {
    // Verificar se a funcionalidade requer premium e se o usuário tem acesso
    if (item.requiresPremium && !isSuperadmin && !hasBenefit(item.benefitKey!)) {
      toast.error(`${item.title} está disponível apenas no plano Premium. Faça upgrade para ter acesso!`);
      return;
    }
    
    navigate(item.route);
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3 md:gap-4">
      {navigationItems.map((item) => {
        const isBlocked = item.requiresPremium && !isSuperadmin && !hasBenefit(item.benefitKey!);
        
        return (
          <Card 
            key={item.route}
            className={`cursor-pointer hover:scale-105 transition-all duration-300 group shadow-md hover:shadow-lg relative ${
              isBlocked ? 'opacity-60' : ''
            }`}
            onClick={() => handleItemClick(item)}
          >
            <CardContent className="flex flex-col items-center justify-center p-3 md:p-6 text-center">
              <div className={`${item.bgColor} p-2 md:p-4 rounded-lg md:rounded-xl mb-2 md:mb-4 group-hover:scale-110 transition-transform duration-300 relative`}>
                <item.icon className={`h-5 w-5 md:h-8 md:w-8 ${item.color}`} />
                {isBlocked && (
                  <Lock className="h-3 w-3 absolute -top-1 -right-1 text-orange-500" />
                )}
              </div>
              <div className="flex items-center gap-1 mb-1">
                <h3 className="font-semibold text-xs md:text-sm truncate w-full">
                  {item.title}
                </h3>
                {isBlocked && (
                  <Badge variant="outline" className="text-xs bg-orange-50 text-orange-700 border-orange-200 hidden md:block">
                    Premium
                  </Badge>
                )}
              </div>
              <p className="text-xs text-muted-foreground hidden md:block truncate">
                {item.description}
              </p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default ProtectedMobileNavigationPanel;
