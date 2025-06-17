
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

export interface CreateSubscriptionPlanData {
  name: string;
  description?: string | null;
  type: 'basic' | 'premium' | 'enterprise';
  price_monthly: number;
  price_yearly?: number | null;
  is_active: boolean;
  trial_days?: number | null;
  sort_order?: number | null;
}

export type UpdateSubscriptionPlanData = Partial<CreateSubscriptionPlanData> & { id: string };

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
      setPlans(data || []);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Erro ao buscar planos');
    } finally {
      setLoading(false);
    }
  };

  const createPlan = async (plan: CreateSubscriptionPlanData) => {
    try {
      const { data, error } = await supabase.from('subscription_plans').insert([plan]);
      if (error) throw error;
      await fetchPlans();
      return { data, error: null };
    } catch (error) {
      return { data: null, error: error instanceof Error ? error.message : 'Erro ao criar plano' };
    }
  };

  const updatePlan = async (id: string, updates: UpdateSubscriptionPlanData) => {
    try {
      const { data, error } = await supabase
        .from('subscription_plans')
        .update(updates)
        .eq('id', id);
      if (error) throw error;
      await fetchPlans();
      return { data, error: null };
    } catch (error) {
      return { data: null, error: error instanceof Error ? error.message : 'Erro ao atualizar plano' };
    }
  };

  const deletePlan = async (id: string) => {
    try {
      const { error } = await supabase
        .from('subscription_plans')
        .delete()
        .eq('id', id);
      if (error) throw error;
      await fetchPlans();
      return { error: null };
    } catch (error) {
      return { error: error instanceof Error ? error.message : 'Erro ao deletar plano' };
    }
  };

  const getPlanById = (id: string): SubscriptionPlan | null => {
    return plans.find(plan => plan.id === id) || null;
  };

  useEffect(() => {
    fetchPlans();
  }, []);

  return {
    plans,
    loading,
    error,
    refetch: fetchPlans,
    createPlan,
    updatePlan,
    deletePlan,
    getPlanById
  };
};
