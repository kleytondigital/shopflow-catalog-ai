
import React, { useState } from 'react';
import { CreditCard, CheckCircle, Clock, AlertCircle, Crown, Zap, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AppLayout from '@/components/layout/AppLayout';
import { useAuth } from '@/hooks/useAuth';
import { useStoreSubscription } from '@/hooks/useStoreSubscription';
import { useSubscriptionPlans } from '@/hooks/useSubscriptionPlans';
import { useToast } from '@/hooks/use-toast';

const Billing = () => {
  const { profile, isSuperadmin } = useAuth();
  const { subscription, loading: subscriptionLoading } = useStoreSubscription();
  const { plans, loading: plansLoading } = useSubscriptionPlans();
  const { toast } = useToast();
  const [upgrading, setUpgrading] = useState(false);

  const breadcrumbs = [
    { href: '/', label: 'Dashboard' },
    { label: 'Faturamento', current: true },
  ];

  // Verificar se tem acesso - Superadmin sempre tem acesso, store_admin precisa ter loja
  const hasAccess = isSuperadmin || (profile?.role === 'store_admin' && profile?.store_id);

  const handleUpgrade = async (planId: string) => {
    setUpgrading(true);
    try {
      // Implementar lógica de upgrade
      toast({
        title: "Upgrade solicitado",
        description: "Redirecionando para pagamento...",
      });
    } catch (error) {
      toast({
        title: "Erro ao processar upgrade",
        description: "Tente novamente mais tarde.",
        variant: "destructive",
      });
    } finally {
      setUpgrading(false);
    }
  };

  const getPlanIcon = (planType: string) => {
    switch (planType) {
      case 'enterprise':
        return <Crown className="h-5 w-5 text-purple-600" />;
      case 'premium':
        return <Zap className="h-5 w-5 text-blue-600" />;
      default:
        return <Star className="h-5 w-5 text-gray-600" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800"><CheckCircle className="h-3 w-3 mr-1" />Ativo</Badge>;
      case 'trialing':
        return <Badge className="bg-blue-100 text-blue-800"><Clock className="h-3 w-3 mr-1" />Teste Grátis</Badge>;
      case 'cancelled':
        return <Badge variant="destructive"><AlertCircle className="h-3 w-3 mr-1" />Cancelado</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  if (!hasAccess) {
    return (
      <AppLayout title="Faturamento" breadcrumbs={breadcrumbs}>
        <div className="flex items-center justify-center min-h-[400px]">
          <Alert className="max-w-md">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Você não tem permissão para acessar esta página. 
              {!profile?.store_id && ' Certifique-se de ter uma loja associada ao seu perfil.'}
            </AlertDescription>
          </Alert>
        </div>
      </AppLayout>
    );
  }

  if (subscriptionLoading || plansLoading) {
    return (
      <AppLayout title="Faturamento" breadcrumbs={breadcrumbs}>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-pulse">Carregando informações de faturamento...</div>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout 
      title="Faturamento e Planos" 
      subtitle="Gerencie sua assinatura e pagamentos"
      breadcrumbs={breadcrumbs}
    >
      <div className="space-y-6">
        {/* Status da Assinatura Atual */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Assinatura Atual
            </CardTitle>
          </CardHeader>
          <CardContent>
            {subscription ? (
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div className="flex items-center gap-3">
                    {getPlanIcon(subscription.plan?.type)}
                    <div>
                      <h3 className="font-semibold text-lg">{subscription.plan?.name}</h3>
                      <p className="text-sm text-gray-600">{subscription.plan?.description}</p>
                    </div>
                  </div>
                  {getStatusBadge(subscription.status)}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t">
                  <div>
                    <p className="text-sm text-gray-500">Preço Mensal</p>
                    <p className="font-semibold">R$ {subscription.plan?.price_monthly?.toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Próximo Pagamento</p>
                    <p className="font-semibold">
                      {subscription.ends_at ? new Date(subscription.ends_at).toLocaleDateString('pt-BR') : 'N/A'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Status</p>
                    <p className="font-semibold capitalize">{subscription.status}</p>
                  </div>
                </div>
              </div>
            ) : (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Nenhuma assinatura ativa encontrada. Selecione um plano abaixo.
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        {/* Planos Disponíveis */}
        <Card>
          <CardHeader>
            <CardTitle>Planos Disponíveis</CardTitle>
            <CardDescription>
              Escolha o plano que melhor atende às suas necessidades
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {plans.map((plan) => (
                <Card key={plan.id} className={`relative ${subscription?.plan?.id === plan.id ? 'ring-2 ring-blue-500' : ''}`}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {getPlanIcon(plan.type)}
                        <CardTitle className="text-lg">{plan.name}</CardTitle>
                      </div>
                      {subscription?.plan?.id === plan.id && (
                        <Badge>Plano Atual</Badge>
                      )}
                    </div>
                    <CardDescription>{plan.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <div className="text-3xl font-bold">
                          R$ {plan.price_monthly.toFixed(2)}
                        </div>
                        <div className="text-sm text-gray-500">por mês</div>
                      </div>

                      {subscription?.plan?.id !== plan.id && (
                        <Button 
                          className="w-full" 
                          onClick={() => handleUpgrade(plan.id)}
                          disabled={upgrading}
                        >
                          {upgrading ? 'Processando...' : 'Selecionar Plano'}
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Histórico de Pagamentos */}
        <Card>
          <CardHeader>
            <CardTitle>Histórico de Pagamentos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-gray-500">
              <p>Nenhum pagamento encontrado</p>
              <p className="text-sm">Os pagamentos aparecerão aqui quando realizados</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};

export default Billing;
