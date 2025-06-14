
import { useSubscription } from './useSubscription';
import { toast } from 'sonner';

export const usePlanPermissions = () => {
  const { subscription, hasFeature, canUseFeature, getFeatureLimit, isTrialing } = useSubscription();

  const checkFeatureAccess = (featureType: string, showUpgradeMessage = true): boolean => {
    const hasAccess = hasFeature(featureType);
    
    if (!hasAccess && showUpgradeMessage) {
      const planName = subscription?.plan.type === 'basic' ? 'Premium' : 'superior';
      toast.error(`Esta funcionalidade está disponível apenas no plano ${planName}. Faça upgrade para ter acesso!`);
    }
    
    return hasAccess;
  };

  const checkFeatureUsage = (featureType: string, currentUsage?: number, showLimitMessage = true): boolean => {
    const canUse = canUseFeature(featureType, currentUsage);
    
    if (!canUse && showLimitMessage) {
      const limit = getFeatureLimit(featureType);
      if (limit > 0) {
        toast.error(`Você atingiu o limite de ${limit} para esta funcionalidade. Faça upgrade para aumentar o limite!`);
      }
    }
    
    return canUse;
  };

  const getFeatureDisplayInfo = (featureType: string) => {
    const featureNames: Record<string, string> = {
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

    return featureNames[featureType] || featureType;
  };

  const getPlanBadgeInfo = () => {
    if (!subscription) return { label: 'Carregando...', variant: 'secondary' as const };

    const planLabels = {
      basic: 'Básico',
      premium: 'Premium',
      enterprise: 'Enterprise'
    };

    const statusLabels = {
      active: 'Ativo',
      trialing: 'Trial',
      inactive: 'Inativo',
      canceled: 'Cancelado',
      past_due: 'Vencido'
    };

    const variants = {
      active: 'default' as const,
      trialing: 'secondary' as const,
      inactive: 'outline' as const,
      canceled: 'destructive' as const,
      past_due: 'destructive' as const
    };

    const planName = planLabels[subscription.plan.type] || subscription.plan.type;
    const statusName = statusLabels[subscription.status] || subscription.status;

    return {
      label: `${planName} (${statusName})`,
      variant: variants[subscription.status] || 'secondary'
    };
  };

  return {
    subscription,
    checkFeatureAccess,
    checkFeatureUsage,
    getFeatureDisplayInfo,
    getPlanBadgeInfo,
    hasFeature,
    canUseFeature,
    isTrialing
  };
};
