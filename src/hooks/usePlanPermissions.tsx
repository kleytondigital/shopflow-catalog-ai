
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useStoreSubscription } from '@/hooks/useStoreSubscription';
import { usePlanBenefits } from '@/hooks/usePlanBenefits';

interface PermissionCheck {
  hasAccess: boolean;
  loading: boolean;
  message?: string;
}

export const usePlanPermissions = () => {
  const { profile, isSuperadmin } = useAuth();
  const { subscription, loading: subscriptionLoading } = useStoreSubscription();
  const { planBenefits, loading: benefitsLoading } = usePlanBenefits();

  // Extrair benefits do planBenefits
  const benefits = planBenefits[subscription?.plan?.id || ''] || [];

  // Superadmins sempre têm acesso total
  if (isSuperadmin) {
    return {
      // Funções específicas
      hasFeatureAccess: () => ({ hasAccess: true, loading: false, message: undefined }),
      hasBenefitAccess: () => ({ hasAccess: true, loading: false, message: undefined }),
      checkProductLimit: () => ({ hasAccess: true, loading: false, message: undefined }),
      checkImageLimit: () => ({ hasAccess: true, loading: false, message: undefined }),
      checkVariationLimit: () => ({ hasAccess: true, loading: false, message: undefined }),
      checkAIUsage: () => ({ hasAccess: true, loading: false, message: undefined }),
      
      // Propriedades de compatibilidade
      checkFeatureAccess: () => true,
      hasBenefit: () => true,
      subscription,
      isTrialing: () => false,
      isSuperadmin: true,
      getPlanBadgeInfo: () => ({ label: 'Superadmin', variant: 'default' as const }),
      getFeatureDisplayInfo: () => ({ name: 'Acesso Total', isEnabled: true }),
      loading: false
    };
  }

  const loading = subscriptionLoading || benefitsLoading;

  const hasFeatureAccess = (featureKey: string): PermissionCheck => {
    if (loading) return { hasAccess: false, loading: true };
    
    if (!subscription || !subscription.plan) {
      return { 
        hasAccess: false, 
        loading: false, 
        message: "Nenhum plano ativo encontrado" 
      };
    }

    // Verificar se o benefício está habilitado para o plano atual
    const benefit = benefits.find(b => b.benefit?.benefit_key === featureKey);
    
    if (!benefit || !benefit.is_enabled) {
      return { 
        hasAccess: false, 
        loading: false, 
        message: `Recurso '${featureKey}' não disponível no seu plano atual` 
      };
    }

    return { hasAccess: true, loading: false };
  };

  const hasBenefitAccess = (benefitKey: string): PermissionCheck => {
    return hasFeatureAccess(benefitKey);
  };

  const checkProductLimit = (): PermissionCheck => {
    if (loading) return { hasAccess: false, loading: true };
    
    // Planos básicos e premium podem cadastrar produtos
    return { hasAccess: true, loading: false };
  };

  const checkImageLimit = (): PermissionCheck => {
    if (loading) return { hasAccess: false, loading: true };
    
    // Todos os planos permitem upload de imagens
    // Básico: 5 imagens, Premium: 10 imagens
    return { hasAccess: true, loading: false };
  };

  const checkVariationLimit = (): PermissionCheck => {
    if (loading) return { hasAccess: false, loading: true };
    
    // Todos os planos permitem variações de produtos
    return { hasAccess: true, loading: false };
  };

  const checkAIUsage = (): PermissionCheck => {
    if (loading) return { hasAccess: false, loading: true };
    
    if (!subscription || !subscription.plan) {
      return { 
        hasAccess: false, 
        loading: false, 
        message: "Nenhum plano ativo encontrado" 
      };
    }

    // IA disponível para planos premium e enterprise
    const planType = subscription.plan.type;
    if (planType === 'premium' || planType === 'enterprise') {
      return { hasAccess: true, loading: false };
    }
    
    return { 
      hasAccess: false, 
      loading: false, 
      message: "IA para produtos disponível apenas nos planos Premium e Enterprise" 
    };
  };

  // Funções de compatibilidade com a interface antiga
  const checkFeatureAccess = (featureKey: string, showToast = true): boolean => {
    const result = hasFeatureAccess(featureKey);
    return result.hasAccess;
  };

  const hasBenefit = (benefitKey: string): boolean => {
    const result = hasBenefitAccess(benefitKey);
    return result.hasAccess;
  };

  const isTrialing = (): boolean => {
    return subscription?.status === 'trialing';
  };

  const getPlanBadgeInfo = () => {
    if (!subscription?.plan) {
      return { label: 'Sem Plano', variant: 'outline' as const };
    }

    const planLabels = {
      basic: { label: 'Básico', variant: 'outline' as const },
      premium: { label: 'Premium', variant: 'default' as const },
      enterprise: { label: 'Enterprise', variant: 'secondary' as const }
    };

    return planLabels[subscription.plan.type] || { label: 'Básico', variant: 'outline' as const };
  };

  const getFeatureDisplayInfo = (featureKey: string) => {
    const benefit = benefits.find(b => b.benefit?.benefit_key === featureKey);
    return {
      name: benefit?.benefit?.name || featureKey,
      isEnabled: benefit?.is_enabled || false
    };
  };

  return {
    // Funções específicas (nova interface)
    hasFeatureAccess,
    hasBenefitAccess,
    checkProductLimit,
    checkImageLimit,
    checkVariationLimit,
    checkAIUsage,
    
    // Propriedades de compatibilidade (interface antiga)
    checkFeatureAccess,
    hasBenefit,
    subscription,
    isTrialing,
    isSuperadmin: false,
    getPlanBadgeInfo,
    getFeatureDisplayInfo,
    loading
  };
};
