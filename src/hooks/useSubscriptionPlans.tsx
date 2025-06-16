
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface SubscriptionPlan {
  id: string;
  name: string;
  description: string | null;
  type: 'basic' | 'premium' | 'enterprise';
  price_monthly: number;
  price_yearly: number | null;
  is_active: boolean;
  trial_days: number | null;
  sort_order: number | null;
  created_at: string;
  updated_at: string;
}

export const useSubscriptionPlans = () => {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPlans = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const { data, error: fetchError } = await supabase
        .from('subscription_plans')
        .select('*')
        .eq('is_active', true)
        .order('sort_order', { ascending: true });

      if (fetchError) throw fetchError;
      
      console.log('useSubscriptionPlans: Planos carregados:', data?.length || 0);
      setPlans(data || []);
    } catch (error) {
      console.error('Erro ao buscar planos:', error);
      setError(error instanceof Error ? error.message : 'Erro ao buscar planos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlans();
  }, []);

  return {
    plans,
    loading,
    error,
    refetch: fetchPlans
  };
};
