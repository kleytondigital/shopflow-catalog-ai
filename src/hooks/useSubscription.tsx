
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export interface SubscriptionPlan {
  id: string;
  name: string;
  type: 'basic' | 'premium' | 'enterprise';
  description: string;
  price_monthly: number;
  price_yearly: number;
  is_active: boolean;
  trial_days: number;
}

export interface PlanFeature {
  id: string;
  feature_type: string;
  feature_value: string;
  is_enabled: boolean;
}

export interface StoreSubscription {
  id: string;
  store_id: string;
  plan_id: string;
  status: 'active' | 'inactive' | 'canceled' | 'past_due' | 'trialing';
  starts_at: string;
  ends_at?: string;
  trial_ends_at?: string;
  canceled_at?: string;
  plan: SubscriptionPlan;
  features: PlanFeature[];
}

export interface FeatureUsage {
  feature_type: string;
  current_usage: number;
  limit: string;
  percentage: number;
}

export const useSubscription = () => {
  const [subscription, setSubscription] = useState<StoreSubscription | null>(null);
  const [featureUsage, setFeatureUsage] = useState<FeatureUsage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { profile } = useAuth();

  const fetchSubscription = async () => {
    if (!profile?.store_id) {
      setLoading(false);
      return;
    }

    try {
      // Buscar assinatura da loja com plano e features
      const { data: subscriptionData, error: subError } = await supabase
        .from('store_subscriptions')
        .select(`
          *,
          plan:subscription_plans(*),
          features:plan_features(*)
        `)
        .eq('store_id', profile.store_id)
        .single();

      if (subError) throw subError;

      // Buscar uso atual das features
      const { data: usageData, error: usageError } = await supabase
        .from('feature_usage')
        .select('*')
        .eq('store_id', profile.store_id);

      if (usageError) throw usageError;

      setSubscription(subscriptionData);

      // Calcular porcentagem de uso para cada feature
      const usageWithPercentage = (usageData || []).map(usage => {
        const feature = subscriptionData.features.find(f => f.feature_type === usage.feature_type);
        const limit = feature?.feature_value || '0';
        const limitNum = parseInt(limit);
        const percentage = limitNum > 0 ? (usage.current_usage / limitNum) * 100 : 0;

        return {
          feature_type: usage.feature_type,
          current_usage: usage.current_usage,
          limit,
          percentage: Math.min(percentage, 100)
        };
      });

      setFeatureUsage(usageWithPercentage);
      setError(null);
    } catch (err) {
      console.error('Erro ao carregar assinatura:', err);
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    } finally {
      setLoading(false);
    }
  };

  const hasFeature = (featureType: string): boolean => {
    return subscription?.features.some(
      f => f.feature_type === featureType && f.is_enabled
    ) || false;
  };

  const getFeatureLimit = (featureType: string): number => {
    const feature = subscription?.features.find(f => f.feature_type === featureType);
    return parseInt(feature?.feature_value || '0');
  };

  const canUseFeature = (featureType: string, currentUsage?: number): boolean => {
    if (!hasFeature(featureType)) return false;
    
    const limit = getFeatureLimit(featureType);
    if (limit === 0) return true; // Ilimitado
    
    if (currentUsage !== undefined) {
      return currentUsage < limit;
    }

    const usage = featureUsage.find(u => u.feature_type === featureType);
    return !usage || usage.current_usage < limit;
  };

  const isTrialing = (): boolean => {
    return subscription?.status === 'trialing';
  };

  const getTrialDaysLeft = (): number => {
    if (!subscription?.trial_ends_at || subscription.status !== 'trialing') return 0;
    
    const trialEnd = new Date(subscription.trial_ends_at);
    const now = new Date();
    const diffTime = trialEnd.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return Math.max(0, diffDays);
  };

  useEffect(() => {
    fetchSubscription();
  }, [profile?.store_id]);

  return {
    subscription,
    featureUsage,
    loading,
    error,
    hasFeature,
    getFeatureLimit,
    canUseFeature,
    isTrialing,
    getTrialDaysLeft,
    refetch: fetchSubscription
  };
};
