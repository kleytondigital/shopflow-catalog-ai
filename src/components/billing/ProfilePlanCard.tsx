
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  TrendingUp, Calendar, AlertTriangle, Crown, Star, Zap, 
  Clock, CheckCircle, ArrowRight 
} from 'lucide-react';
import { useSubscription } from '@/hooks/useSubscription';
import { useAuth } from '@/hooks/useAuth';
import PlanUpgradeModal from './PlanUpgradeModal';

export const ProfilePlanCard: React.FC = () => {
  const { profile } = useAuth();
  const { 
    subscription, 
    loading, 
    isTrialing, 
    getTrialDaysLeft, 
    getPlanDisplayName, 
    getPlanValue,
    getExpirationDate,
    featureUsage
  } = useSubscription();
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  if (profile?.role === 'superadmin') {
    return (
      <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2">
              <Crown className="h-4 w-4 text-purple-600" />
              Acesso Total
            </CardTitle>
            <Badge className="bg-purple-100 text-purple-800 border-purple-200">
              Superadmin
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-xs text-purple-700">
            Você tem acesso completo a todas as funcionalidades do sistema.
          </p>
        </CardContent>
      </Card>
    );
  }

  if (loading) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Carregando Plano...</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-2">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-3 bg-gray-200 rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!subscription) {
    return (
      <Card className="bg-gradient-to-br from-red-50 to-red-100 border-red-200">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            Sem Plano Ativo
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-xs text-red-700">
            Você precisa ativar um plano para usar todas as funcionalidades.
          </p>
          <Button 
            size="sm" 
            className="w-full"
            onClick={() => setShowUpgradeModal(true)}
          >
            <TrendingUp className="mr-2 h-3 w-3" />
            Ativar Plano
          </Button>
        </CardContent>
        <PlanUpgradeModal 
          open={showUpgradeModal}
          onOpenChange={setShowUpgradeModal}
        />
      </Card>
    );
  }

  const planName = getPlanDisplayName();
  const planValue = getPlanValue();
  const expirationDate = getExpirationDate();
  const trialDays = getTrialDaysLeft();
  const isInTrial = isTrialing();

  const getPlanIcon = () => {
    if (!subscription?.plan) return <Star className="h-4 w-4" />;
    
    switch (subscription.plan.type) {
      case 'basic': return <Star className="h-4 w-4 text-blue-600" />;
      case 'premium': return <Zap className="h-4 w-4 text-orange-600" />;
      case 'enterprise': return <Crown className="h-4 w-4 text-purple-600" />;
      default: return <Star className="h-4 w-4" />;
    }
  };

  const getPlanGradient = () => {
    if (!subscription?.plan) return 'from-gray-50 to-gray-100 border-gray-200';
    
    switch (subscription.plan.type) {
      case 'basic': return 'from-blue-50 to-blue-100 border-blue-200';
      case 'premium': return 'from-orange-50 to-orange-100 border-orange-200';
      case 'enterprise': return 'from-purple-50 to-purple-100 border-purple-200';
      default: return 'from-gray-50 to-gray-100 border-gray-200';
    }
  };

  const getNextPlanInfo = () => {
    if (!subscription?.plan) return null;
    
    const nextPlans = {
      basic: { name: 'Premium', features: ['WhatsApp', 'IA', 'Mais imagens'] },
      premium: { name: 'Enterprise', features: ['Ilimitado', 'Suporte dedicado', 'API'] },
      enterprise: null
    };
    
    return nextPlans[subscription.plan.type as keyof typeof nextPlans];
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('pt-BR').format(date);
  };

  const nextPlan = getNextPlanInfo();
  const showUpgradeButton = subscription.plan?.type !== 'enterprise';

  return (
    <>
      <Card className={`bg-gradient-to-br ${getPlanGradient()}`}>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2">
              {getPlanIcon()}
              Plano Atual
            </CardTitle>
            <Badge variant="outline" className="text-xs">
              {planName}
            </Badge>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-3">
          {/* Trial warning */}
          {isInTrial && (
            <div className="flex items-center gap-2 p-2 bg-yellow-50 rounded-lg border border-yellow-200">
              <Clock className="h-3 w-3 text-yellow-600" />
              <div className="text-xs">
                <p className="font-medium text-yellow-800">
                  Trial: {trialDays} dias restantes
                </p>
              </div>
            </div>
          )}

          {/* Preço atual */}
          <div className="text-center">
            <p className="text-lg font-bold">
              {formatCurrency(planValue)}
              <span className="text-xs font-normal text-gray-600">/mês</span>
            </p>
          </div>

          {/* Data de vencimento/renovação */}
          {expirationDate && (
            <div className="flex items-center gap-2 text-xs text-gray-600">
              <Calendar className="h-3 w-3" />
              <span>
                {isInTrial ? 'Trial expira: ' : 'Renova em: '}
                {formatDate(expirationDate)}
              </span>
            </div>
          )}

          {/* Uso de features importantes */}
          {featureUsage.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-medium text-gray-700">Uso Atual:</p>
              {featureUsage.slice(0, 2).map(feature => (
                <div key={feature.feature_type} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span>
                      {feature.feature_type === 'max_images_per_product' 
                        ? 'Imagens/Produto' 
                        : 'Membros'
                      }
                    </span>
                    <span>{feature.current_usage}/{feature.limit}</span>
                  </div>
                  <Progress 
                    value={feature.percentage} 
                    className="h-1"
                  />
                </div>
              ))}
            </div>
          )}

          {/* Preview do próximo plano */}
          {nextPlan && showUpgradeButton && (
            <div className="bg-white/50 rounded-lg p-2 space-y-2">
              <div className="flex items-center gap-2 text-xs font-medium">
                <TrendingUp className="h-3 w-3" />
                Upgrade para {nextPlan.name}
              </div>
              <div className="space-y-1">
                {nextPlan.features.slice(0, 2).map((feature, index) => (
                  <div key={index} className="flex items-center gap-2 text-xs text-gray-600">
                    <CheckCircle className="h-3 w-3 text-green-500" />
                    <span>{feature}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Botão de upgrade */}
          {showUpgradeButton && (
            <Button 
              size="sm" 
              className="w-full"
              variant={isInTrial || trialDays <= 3 ? "default" : "outline"}
              onClick={() => setShowUpgradeModal(true)}
            >
              {nextPlan ? (
                <>
                  <ArrowRight className="mr-2 h-3 w-3" />
                  Upgrade para {nextPlan.name}
                </>
              ) : (
                <>
                  <TrendingUp className="mr-2 h-3 w-3" />
                  Ver Planos
                </>
              )}
            </Button>
          )}
        </CardContent>
      </Card>

      <PlanUpgradeModal 
        open={showUpgradeModal}
        onOpenChange={setShowUpgradeModal}
      />
    </>
  );
};
