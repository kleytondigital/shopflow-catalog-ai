
import React from 'react';
import { TrendingUp, TrendingDown, Package, ShoppingCart, Users, DollarSign } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string;
  change: string;
  changeType: 'increase' | 'decrease';
  icon: React.ReactNode;
}

const StatCard = ({ title, value, change, changeType, icon }: StatCardProps) => {
  return (
    <div className="card-modern animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground font-medium">{title}</p>
          <p className="text-2xl font-bold text-foreground mt-1">{value}</p>
          <div className="flex items-center gap-1 mt-2">
            {changeType === 'increase' ? (
              <TrendingUp className="text-green-500" size={16} />
            ) : (
              <TrendingDown className="text-red-500" size={16} />
            )}
            <span className={`text-sm font-medium ${
              changeType === 'increase' ? 'text-green-500' : 'text-red-500'
            }`}>
              {change}
            </span>
            <span className="text-sm text-muted-foreground">vs mês anterior</span>
          </div>
        </div>
        <div className="bg-primary-50 p-3 rounded-lg">
          {icon}
        </div>
      </div>
    </div>
  );
};

interface DashboardCardsProps {
  userRole: 'superadmin' | 'admin';
}

const DashboardCards = ({ userRole }: DashboardCardsProps) => {
  const superadminStats = [
    {
      title: 'Total de Lojas',
      value: '127',
      change: '+12%',
      changeType: 'increase' as const,
      icon: <Users className="text-primary" size={24} />
    },
    {
      title: 'Receita Total',
      value: 'R$ 45.230',
      change: '+8%',
      changeType: 'increase' as const,
      icon: <DollarSign className="text-primary" size={24} />
    },
    {
      title: 'Pedidos Hoje',
      value: '892',
      change: '+15%',
      changeType: 'increase' as const,
      icon: <ShoppingCart className="text-primary" size={24} />
    },
    {
      title: 'Produtos Cadastrados',
      value: '12.456',
      change: '+23%',
      changeType: 'increase' as const,
      icon: <Package className="text-primary" size={24} />
    }
  ];

  const adminStats = [
    {
      title: 'Vendas do Mês',
      value: 'R$ 12.450',
      change: '+18%',
      changeType: 'increase' as const,
      icon: <DollarSign className="text-primary" size={24} />
    },
    {
      title: 'Pedidos Hoje',
      value: '23',
      change: '+12%',
      changeType: 'increase' as const,
      icon: <ShoppingCart className="text-primary" size={24} />
    },
    {
      title: 'Produtos Ativos',
      value: '156',
      change: '+5%',
      changeType: 'increase' as const,
      icon: <Package className="text-primary" size={24} />
    },
    {
      title: 'Visitantes',
      value: '1.247',
      change: '-3%',
      changeType: 'decrease' as const,
      icon: <Users className="text-primary" size={24} />
    }
  ];

  const stats = userRole === 'superadmin' ? superadminStats : adminStats;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {stats.map((stat, index) => (
        <StatCard
          key={index}
          title={stat.title}
          value={stat.value}
          change={stat.change}
          changeType={stat.changeType}
          icon={stat.icon}
        />
      ))}
    </div>
  );
};

export default DashboardCards;
