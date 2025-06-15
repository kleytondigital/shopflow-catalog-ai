
import { useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

export const useRealtimeBenefits = (
  onBenefitsChange?: () => void,
  onPlanBenefitsChange?: () => void
) => {
  const { profile } = useAuth();

  const handleSystemBenefitsChange = useCallback((payload: any) => {
    console.log('🔄 System benefits changed:', payload);
    
    if (payload.eventType === 'UPDATE') {
      const benefit = payload.new;
      toast.info(`Benefício "${benefit.name}" foi atualizado pelo administrador`);
    } else if (payload.eventType === 'INSERT') {
      const benefit = payload.new;
      toast.success(`Novo benefício "${benefit.name}" disponível no sistema`);
    }
    
    onBenefitsChange?.();
  }, [onBenefitsChange]);

  const handlePlanBenefitsChange = useCallback((payload: any) => {
    console.log('🔄 Plan benefits changed:', payload);
    
    if (payload.eventType === 'UPDATE' || payload.eventType === 'INSERT') {
      const planBenefit = payload.new;
      if (planBenefit.is_enabled) {
        toast.info('Novo benefício ativado no seu plano!');
      } else {
        toast.warning('Um benefício foi desativado no seu plano');
      }
    }
    
    onPlanBenefitsChange?.();
  }, [onPlanBenefitsChange]);

  useEffect(() => {
    // Subscription para mudanças em system_benefits
    const systemBenefitsChannel = supabase
      .channel('system-benefits-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'system_benefits'
        },
        handleSystemBenefitsChange
      )
      .subscribe();

    // Subscription para mudanças em plan_benefits
    const planBenefitsChannel = supabase
      .channel('plan-benefits-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'plan_benefits'
        },
        handlePlanBenefitsChange
      )
      .subscribe();

    console.log('📡 Realtime subscriptions initialized');

    return () => {
      console.log('📡 Cleaning up realtime subscriptions');
      supabase.removeChannel(systemBenefitsChannel);
      supabase.removeChannel(planBenefitsChannel);
    };
  }, [handleSystemBenefitsChange, handlePlanBenefitsChange]);

  return {
    // Método para forçar atualização manual se necessário
    forceRefresh: useCallback(() => {
      onBenefitsChange?.();
      onPlanBenefitsChange?.();
    }, [onBenefitsChange, onPlanBenefitsChange])
  };
};
