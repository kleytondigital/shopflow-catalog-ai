
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Package, 
  ShoppingCart, 
  BarChart3, 
  Settings, 
  Tag, 
  Truck, 
  Users,
  Palette
} from 'lucide-react';
import { ProtectedMenuItem } from '@/components/billing/ProtectedMenuItem';

const ProtectedNavigationPanel = () => {
  const navigate = useNavigate();

  const navigationItems = [
    {
      title: 'Produtos',
      description: 'Gerencie seu catálogo',
      icon: Package,
      href: '/products',
      color: 'bg-blue-500 hover:bg-blue-600'
    },
    {
      title: 'Pedidos',
      description: 'Acompanhe suas vendas',
      icon: ShoppingCart,
      href: '/orders',
      color: 'bg-green-500 hover:bg-green-600'
    },
    {
      title: 'Templates e Design',
      description: 'Personalize seu catálogo',
      icon: Palette,
      href: '/visual-editor',
      color: 'bg-purple-500 hover:bg-purple-600'
    },
    {
      title: 'Cupons',
      description: 'Crie promoções',
      icon: Tag,
      href: '/coupons',
      color: 'bg-orange-500 hover:bg-orange-600',
      benefitKey: 'discount_coupons',
      requiresPremium: true
    },
    {
      title: 'Entrega',
      description: 'Configure fretes',
      icon: Truck,
      href: '/deliveries',
      color: 'bg-cyan-500 hover:bg-cyan-600',
      benefitKey: 'shipping_calculator',
      requiresPremium: true
    },
    {
      title: 'Relatórios',
      description: 'Analise performance',
      icon: BarChart3,
      href: '/reports',
      color: 'bg-indigo-500 hover:bg-indigo-600',
      benefitKey: 'dedicated_support',
      requiresPremium: true
    },
    {
      title: 'Clientes',
      description: 'Gerencie contatos',
      icon: Users,
      href: '/customers',
      color: 'bg-pink-500 hover:bg-pink-600'
    },
    {
      title: 'Configurações',
      description: 'Ajustes da loja',
      icon: Settings,
      href: '/settings',
      color: 'bg-gray-500 hover:bg-gray-600'
    }
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {navigationItems.map((item) => (
        <ProtectedMenuItem
          key={item.title}
          name={item.title}
          href={item.href}
          icon={item.icon}
          benefitKey={(item as any).benefitKey}
          requiresPremium={(item as any).requiresPremium}
          renderAs="card"
          description={item.description}
          color={item.color}
        />
      ))}
    </div>
  );
};

export default ProtectedNavigationPanel;
