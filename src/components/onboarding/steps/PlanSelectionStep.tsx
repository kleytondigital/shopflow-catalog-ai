
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Crown, Star, Zap, CheckCircle, Gift } from 'lucide-react';
import { StoreWizardData } from '@/hooks/useStoreWizard';
import { useSubscriptionPlans } from '@/hooks/useSubscriptionPlans';

interface PlanSelectionStepProps {
  data: StoreWizardData;
  onUpdate: (updates: Partial<StoreWizardData>) => void;
}

export const PlanSelectionStep: React.FC<PlanSelectionStepProps> = ({ 
  data, 
  onUpdate 
}) => {
  const { plans, loading } = useSubscriptionPlans();

  const getPlanIcon = (planType: string) => {
    switch (planType) {
      case 'basic': return <Star className="h-6 w-6 text-blue-600" />;
      case 'premium': return <Zap className="h-6 w-6 text-orange-600" />;
      case 'enterprise': return <Crown className="h-6 w-6 text-purple-600" />;
      default: return <Star className="h-6 w-6" />;
    }
  };

  const getPlanColor = (planType: string) => {
    switch (planType) {
      case 'basic': return 'border-blue-200 bg-blue-50';
      case 'premium': return 'border-orange-200 bg-orange-50 ring-2 ring-orange-300';
      case 'enterprise': return 'border-purple-200 bg-purple-50';
      default: return 'border-gray-200 bg-gray-50';
    }
  };

  const getPlanFeatures = (planType: string): string[] => {
    const features = {
      basic: [
        'Até 100 produtos',
        'Catálogo básico',
        'Suporte por email',
        '1 membro da equipe'
      ],
      premium: [
        'Até 1.000 produtos',
        'Integração WhatsApp',
        'Agente de IA',
        'Pagamento PIX e Cartão',
        'Até 5 membros da equipe',
        'Cupons de desconto'
      ],
      enterprise: [
        'Produtos ilimitados',
        'Todas as integrações',
        'IA avançada',
        'Domínio personalizado',
        'Equipe ilimitada',
        'Suporte dedicado'
      ]
    };

    return features[planType as keyof typeof features] || [];
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Gift className="h-6 w-6 text-green-600" />
            Escolha Seu Plano
          </CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </CardContent>
      </Card>
    );
  }

  const activePlans = plans.filter(plan => plan.is_active);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Gift className="h-6 w-6 text-green-600" />
          Escolha Seu Plano
        </CardTitle>
        <p className="text-gray-600">
          Todos os planos incluem <strong>7 dias de teste gratuito</strong>
        </p>
      </CardHeader>
      
      <CardContent className="space-y-6">
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
          <div className="flex items-center gap-2 mb-2">
            <Gift className="h-5 w-5 text-green-600" />
            <h4 className="font-semibold text-green-900">🎁 Teste Gratuito de 7 Dias</h4>
          </div>
          <p className="text-sm text-green-800">
            Experimente todos os recursos do plano escolhido sem compromisso. 
            Você pode cancelar a qualquer momento durante o período de teste.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {activePlans.map((plan) => (
            <Card 
              key={plan.id} 
              className={`relative cursor-pointer transition-all hover:shadow-lg ${
                getPlanColor(plan.type)
              } ${
                data.selected_plan_id === plan.id 
                  ? 'ring-2 ring-primary shadow-lg' 
                  : ''
              }`}
              onClick={() => onUpdate({ selected_plan_id: plan.id })}
            >
              {plan.type === 'premium' && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-orange-500 text-white">Mais Popular</Badge>
                </div>
              )}
              
              <CardHeader className="text-center pb-2">
                <div className="flex justify-center mb-2">
                  {getPlanIcon(plan.type)}
                </div>
                <CardTitle className="text-xl">{plan.name}</CardTitle>
                <div className="text-2xl font-bold">
                  R$ {plan.price_monthly.toFixed(2)}
                  <span className="text-sm font-normal text-gray-600">/mês</span>
                </div>
                {plan.price_yearly && (
                  <p className="text-xs text-gray-600">
                    ou R$ {plan.price_yearly.toFixed(2)}/ano
                  </p>
                )}
              </CardHeader>

              <CardContent className="pt-0">
                <p className="text-gray-600 mb-4 text-center text-sm min-h-[2.5rem]">
                  {plan.description}
                </p>

                <div className="space-y-2 mb-4">
                  {getPlanFeatures(plan.type).map((feature, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                      <span className="text-sm">{feature}</span>
                    </div>
                  ))}
                </div>

                {data.selected_plan_id === plan.id && (
                  <div className="flex items-center justify-center">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <span className="ml-2 text-sm font-medium text-green-600">
                      Plano Selecionado
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {!data.selected_plan_id && (
          <div className="bg-red-50 p-4 rounded-lg">
            <p className="text-sm text-red-800">
              ⚠️ Selecione um plano para continuar
            </p>
          </div>
        )}

        <div className="bg-blue-50 p-4 rounded-lg">
          <h4 className="font-medium text-blue-900 mb-2">💡 Por que escolher um plano agora?</h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Configure sua loja com todos os recursos disponíveis</li>
            <li>• 7 dias completamente gratuitos para testar</li>
            <li>• Você pode trocar de plano a qualquer momento</li>
            <li>• Sem taxas de cancelamento</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};
