
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Package, 
  ShoppingCart, 
  BarChart3, 
  Settings, 
  Tag,
  Truck,
  Store,
  Users,
  CreditCard,
  Globe,
  ChevronRight
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

const AppleNavigationCard: React.FC = () => {
  const navigate = useNavigate();
  const { isSuperadmin } = useAuth();

  const storeAdminNavigation = [
    { 
      name: 'Produtos', 
      href: '/products', 
      icon: Package,
      description: 'Gerenciar catálogo de produtos'
    },
    { 
      name: 'Pedidos', 
      href: '/orders', 
      icon: ShoppingCart,
      description: 'Acompanhar vendas e entregas'
    },
    { 
      name: 'Cupons', 
      href: '/coupons', 
      icon: Tag,
      description: 'Criar ofertas e promoções'
    },
    { 
      name: 'Entrega', 
      href: '/deliveries', 
      icon: Truck,
      description: 'Configurar métodos de envio'
    },
    { 
      name: 'Relatórios', 
      href: '/reports', 
      icon: BarChart3,
      description: 'Análises e métricas'
    },
    { 
      name: 'Configurações', 
      href: '/settings', 
      icon: Settings,
      description: 'Ajustes da loja'
    }
  ];

  const superadminNavigation = [
    { 
      name: 'Lojas', 
      href: '/stores', 
      icon: Store,
      description: 'Gerenciar todas as lojas'
    },
    { 
      name: 'Usuários', 
      href: '/users', 
      icon: Users,
      description: 'Administrar usuários'
    },
    { 
      name: 'Financeiro', 
      href: '/billing', 
      icon: CreditCard,
      description: 'Gestão de pagamentos'
    },
    { 
      name: 'Integrações', 
      href: '/global-integrations', 
      icon: Globe,
      description: 'Configurações globais'
    },
    { 
      name: 'Relatórios', 
      href: '/reports', 
      icon: BarChart3,
      description: 'Métricas do sistema'
    }
  ];

  const navigation = isSuperadmin ? superadminNavigation : storeAdminNavigation;

  return (
    <div className="apple-card">
      <div className="apple-card-header">
        <h3 className="apple-card-title">Navegação Rápida</h3>
        <p className="apple-card-subtitle">Acesse as principais seções</p>
      </div>
      <div className="apple-card-content">
        <div className="apple-space-y-2">
          {navigation.map((item) => (
            <button
              key={item.name}
              onClick={() => navigate(item.href)}
              className="w-full flex items-center justify-between p-4 rounded-lg hover:bg-gray-50 transition-colors text-left group"
            >
              <div className="flex items-center gap-4">
                <div className="apple-metric-icon blue">
                  <item.icon size={18} />
                </div>
                <div>
                  <p className="font-medium text-gray-800">{item.name}</p>
                  <p className="text-sm text-gray-500">{item.description}</p>
                </div>
              </div>
              <ChevronRight 
                size={16} 
                className="text-gray-400 group-hover:text-gray-600 transition-colors" 
              />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AppleNavigationCard;
