
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/hooks/useAuth';
import { useStores } from '@/hooks/useStores';
import AppLayout from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  Calendar,
  CreditCard,
  Building2,
  BarChart3,
  Download
} from 'lucide-react';
import DashboardCard from '@/components/dashboard/DashboardCard';

const Billing = () => {
  const { profile } = useAuth();
  const { stores } = useStores();
  const [activeTab, setActiveTab] = useState("overview");

  if (profile?.role !== 'superadmin') {
    return (
      <AppLayout title="Acesso Negado">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Acesso Negado</h2>
            <p className="text-gray-600">Você não tem permissão para acessar esta página.</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  const breadcrumbs = [
    { href: '/', label: 'Dashboard' },
    { label: 'Financeiro', current: true }
  ];

  // Cálculos financeiros
  const totalMonthlyRevenue = stores.reduce((sum, store) => sum + (store.monthly_fee || 0), 0);
  const activeStores = stores.filter(store => store.is_active);
  const monthlyGrowth = 15.2; // Simulado
  const churnRate = 2.1; // Simulado

  return (
    <AppLayout 
      title="Dashboard Financeiro"
      subtitle="Visão completa das finanças e assinaturas do sistema"
      breadcrumbs={breadcrumbs}
    >
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="subscriptions">Assinaturas</TabsTrigger>
          <TabsTrigger value="revenue">Receita</TabsTrigger>
          <TabsTrigger value="reports">Relatórios</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="mt-6 space-y-6">
          {/* Métricas principais */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <DashboardCard
              title="Receita Mensal Total"
              value={`R$ ${totalMonthlyRevenue.toFixed(2)}`}
              subtitle="Receita recorrente mensal"
              icon={DollarSign}
              variant="success"
              trend={{ value: monthlyGrowth, isPositive: true }}
            />

            <DashboardCard
              title="Lojas Ativas"
              value={activeStores.length}
              subtitle={`de ${stores.length} lojas totais`}
              icon={Building2}
              variant="primary"
              trend={{ value: 8.3, isPositive: true }}
            />

            <DashboardCard
              title="Taxa de Crescimento"
              value={`${monthlyGrowth}%`}
              subtitle="Crescimento mensal"
              icon={TrendingUp}
              variant="warning"
              trend={{ value: monthlyGrowth, isPositive: true }}
            />

            <DashboardCard
              title="Taxa de Churn"
              value={`${churnRate}%`}
              subtitle="Cancelamentos mensais"
              icon={TrendingDown}
              variant="secondary"
              trend={{ value: churnRate, isPositive: false }}
            />
          </div>

          {/* Gráficos e métricas detalhadas */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Receita por Plano
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {['basic', 'pro', 'enterprise'].map((plan) => {
                    const planStores = stores.filter(s => s.plan_type === plan);
                    const planRevenue = planStores.reduce((sum, s) => sum + (s.monthly_fee || 0), 0);
                    const percentage = totalMonthlyRevenue > 0 ? (planRevenue / totalMonthlyRevenue * 100) : 0;
                    
                    return (
                      <div key={plan} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Badge variant="outline" className="capitalize">{plan}</Badge>
                          <span className="text-sm text-gray-600">
                            {planStores.length} lojas
                          </span>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold">R$ {planRevenue.toFixed(2)}</div>
                          <div className="text-sm text-gray-500">{percentage.toFixed(1)}%</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Performance Mensal
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div className="p-3 bg-green-50 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">
                        R$ {(totalMonthlyRevenue * 0.85).toFixed(0)}
                      </div>
                      <div className="text-sm text-green-600">Receita Líquida</div>
                    </div>
                    <div className="p-3 bg-blue-50 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">
                        {Math.round(totalMonthlyRevenue * 12 / 1000)}K
                      </div>
                      <div className="text-sm text-blue-600">ARR Projetado</div>
                    </div>
                  </div>
                  <div className="text-center">
                    <Button variant="outline" className="gap-2">
                      <Download className="h-4 w-4" />
                      Exportar Relatório
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="subscriptions" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Gestão de Assinaturas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {stores.map((store) => (
                  <div key={store.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h3 className="font-semibold">{store.name}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className="capitalize">
                          {store.plan_type}
                        </Badge>
                        <Badge variant={store.is_active ? "default" : "secondary"}>
                          {store.is_active ? "Ativa" : "Inativa"}
                        </Badge>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold">
                        R$ {(store.monthly_fee || 0).toFixed(2)}/mês
                      </div>
                      <div className="text-sm text-gray-500">
                        Desde {new Date(store.created_at).toLocaleDateString('pt-BR')}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="revenue" className="mt-6">
          <div className="text-center py-12">
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Análise de Receita Detalhada
            </h3>
            <p className="text-gray-600">
              Gráficos e análises detalhadas de receita serão implementados em breve.
            </p>
          </div>
        </TabsContent>
        
        <TabsContent value="reports" className="mt-6">
          <div className="text-center py-12">
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Relatórios Financeiros
            </h3>
            <p className="text-gray-600">
              Sistema de relatórios exportáveis será implementado em breve.
            </p>
          </div>
        </TabsContent>
      </Tabs>
    </AppLayout>
  );
};

export default Billing;
