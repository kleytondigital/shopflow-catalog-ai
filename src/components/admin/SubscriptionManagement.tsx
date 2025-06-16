
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useStores } from '@/hooks/useStores';
import { useSubscriptionPlans } from '@/hooks/useSubscriptionPlans';
import { supabase } from '@/integrations/supabase/client';
import { Search, Calendar, CreditCard, TrendingUp, Building2 } from 'lucide-react';
import { toast } from 'sonner';

interface StoreSubscriptionInfo {
  store_id: string;
  store_name: string;
  current_plan: string;
  status: string;
  expires_at?: string;
  monthly_revenue: number;
}

const SubscriptionManagement = () => {
  const { stores } = useStores();
  const { plans } = useSubscriptionPlans();
  const [subscriptions, setSubscriptions] = useState<StoreSubscriptionInfo[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const fetchSubscriptions = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('store_subscriptions')
        .select(`
          store_id,
          status,
          ends_at,
          plan:subscription_plans(name, price_monthly),
          store:stores(name)
        `);

      if (error) throw error;

      const subscriptionInfo: StoreSubscriptionInfo[] = data?.map(sub => ({
        store_id: sub.store_id,
        store_name: sub.store?.name || 'Loja sem nome',
        current_plan: sub.plan?.name || 'Sem plano',
        status: sub.status,
        expires_at: sub.ends_at,
        monthly_revenue: sub.plan?.price_monthly || 0
      })) || [];

      setSubscriptions(subscriptionInfo);
    } catch (error) {
      console.error('Erro ao buscar assinaturas:', error);
      toast.error('Erro ao carregar assinaturas');
    } finally {
      setLoading(false);
    }
  };

  const handlePlanChange = async (storeId: string, newPlanId: string) => {
    try {
      const { error } = await supabase
        .from('store_subscriptions')
        .update({ plan_id: newPlanId })
        .eq('store_id', storeId);

      if (error) throw error;

      toast.success('Plano alterado com sucesso');
      fetchSubscriptions();
    } catch (error) {
      console.error('Erro ao alterar plano:', error);
      toast.error('Erro ao alterar plano');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-700';
      case 'trialing': return 'bg-blue-100 text-blue-700';
      case 'past_due': return 'bg-red-100 text-red-700';
      case 'canceled': return 'bg-gray-100 text-gray-700';
      default: return 'bg-yellow-100 text-yellow-700';
    }
  };

  const getStatusLabel = (status: string) => {
    const labels = {
      'active': 'Ativo',
      'trialing': 'Trial',
      'past_due': 'Vencido',
      'canceled': 'Cancelado',
      'inactive': 'Inativo'
    };
    return labels[status as keyof typeof labels] || status;
  };

  const filteredSubscriptions = subscriptions.filter(sub => {
    const matchesSearch = sub.store_name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || sub.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalRevenue = subscriptions
    .filter(sub => sub.status === 'active')
    .reduce((sum, sub) => sum + sub.monthly_revenue, 0);

  React.useEffect(() => {
    fetchSubscriptions();
  }, []);

  return (
    <div className="space-y-6">
      {/* Header com Métricas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm text-gray-600">Total de Lojas</p>
                <p className="text-2xl font-bold">{stores.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm text-gray-600">Assinaturas Ativas</p>
                <p className="text-2xl font-bold">
                  {subscriptions.filter(s => s.status === 'active').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-orange-600" />
              <div>
                <p className="text-sm text-gray-600">Receita Mensal</p>
                <p className="text-2xl font-bold">R$ {totalRevenue.toFixed(2)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-purple-600" />
              <div>
                <p className="text-sm text-gray-600">Em Trial</p>
                <p className="text-2xl font-bold">
                  {subscriptions.filter(s => s.status === 'trialing').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle>Gestão de Assinaturas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Buscar loja..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="active">Ativo</SelectItem>
                <SelectItem value="trialing">Trial</SelectItem>
                <SelectItem value="past_due">Vencido</SelectItem>
                <SelectItem value="canceled">Cancelado</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={fetchSubscriptions} variant="outline">
              Atualizar
            </Button>
          </div>

          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="mt-2 text-gray-600">Carregando assinaturas...</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredSubscriptions.map((subscription) => (
                <div key={subscription.store_id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <h3 className="font-semibold">{subscription.store_name}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge className={getStatusColor(subscription.status)}>
                        {getStatusLabel(subscription.status)}
                      </Badge>
                      <span className="text-sm text-gray-600">
                        Plano: {subscription.current_plan}
                      </span>
                      {subscription.expires_at && (
                        <span className="text-sm text-gray-600">
                          Expira: {new Date(subscription.expires_at).toLocaleDateString('pt-BR')}
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="font-semibold">R$ {subscription.monthly_revenue.toFixed(2)}/mês</p>
                    </div>
                    
                    <Select onValueChange={(value) => handlePlanChange(subscription.store_id, value)}>
                      <SelectTrigger className="w-40">
                        <SelectValue placeholder="Alterar plano" />
                      </SelectTrigger>
                      <SelectContent>
                        {plans.map((plan) => (
                          <SelectItem key={plan.id} value={plan.id}>
                            {plan.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              ))}

              {filteredSubscriptions.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  Nenhuma assinatura encontrada com os filtros aplicados.
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default SubscriptionManagement;
