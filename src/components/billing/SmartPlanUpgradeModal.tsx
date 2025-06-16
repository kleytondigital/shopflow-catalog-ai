
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Crown, Star, Zap, CreditCard } from 'lucide-react';
import { useSubscriptionPlans, SubscriptionPlan } from '@/hooks/useSubscriptionPlans';
import { usePaymentGateways } from '@/hooks/usePaymentGateways';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

interface SmartPlanUpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedPlan?: SubscriptionPlan | null;
  currentPlan?: SubscriptionPlan | null;
}

const SmartPlanUpgradeModal: React.FC<SmartPlanUpgradeModalProps> = ({
  isOpen,
  onClose,
  selectedPlan,
  currentPlan
}) => {
  const { plans, loading: plansLoading } = useSubscriptionPlans();
  const { activeGateway, loading: gatewayLoading } = usePaymentGateways();
  const { profile } = useAuth();
  const [processing, setProcessing] = useState(false);

  const getPlanIcon = (planType: string) => {
    switch (planType) {
      case 'basic': return <Star className="h-5 w-5" />;
      case 'premium': return <Zap className="h-5 w-5" />;
      case 'enterprise': return <Crown className="h-5 w-5" />;
      default: return <Star className="h-5 w-5" />;
    }
  };

  const getPlanColor = (planType: string) => {
    switch (planType) {
      case 'basic': return 'border-blue-200 bg-blue-50';
      case 'premium': return 'border-orange-200 bg-orange-50';
      case 'enterprise': return 'border-purple-200 bg-purple-50';
      default: return 'border-gray-200 bg-gray-50';
    }
  };

  const handleUpgrade = async (plan: SubscriptionPlan) => {
    if (!activeGateway) {
      toast.error('Nenhum gateway de pagamento configurado. Entre em contato com o suporte.');
      return;
    }

    if (!profile?.store_id) {
      toast.error('Loja não identificada. Faça login novamente.');
      return;
    }

    setProcessing(true);
    
    try {
      toast.info('Redirecionando para pagamento...');
      
      // Simular criação de checkout - implementar conforme gateway ativo
      setTimeout(() => {
        toast.success('Upgrade processado com sucesso! Aguarde a confirmação do pagamento.');
        onClose();
        setProcessing(false);
      }, 2000);
      
    } catch (error) {
      console.error('Erro no upgrade:', error);
      toast.error('Erro ao processar upgrade. Tente novamente.');
      setProcessing(false);
    }
  };

  if (plansLoading || gatewayLoading) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Carregando Planos...</DialogTitle>
          </DialogHeader>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (!activeGateway) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Gateway Não Configurado</DialogTitle>
          </DialogHeader>
          <div className="text-center py-6">
            <CreditCard className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 mb-4">
              O sistema de pagamento não está configurado. Entre em contato com o suporte para realizar o upgrade.
            </p>
            <Button onClick={onClose}>Entendi</Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  const availablePlans = plans.filter(plan => 
    plan.is_active && plan.id !== currentPlan?.id
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl text-center">
            Escolha seu Plano
          </DialogTitle>
          {currentPlan && (
            <p className="text-center text-gray-600">
              Plano atual: <span className="font-semibold">{currentPlan.name}</span>
            </p>
          )}
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
          {availablePlans.map((plan) => (
            <Card 
              key={plan.id} 
              className={`relative ${getPlanColor(plan.type)} ${
                selectedPlan?.id === plan.id ? 'ring-2 ring-primary' : ''
              }`}
            >
              {plan.type === 'premium' && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-orange-500 text-white">Mais Popular</Badge>
                </div>
              )}
              
              <CardHeader className="text-center">
                <div className="flex justify-center mb-2">
                  {getPlanIcon(plan.type)}
                </div>
                <CardTitle className="text-xl">{plan.name}</CardTitle>
                <div className="text-3xl font-bold">
                  R$ {plan.price_monthly.toFixed(2)}
                  <span className="text-sm font-normal text-gray-600">/mês</span>
                </div>
                {plan.price_yearly && (
                  <p className="text-sm text-gray-600">
                    ou R$ {plan.price_yearly.toFixed(2)}/ano
                  </p>
                )}
              </CardHeader>

              <CardContent>
                <p className="text-gray-600 mb-4 text-center min-h-[3rem]">
                  {plan.description}
                </p>

                <div className="space-y-3 mb-6">
                  {getPlanFeatures(plan.type).map((feature, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="text-sm">{feature}</span>
                    </div>
                  ))}
                </div>

                <Button 
                  onClick={() => handleUpgrade(plan)}
                  disabled={processing}
                  className="w-full"
                  variant={plan.type === 'premium' ? 'default' : 'outline'}
                >
                  {processing ? 'Processando...' : 'Escolher Plano'}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center mt-6 text-sm text-gray-500">
          <p>Gateway ativo: {activeGateway.name.toUpperCase()}</p>
          <p>Cancelamento a qualquer momento • Suporte 24/7</p>
        </div>
      </DialogContent>
    </Dialog>
  );
};

const getPlanFeatures = (planType: string): string[] => {
  const features = {
    basic: [
      'Até 3 imagens por produto',
      'Catálogo básico',
      'Suporte por email',
      '1 membro da equipe'
    ],
    premium: [
      'Até 10 imagens por produto',
      'Integração WhatsApp',
      'Agente de IA',
      'Pagamento PIX e Cartão',
      'Até 5 membros da equipe',
      'Cupons de desconto'
    ],
    enterprise: [
      'Imagens ilimitadas',
      'Todas as integrações',
      'IA avançada',
      'Domínio personalizado',
      'Equipe ilimitada',
      'Suporte dedicado',
      'API personalizada'
    ]
  };

  return features[planType as keyof typeof features] || [];
};

export default SmartPlanUpgradeModal;
