
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  CreditCard, Calendar, TrendingUp, AlertTriangle, 
  Check, Download, Receipt, Zap, Crown 
} from 'lucide-react';
import AppLayout from '@/components/layout/AppLayout';
import { useSubscription } from '@/hooks/useSubscription';
import { usePlanPermissions } from '@/hooks/usePlanPermissions';
import { PlanUpgradeModal } from '@/components/billing/PlanUpgradeModal';

const Billing = () => {
  const { subscription, featureUsage, isTrialing, getTrialDaysLeft } = useSubscription();
  const { getPlanBadgeInfo } = usePlanPermissions();
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  const planBadge = getPlanBadgeInfo();
  const trialDaysLeft = getTrialDaysLeft();

  const breadcrumbs = [
    { href: '/', label: 'Dashboard' },
    { label: 'Faturamento', current: true }
  ];

  const getNextBillingDate = () => {
    if (!subscription?.ends_at) return null;
    return new Date(subscription.ends_at).toLocaleDateString('pt-BR');
  };

  const getFeatureDisplayName = (featureType: string) => {
    const names: Record<string, string> = {
      'max_images_per_product': 'Imagens por Produto',
      'max_team_members': 'Membros da Equipe',
      'whatsapp_integration': 'Integração WhatsApp',
      'payment_pix': 'Pagamento PIX',
      'payment_credit_card': 'Pagamento Cartão',
      'custom_domain': 'Domínio Personalizado',
      'api_access': 'Acesso à API',
      'ai_agent': 'Agente de IA',
      'discount_coupons': 'Cupons de Desconto',
      'abandoned_cart_recovery': 'Recuperação de Carrinho',
      'multi_variations': 'Múltiplas Variações',
      'shipping_calculator': 'Calculadora de Frete',
      'dedicated_support': 'Suporte Dedicado',
      'team_management': 'Gestão de Equipe'
    };
    return names[featureType] || featureType;
  };

  return (
    <AppLayout 
      title="Faturamento"
      subtitle="Gerencie sua assinatura e faturamento"
      breadcrumbs={breadcrumbs}
    >
      <div className="space-y-6">
        {/* Status do Plano */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Plano Atual</CardTitle>
              <Zap className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 mb-2">
                <Badge variant={planBadge.variant}>
                  {planBadge.label}
                </Badge>
              </div>
              <p className="text-2xl font-bold">
                R$ {subscription?.plan.price_monthly.toFixed(2)}
                <span className="text-sm font-normal text-muted-foreground">/mês</span>
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Status</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {isTrialing() ? (
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle className="h-4 w-4 text-yellow-500" />
                    <span className="text-sm font-medium">Trial Ativo</span>
                  </div>
                  <p className="text-2xl font-bold">{trialDaysLeft}</p>
                  <p className="text-xs text-muted-foreground">dias restantes</p>
                </div>
              ) : (
                <div>
                  <p className="text-sm font-medium text-green-600 mb-2">Ativo</p>
                  <p className="text-sm">
                    Próximo vencimento: {getNextBillingDate() || 'N/A'}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Ações</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {subscription?.plan.type === 'basic' ? (
                <Button 
                  className="w-full"
                  onClick={() => setShowUpgradeModal(true)}
                >
                  <Crown className="h-4 w-4 mr-2" />
                  Fazer Upgrade
                </Button>
              ) : (
                <Button variant="outline" className="w-full">
                  <CreditCard className="h-4 w-4 mr-2" />
                  Gerenciar Plano
                </Button>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Tabs de Conteúdo */}
        <Tabs defaultValue="usage" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="usage">Uso Atual</TabsTrigger>
            <TabsTrigger value="billing">Histórico</TabsTrigger>
            <TabsTrigger value="features">Recursos</TabsTrigger>
          </TabsList>

          {/* Aba de Uso Atual */}
          <TabsContent value="usage" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Uso dos Recursos</CardTitle>
              </CardHeader>
              <CardContent>
                {featureUsage.length > 0 ? (
                  <div className="space-y-6">
                    {featureUsage.map(usage => (
                      <div key={usage.feature_type} className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="font-medium">
                            {getFeatureDisplayName(usage.feature_type)}
                          </span>
                          <span className="text-sm text-muted-foreground">
                            {usage.current_usage}/{usage.limit}
                          </span>
                        </div>
                        <Progress 
                          value={usage.percentage} 
                          className="h-2"
                        />
                        {usage.percentage >= 80 && (
                          <p className="text-xs text-yellow-600">
                            Você está próximo do limite. Considere fazer upgrade.
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-center py-8">
                    Nenhum uso registrado ainda.
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Aba de Histórico */}
          <TabsContent value="billing">
            <Card>
              <CardHeader>
                <CardTitle>Histórico de Faturas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-muted-foreground">
                  <Receipt className="h-12 w-12 mx-auto mb-4" />
                  <p>Nenhuma fatura encontrada.</p>
                  <p className="text-sm">
                    {isTrialing() 
                      ? 'Você está no período de trial gratuito.'
                      : 'As faturas aparecerão aqui após o primeiro pagamento.'
                    }
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Aba de Recursos */}
          <TabsContent value="features">
            <Card>
              <CardHeader>
                <CardTitle>Recursos do seu Plano</CardTitle>
              </CardHeader>
              <CardContent>
                {subscription?.features && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {subscription.features
                      .filter(f => f.is_enabled)
                      .map(feature => (
                        <div key={feature.id} className="flex items-center gap-2 p-3 border rounded-lg">
                          <Check className="h-4 w-4 text-green-500" />
                          <span className="text-sm">
                            {getFeatureDisplayName(feature.feature_type)}
                          </span>
                          {feature.feature_value !== 'true' && (
                            <Badge variant="outline" className="ml-auto">
                              {feature.feature_value}
                            </Badge>
                          )}
                        </div>
                      ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <PlanUpgradeModal 
        open={showUpgradeModal}
        onOpenChange={setShowUpgradeModal}
      />
    </AppLayout>
  );
};

export default Billing;
