import React from "react";
import {
  TrendingUp,
  Package,
  ShoppingCart,
  Users,
  DollarSign,
} from "lucide-react";
import ResponsiveDashboardCard from "./ResponsiveDashboardCard";
import { useDashboardMetrics } from "@/hooks/useDashboardMetrics";
import { useSuperadminMetrics } from "@/hooks/useSuperadminMetrics";
import { Skeleton } from "@/components/ui/skeleton";
import { useNavigate } from "react-router-dom";

interface DashboardCardsProps {
  userRole: "superadmin" | "admin";
}

const DashboardCards = ({ userRole }: DashboardCardsProps) => {
  const navigate = useNavigate();
  const {
    data: storeMetrics,
    isLoading: storeLoading,
    error: storeError,
  } = useDashboardMetrics();
  const {
    data: adminMetrics,
    isLoading: adminLoading,
    error: adminError,
  } = useSuperadminMetrics();

  const isLoading = userRole === "superadmin" ? adminLoading : storeLoading;
  const error = userRole === "superadmin" ? adminError : storeError;

  // Dados para mini-gráficos (simulados - em produção viriam de métricas reais)
  const generateChartData = (baseValue: number, trend: boolean) => {
    const points = 7;
    const data = [];
    for (let i = 0; i < points; i++) {
      const variation = trend ? i * 2 : -i * 1.5;
      data.push({
        value: Math.max(baseValue + variation + Math.random() * 10, 0),
      });
    }
    return data;
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {[1, 2, 3, 4].map((index) => (
          <div
            key={index}
            className="rounded-2xl p-6 space-y-4 bg-gray-100 animate-pulse"
          >
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-8 w-24" />
            <Skeleton className="h-4 w-16" />
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    console.error("Erro ao carregar métricas:", error);
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const adminStats = [
    {
      title: "Vendas do Mês",
      value: storeMetrics
        ? formatCurrency(storeMetrics.salesThisMonth)
        : "R$ 0,00",
      subtitle: "vendas confirmadas",
      icon: DollarSign,
      trend: storeMetrics
        ? {
            value: Math.round(storeMetrics.salesGrowth),
            isPositive: storeMetrics.salesGrowth >= 0,
          }
        : undefined,
      variant: "success" as const,
      onClick: () => navigate("/reports"),
      chartData: storeMetrics
        ? generateChartData(50, storeMetrics.salesGrowth >= 0)
        : [],
    },
    {
      title: "Pedidos Hoje",
      value: storeMetrics?.ordersToday || 0,
      subtitle: "novos pedidos",
      icon: ShoppingCart,
      trend: storeMetrics
        ? {
            value: Math.round(storeMetrics.ordersGrowth),
            isPositive: storeMetrics.ordersGrowth >= 0,
          }
        : undefined,
      variant: "primary" as const,
      onClick: () => navigate("/orders"),
      chartData: storeMetrics
        ? generateChartData(20, storeMetrics.ordersGrowth >= 0)
        : [],
    },
    {
      title: "Produtos Ativos",
      value: storeMetrics?.activeProducts || 0,
      subtitle: "produtos disponíveis",
      icon: Package,
      trend: storeMetrics
        ? {
            value: Math.round(storeMetrics.productsGrowth),
            isPositive: storeMetrics.productsGrowth >= 0,
          }
        : undefined,
      variant: "secondary" as const,
      onClick: () => navigate("/products"),
      chartData: storeMetrics
        ? generateChartData(30, storeMetrics.productsGrowth >= 0)
        : [],
    },
    {
      title: "Visitantes",
      value: storeMetrics?.visitors || 0,
      subtitle: "acessos hoje",
      icon: Users,
      trend: storeMetrics
        ? {
            value: Math.round(storeMetrics.visitorsGrowth),
            isPositive: storeMetrics.visitorsGrowth >= 0,
          }
        : undefined,
      variant: "warning" as const,
      onClick: () => navigate("/reports"),
      chartData: storeMetrics
        ? generateChartData(40, storeMetrics.visitorsGrowth >= 0)
        : [],
    },
  ];

  const superadminStats = [
    {
      title: "Total de Lojas",
      value: adminMetrics?.totalStores || 0,
      subtitle: "lojas ativas",
      icon: Users,
      trend: adminMetrics
        ? {
            value: adminMetrics.storesGrowth,
            isPositive: adminMetrics.storesGrowth >= 0,
          }
        : undefined,
      variant: "primary" as const,
      onClick: () => navigate("/stores"),
      chartData: adminMetrics
        ? generateChartData(10, adminMetrics.storesGrowth >= 0)
        : [],
    },
    {
      title: "Receita Total",
      value: adminMetrics
        ? formatCurrency(adminMetrics.totalRevenue)
        : "R$ 0,00",
      subtitle: "receita mensal",
      icon: DollarSign,
      trend: adminMetrics
        ? {
            value: adminMetrics.revenueGrowth,
            isPositive: adminMetrics.revenueGrowth >= 0,
          }
        : undefined,
      variant: "success" as const,
      onClick: () => navigate("/reports"),
      chartData: adminMetrics
        ? generateChartData(100, adminMetrics.revenueGrowth >= 0)
        : [],
    },
    {
      title: "Pedidos Hoje",
      value: adminMetrics?.ordersToday || 0,
      subtitle: "pedidos no sistema",
      icon: ShoppingCart,
      trend: adminMetrics
        ? {
            value: adminMetrics.ordersGrowth,
            isPositive: adminMetrics.ordersGrowth >= 0,
          }
        : undefined,
      variant: "warning" as const,
      onClick: () => navigate("/orders"),
      chartData: adminMetrics
        ? generateChartData(50, adminMetrics.ordersGrowth >= 0)
        : [],
    },
    {
      title: "Produtos Cadastrados",
      value: adminMetrics?.totalProducts || 0,
      subtitle: "produtos no sistema",
      icon: Package,
      trend: adminMetrics
        ? {
            value: adminMetrics.productsGrowth,
            isPositive: adminMetrics.productsGrowth >= 0,
          }
        : undefined,
      variant: "secondary" as const,
      onClick: () => navigate("/products"),
      chartData: adminMetrics
        ? generateChartData(80, adminMetrics.productsGrowth >= 0)
        : [],
    },
  ];

  const stats = userRole === "superadmin" ? superadminStats : adminStats;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
      {stats.map((stat, index) => (
        <ResponsiveDashboardCard
          key={index}
          title={stat.title}
          value={stat.value}
          subtitle={stat.subtitle}
          icon={stat.icon}
          trend={stat.trend}
          variant={stat.variant}
          onClick={stat.onClick}
          showChart={true}
          chartData={stat.chartData}
        />
      ))}
    </div>
  );
};

export default DashboardCards;
