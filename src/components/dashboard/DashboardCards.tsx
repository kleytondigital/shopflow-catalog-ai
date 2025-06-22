
import React from 'react';
import { TrendingUp, Package, ShoppingCart, Users, DollarSign, Store } from 'lucide-react';
import AppleDashboardCard from './AppleDashboardCard';
import { useDashboardMetrics } from '@/hooks/useDashboardMetrics';
import { useSuperadminMetrics } from '@/hooks/useSuperadminMetrics';
import '@/styles/dashboard-apple.css';

interface DashboardCardsProps {
  userRole: 'superadmin' | 'admin';
}

const DashboardCards = ({ userRole }: DashboardCardsProps) => {
  const { data: storeMetrics, isLoading: storeLoading, error: storeError } = useDashboardMetrics();
  const { data: adminMetrics, isLoading: adminLoading, error: adminError } = useSuperadminMetrics();

  const isLoading = userRole === 'superadmin' ? adminLoading : storeLoading;
  const error = userRole === 'superadmin' ? adminError : storeError;

  if (isLoading) {
    return (
      <div className="apple-grid apple-grid-cols-1 apple-grid-md-2 apple-grid-lg-4">
        {[1, 2, 3, 4].map((index) => (
          <div key={index} className="apple-metric-card">
            <div className="apple-metric-header">
              <div className="flex-1">
                <div className="apple-loading" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    console.error('Erro ao carregar métricas:', error);
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const adminStats = [
    {
      title: 'Vendas do Mês',
      value: storeMetrics ? formatCurrency(storeMetrics.salesThisMonth) : 'R$ 0,00',
      subtitle: 'vendas confirmadas',
      icon: DollarSign,
      trend: storeMetrics ? {
        value: Math.round(storeMetrics.salesGrowth),
        isPositive: storeMetrics.salesGrowth >= 0
      } : undefined,
      variant: 'green' as const
    },
    {
      title: 'Pedidos Hoje',
      value: storeMetrics?.ordersToday || 0,
      subtitle: 'novos pedidos',
      icon: ShoppingCart,
      trend: storeMetrics ? {
        value: Math.round(storeMetrics.ordersGrowth),
        isPositive: storeMetrics.ordersGrowth >= 0
      } : undefined,
      variant: 'blue' as const
    },
    {
      title: 'Produtos Ativos',
      value: storeMetrics?.activeProducts || 0,
      subtitle: 'produtos disponíveis',
      icon: Package,
      trend: storeMetrics ? {
        value: Math.round(storeMetrics.productsGrowth),
        isPositive: storeMetrics.productsGrowth >= 0
      } : undefined,
      variant: 'purple' as const
    },
    {
      title: 'Visitantes',
      value: storeMetrics?.visitors || 0,
      subtitle: 'acessos hoje',
      icon: Users,
      trend: storeMetrics ? {
        value: Math.round(storeMetrics.visitorsGrowth),
        isPositive: storeMetrics.visitorsGrowth >= 0
      } : undefined,
      variant: 'orange' as const
    }
  ];

  const superadminStats = [
    {
      title: 'Total de Lojas',
      value: adminMetrics?.totalStores || 0,
      subtitle: 'lojas ativas',
      icon: Store,
      trend: adminMetrics ? {
        value: adminMetrics.storesGrowth,
        isPositive: adminMetrics.storesGrowth >= 0
      } : undefined,
      variant: 'blue' as const
    },
    {
      title: 'Receita Total',
      value: adminMetrics ? formatCurrency(adminMetrics.totalRevenue) : 'R$ 0,00',
      subtitle: 'receita mensal',
      icon: DollarSign,
      trend: adminMetrics ? {
        value: adminMetrics.revenueGrowth,
        isPositive: adminMetrics.revenueGrowth >= 0
      } : undefined,
      variant: 'green' as const
    },
    {
      title: 'Pedidos Hoje',
      value: adminMetrics?.ordersToday || 0,
      subtitle: 'pedidos no sistema',
      icon: ShoppingCart,
      trend: adminMetrics ? {
        value: adminMetrics.ordersGrowth,
        isPositive: adminMetrics.ordersGrowth >= 0
      } : undefined,
      variant: 'orange' as const
    },
    {
      title: 'Produtos Cadastrados',
      value: adminMetrics?.totalProducts || 0,
      subtitle: 'produtos no sistema',
      icon: Package,
      trend: adminMetrics ? {
        value: adminMetrics.productsGrowth,
        isPositive: adminMetrics.productsGrowth >= 0
      } : undefined,
      variant: 'purple' as const
    }
  ];

  const stats = userRole === 'superadmin' ? superadminStats : adminStats;

  return (
    <div className="apple-grid apple-grid-cols-1 apple-grid-md-2 apple-grid-lg-4">
      {stats.map((stat, index) => (
        <AppleDashboardCard
          key={index}
          title={stat.title}
          value={stat.value}
          subtitle={stat.subtitle}
          icon={stat.icon}
          trend={stat.trend}
          variant={stat.variant}
        />
      ))}
    </div>
  );
};

export default DashboardCards;
