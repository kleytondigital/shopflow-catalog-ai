
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { usePlanPermissions } from '@/hooks/usePlanPermissions';
import { Badge } from '@/components/ui/badge';
import { Lock } from 'lucide-react';
import { toast } from 'sonner';
import { 
  Package, ShoppingCart, Settings, BarChart3, 
  Users, Tag, Truck, FileText, Bell, Zap,
  Palette, Globe, MessageSquare, CreditCard
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

const ProtectedNavigationPanel = () => {
  const navigate = useNavigate();
  const { hasBenefit, isSuperadmin } = usePlanPermissions();

  const navigationItems: NavigationItem[] = [
    {
      title: 'Produtos',
      description: 'Gerencie seu catálogo',
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
      description: 'Descontos e promoções',
      icon: Tag,
      route: '/coupons',
      color: 'text-orange-600',
      bgColor: 'bg-orange-100',
      benefitKey: 'discount_coupons',
      requiresPremium: true
    },
    {
      title: 'Relatórios',
      description: 'Análises e métricas',
      icon: BarChart3,
      route: '/reports',
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-100',
      benefitKey: 'dedicated_support',
      requiresPremium: true
    },
    {
      title: 'Envios',
      description: 'Gestão de entregas',
      icon: Truck,
      route: '/deliveries',
      color: 'text-teal-600',
      bgColor: 'bg-teal-100',
      benefitKey: 'shipping_calculator',
      requiresPremium: true
    },
    {
      title: 'Catálogos',
      description: 'Templates e design',
      icon: Palette,
      route: '/catalogs',
      color: 'text-pink-600',
      bgColor: 'bg-pink-100'
    },
    {
      title: 'WhatsApp',
      description: 'Automação e chat',
      icon: MessageSquare,
      route: '/whatsapp',
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-100',
      benefitKey: 'whatsapp_integration',
      requiresPremium: true
    },
    {
      title: 'Pagamentos',
      description: 'Métodos e taxas',
      icon: CreditCard,
      route: '/payments',
      color: 'text-cyan-600',
      bgColor: 'bg-cyan-100'
    },
    {
      title: 'Integrações',
      description: 'APIs e automações',
      icon: Zap,
      route: '/integrations',
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100',
      benefitKey: 'api_access',
      requiresPremium: true
    },
    {
      title: 'Notificações',
      description: 'Alertas e avisos',
      icon: Bell,
      route: '/notifications',
      color: 'text-red-600',
      bgColor: 'bg-red-100'
    },
    {
      title: 'Configurações',
      description: 'Ajustes da loja',
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
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
      {navigationItems.map((item) => {
        const isBlocked = item.requiresPremium && !isSuperadmin && !hasBenefit(item.benefitKey!);
        
        return (
          <Card 
            key={item.route}
            className={`card-modern cursor-pointer hover:scale-105 transition-all duration-300 group relative ${
              isBlocked ? 'opacity-60' : ''
            }`}
            onClick={() => handleItemClick(item)}
          >
            <CardContent className="flex flex-col items-center justify-center p-6 text-center">
              <div className={`${item.bgColor} p-4 rounded-xl mb-4 group-hover:scale-110 transition-transform duration-300 relative`}>
                <item.icon className={`h-8 w-8 ${item.color}`} />
                {isBlocked && (
                  <Lock className="h-3 w-3 absolute -top-1 -right-1 text-orange-500" />
                )}
              </div>
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-semibold text-sm">{item.title}</h3>
                {isBlocked && (
                  <Badge variant="outline" className="text-xs bg-orange-50 text-orange-700 border-orange-200">
                    Premium
                  </Badge>
                )}
              </div>
              <p className="text-xs text-muted-foreground">{item.description}</p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default ProtectedNavigationPanel;
