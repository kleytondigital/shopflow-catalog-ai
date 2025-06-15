import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useBenefitsCache } from '@/hooks/useBenefitsCache';
import { useRealtimeBenefits } from '@/hooks/useRealtimeBenefits';

export interface PlanBenefit {
  id: string;
  plan_id: string;
  benefit_id: string;
  limit_value: string | null;
  is_enabled: boolean;
  created_at: string;
  benefit: {
    id: string;
    name: string;
    description: string | null;
    benefit_key: string;
    category: string;
    is_active: boolean;
  };
}

export interface CreatePlanBenefitData {
  plan_id: string;
  benefit_id: string;
  limit_value?: string;
  is_enabled?: boolean;
}

export interface UpdatePlanBenefitData {
  limit_value?: string;
  is_enabled?: boolean;
}

export const usePlanBenefits = () => {
  const [planBenefits, setPlanBenefits] = useState<Record<string, PlanBenefit[]>>({});
  const [loading, setLoading] = useState(true);
  const { 
    getPlanBenefits: getCachedPlanBenefits, 
    setPlanBenefits: setCachedPlanBenefits,
    invalidatePlan,
    invalidateAll 
  } = useBenefitsCache();

  const fetchPlanBenefits = useCallback(async (planId?: string, useCache = true) => {
    console.log(`🔄 Fetching plan benefits${planId ? ` for plan: ${planId}` : ' (all)'}`);
    
    // Tentar usar cache primeiro para plano específico
    if (planId && useCache) {
      const cachedBenefits = getCachedPlanBenefits(planId);
      if (cachedBenefits) {
        setPlanBenefits(prev => ({
          ...prev,
          [planId]: cachedBenefits
        }));
        return;
      }
    }
    
    try {
      let query = supabase
        .from('plan_benefits')
        .select(`
          *,
          benefit:system_benefits(*)
        `)
        .order('created_at', { ascending: true });

      if (planId) {
        query = query.eq('plan_id', planId);
      }

      const { data, error } = await query;

      if (error) {
        console.error('❌ Error fetching plan benefits:', error);
        throw error;
      }

      console.log(`✅ Fetched ${data?.length || 0} plan benefits`, data);

      if (planId) {
        const benefitsData = data || [];
        setPlanBenefits(prev => ({
          ...prev,
          [planId]: benefitsData
        }));
        
        // Atualizar cache
        setCachedPlanBenefits(planId, benefitsData);
      } else {
        // Agrupar por plan_id
        const groupedBenefits = (data || []).reduce((acc, benefit) => {
          if (!acc[benefit.plan_id]) {
            acc[benefit.plan_id] = [];
          }
          acc[benefit.plan_id].push(benefit);
          return acc;
        }, {} as Record<string, PlanBenefit[]>);

        setPlanBenefits(groupedBenefits);
        
        // Atualizar cache para cada plano
        Object.entries(groupedBenefits).forEach(([pId, benefits]) => {
          setCachedPlanBenefits(pId, benefits);
        });
      }
    } catch (error) {
      console.error('💥 Error in fetchPlanBenefits:', error);
      toast.error('Erro ao carregar benefícios do plano');
    } finally {
      setLoading(false);
    }
  }, [getCachedPlanBenefits, setCachedPlanBenefits]);

  // Setup realtime updates
  useRealtimeBenefits(
    undefined, // Não precisa reagir a system_benefits aqui
    useCallback(() => {
      console.log('🔄 Realtime trigger: refreshing plan benefits');
      invalidateAll();
      fetchPlanBenefits(undefined, false); // Force fresh fetch for all plans
    }, [fetchPlanBenefits, invalidateAll])
  );

  const addBenefitToPlan = useCallback(async (data: CreatePlanBenefitData) => {
    console.log('➕ Adding benefit to plan:', data);
    
    // Optimistic update
    const tempBenefit = {
      id: `temp-${Date.now()}`,
      plan_id: data.plan_id,
      benefit_id: data.benefit_id,
      limit_value: data.limit_value || null,
      is_enabled: data.is_enabled ?? true,
      created_at: new Date().toISOString(),
      benefit: {
        id: data.benefit_id,
        name: 'Carregando...',
        description: null,
        benefit_key: '',
        category: '',
        is_active: true
      }
    };

    setPlanBenefits(prev => ({
      ...prev,
      [data.plan_id]: [...(prev[data.plan_id] || []), tempBenefit]
    }));
    
    try {
      const { data: newBenefit, error } = await supabase
        .from('plan_benefits')
        .insert([data])
        .select(`
          *,
          benefit:system_benefits(*)
        `)
        .single();

      if (error) {
        console.error('❌ Error adding benefit to plan:', error);
        // Reverter optimistic update
        setPlanBenefits(prev => ({
          ...prev,
          [data.plan_id]: prev[data.plan_id]?.filter(b => b.id !== tempBenefit.id) || []
        }));
        throw error;
      }

      console.log('✅ Benefit added successfully:', newBenefit);

      // Substituir benefit temporário pelo real
      setPlanBenefits(prev => ({
        ...prev,
        [data.plan_id]: prev[data.plan_id]?.map(b => 
          b.id === tempBenefit.id ? newBenefit : b
        ) || [newBenefit]
      }));

      // Invalidar cache e atualizar
      invalidatePlan(data.plan_id);
      setTimeout(() => fetchPlanBenefits(data.plan_id, false), 100);

      return { data: newBenefit, error: null };
    } catch (error) {
      console.error('💥 Error in addBenefitToPlan:', error);
      return { data: null, error };
    }
  }, [invalidatePlan, fetchPlanBenefits]);

  const updatePlanBenefit = useCallback(async (id: string, data: UpdatePlanBenefitData) => {
    console.log(`🔄 Updating plan benefit ${id}:`, data);
    
    // Optimistic update
    const previousBenefits = { ...planBenefits };
    setPlanBenefits(prev => {
      const newBenefits = { ...prev };
      Object.keys(newBenefits).forEach(planId => {
        newBenefits[planId] = newBenefits[planId].map(b => 
          b.id === id ? { ...b, ...data } : b
        );
      });
      return newBenefits;
    });
    
    try {
      const { data: updatedBenefit, error } = await supabase
        .from('plan_benefits')
        .update(data)
        .eq('id', id)
        .select(`
          *,
          benefit:system_benefits(*)
        `)
        .single();

      if (error) {
        console.error('❌ Error updating plan benefit:', error);
        // Reverter optimistic update
        setPlanBenefits(previousBenefits);
        throw error;
      }

      console.log('✅ Benefit updated successfully:', updatedBenefit);

      // Atualizar com dados reais do servidor
      setPlanBenefits(prev => {
        const newBenefits = { ...prev };
        Object.keys(newBenefits).forEach(planId => {
          newBenefits[planId] = newBenefits[planId].map(b => 
            b.id === id ? updatedBenefit : b
          );
        });
        return newBenefits;
      });

      // Invalidar cache e forçar refresh
      invalidateAll();
      setTimeout(() => fetchPlanBenefits(updatedBenefit.plan_id, false), 100);

      return { data: updatedBenefit, error: null };
    } catch (error) {
      console.error('💥 Error in updatePlanBenefit:', error);
      return { data: null, error };
    }
  }, [planBenefits, invalidateAll, fetchPlanBenefits]);

  const removeBenefitFromPlan = useCallback(async (id: string) => {
    console.log(`🗑️ Removing plan benefit: ${id}`);
    
    try {
      const { error } = await supabase
        .from('plan_benefits')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('❌ Error removing plan benefit:', error);
        throw error;
      }

      console.log('✅ Benefit removed successfully');

      setPlanBenefits(prev => {
        const newBenefits = { ...prev };
        Object.keys(newBenefits).forEach(planId => {
          newBenefits[planId] = newBenefits[planId].filter(b => b.id !== id);
        });
        return newBenefits;
      });

      return { error: null };
    } catch (error) {
      console.error('💥 Error in removeBenefitFromPlan:', error);
      return { error };
    }
  }, []);

  const getPlanBenefits = useCallback((planId: string) => {
    const benefits = planBenefits[planId] || [];
    console.log(`📋 Getting benefits for plan ${planId}:`, benefits.length);
    return benefits;
  }, [planBenefits]);

  useEffect(() => {
    fetchPlanBenefits();
  }, [fetchPlanBenefits]);

  return {
    planBenefits,
    loading,
    addBenefitToPlan,
    updatePlanBenefit,
    removeBenefitFromPlan,
    getPlanBenefits,
    refetch: fetchPlanBenefits
  };
};
