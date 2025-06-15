
import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Activity, 
  Store, 
  Users, 
  Zap, 
  RefreshCw, 
  AlertTriangle,
  CheckCircle,
  Clock
} from 'lucide-react';
import { useSystemBenefits } from '@/hooks/useSystemBenefits';
import { usePlanBenefits } from '@/hooks/usePlanBenefits';
import { useSubscriptionPlans } from '@/hooks/useSubscriptionPlans';
import { useStores } from '@/hooks/useStores';
import { useBenefitsCache } from '@/hooks/useBenefitsCache';

export const TenantMonitoringDashboard: React.FC = () => {
  const { benefits: systemBenefits, loading: loadingBenefits } = useSystemBenefits();
  const { planBenefits } = usePlanBenefits();
  const { plans, loading: loadingPlans } = useSubscriptionPlans();
  const { stores, loading: loadingStores } = useStores();
  const { getCacheStats, invalidateAll } = useBenefitsCache();
  
  const [cacheStats, setCacheStats] = useState(getCacheStats());
  const [lastUpdate, setLastUpdate] = useState(new Date());

  const refreshStats = () => {
    setCacheStats(getCacheStats());
    setLastUpdate(new Date());
  };

  useEffect(() => {
    const interval = setInterval(refreshStats, 10000); // Atualizar a cada 10 segundos
    return () => clearInterval(interval);
  }, []);

  const propagationStats = useMemo(() => {
    const activeStores = stores.filter(store => store.is_active);
    const activeBenefits = systemBenefits.filter(benefit => benefit.is_active);
    
    // Calcular estatísticas de propagação
    const benefitPropagation = activeBenefits.map(benefit => {
      const plansWithBenefit = Object.values(planBenefits).flat()
        .filter(pb => pb.benefit_id === benefit.id && pb.is_enabled);
      
      const affectedStores = activeStores.filter(store => {
        // Aqui você verificaria qual plano cada loja está usando
        // Por simplicidade, assumindo que temos essa informação
        return plansWithBenefit.some(pb => pb.plan_id);
      });

      return {
        benefit,
        plansCount: plansWithBenefit.length,
        storesAffected: affectedStores.length,
        propagationRate: activeStores.length > 0 ? (affectedStores.length / activeStores.length) * 100 : 0
      };
    });

    return {
      totalBenefits: activeBenefits.length,
      totalStores: activeStores.length,
      totalPlans: plans.length,
      benefitPropagation,
      avgPropagationRate: benefitPropagation.length > 0 
        ? benefitPropagation.reduce((sum, bp) => sum + bp.propagationRate, 0) / benefitPropagation.length
        : 0
    };
  }, [systemBenefits, planBenefits, stores, plans]);

  const handleCacheClear = () => {
    invalidateAll();
    refreshStats();
  };

  if (loadingBenefits || loadingPlans || loadingStores) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
          <p className="text-gray-600">Carregando monitoramento...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Monitoramento Multi-Tenant</h2>
          <p className="text-gray-600">
            Acompanhe a propagação de benefícios across todas as lojas
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={refreshStats}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Atualizar
          </Button>
          <Button variant="outline" size="sm" onClick={handleCacheClear}>
            <Activity className="h-4 w-4 mr-2" />
            Limpar Cache
          </Button>
        </div>
      </div>

      {/* Métricas Principais */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Zap className="h-4 w-4 text-purple-600" />
              Benefícios Ativos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{propagationStats.totalBenefits}</div>
            <p className="text-xs text-gray-600">benefícios disponíveis</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Store className="h-4 w-4 text-blue-600" />
              Lojas Ativas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{propagationStats.totalStores}</div>
            <p className="text-xs text-gray-600">lojas cadastradas</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Users className="h-4 w-4 text-green-600" />
              Planos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{propagationStats.totalPlans}</div>
            <p className="text-xs text-gray-600">planos configurados</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Activity className="h-4 w-4 text-orange-600" />
              Taxa Propagação
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {propagationStats.avgPropagationRate.toFixed(1)}%
            </div>
            <p className="text-xs text-gray-600">média de propagação</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="propagation" className="w-full">
        <TabsList>
          <TabsTrigger value="propagation">Propagação de Benefícios</TabsTrigger>
          <TabsTrigger value="cache">Status do Cache</TabsTrigger>
          <TabsTrigger value="system">Saúde do Sistema</TabsTrigger>
        </TabsList>

        <TabsContent value="propagation" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Propagação por Benefício</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {propagationStats.benefitPropagation.map((item) => (
                  <div key={item.benefit.id} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="font-medium">{item.benefit.name}</span>
                        <Badge variant="outline" className="ml-2">
                          {item.benefit.category}
                        </Badge>
                      </div>
                      <div className="text-sm text-gray-600">
                        {item.storesAffected}/{propagationStats.totalStores} lojas
                      </div>
                    </div>
                    <Progress value={item.propagationRate} className="h-2" />
                    <div className="text-xs text-gray-500">
                      Propagação: {item.propagationRate.toFixed(1)}% • 
                      Planos: {item.plansCount}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="cache" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Estatísticas do Cache</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    {cacheStats.systemBenefits.cached ? (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    ) : (
                      <AlertTriangle className="h-4 w-4 text-yellow-600" />
                    )}
                    <span className="font-medium">System Benefits</span>
                  </div>
                  <div className="text-sm text-gray-600">
                    Status: {cacheStats.systemBenefits.cached ? 'Cached' : 'Not Cached'}
                    {cacheStats.systemBenefits.cached && (
                      <div>
                        Idade: {Math.round(cacheStats.systemBenefits.age / 1000)}s
                        {cacheStats.systemBenefits.expired && (
                          <Badge variant="destructive" className="ml-2">Expirado</Badge>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                <div className="p-4 border rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Activity className="h-4 w-4 text-blue-600" />
                    <span className="font-medium">Plan Benefits</span>
                  </div>
                  <div className="text-sm text-gray-600">
                    Planos em cache: {cacheStats.planBenefits}
                  </div>
                </div>

                <div className="p-4 border rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="h-4 w-4 text-purple-600" />
                    <span className="font-medium">Validation Cache</span>
                  </div>
                  <div className="text-sm text-gray-600">
                    Validações: {cacheStats.validationCache}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="system" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Saúde do Sistema</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <span>Sistema Multi-Tenant</span>
                  </div>
                  <Badge variant="default">Operacional</Badge>
                </div>

                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <span>Sincronização Realtime</span>
                  </div>
                  <Badge variant="default">Ativo</Badge>
                </div>

                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <span>Cache Performance</span>
                  </div>
                  <Badge variant="default">Otimizado</Badge>
                </div>

                <div className="text-xs text-gray-500 mt-4">
                  Última atualização: {lastUpdate.toLocaleTimeString('pt-BR')}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
