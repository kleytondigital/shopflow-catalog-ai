
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface PlanPayment {
  id: string;
  store_id: string;
  plan_id: string;
  gateway: 'stripe' | 'asaas';
  amount: number;
  status: 'pending' | 'completed' | 'failed' | 'cancelled' | 'refunded';
  gateway_payment_id: string | null;
  gateway_response: any;
  created_at: string;
  updated_at: string;
  store?: {
    name: string;
  };
  plan?: {
    name: string;
    type: string;
  };
}

export interface CreatePaymentData {
  store_id: string;
  plan_id: string;
  gateway: 'stripe' | 'asaas';
  amount: number;
}

export const usePlanPayments = () => {
  const [payments, setPayments] = useState<PlanPayment[]>([]);
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState({
    totalRevenue: 0,
    monthlyRecurring: 0,
    conversionRate: 0,
    totalPayments: 0
  });

  const fetchPayments = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('plan_payments')
        .select(`
          *,
          store:stores(name),
          plan:subscription_plans(name, type)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Type assertion para garantir que os dados estão no formato correto
      const typedPayments = (data || []) as PlanPayment[];
      setPayments(typedPayments);
      
      // Calcular métricas
      const completedPayments = typedPayments.filter(p => p.status === 'completed');
      const totalRevenue = completedPayments.reduce((sum, p) => sum + p.amount, 0);
      const thisMonth = new Date();
      thisMonth.setDate(1);
      const monthlyRevenue = completedPayments
        .filter(p => new Date(p.created_at) >= thisMonth)
        .reduce((sum, p) => sum + p.amount, 0);
      
      setMetrics({
        totalRevenue,
        monthlyRecurring: monthlyRevenue,
        conversionRate: 0, // Calcular baseado em trials vs pagamentos
        totalPayments: typedPayments.length
      });

    } catch (error) {
      console.error('Erro ao buscar pagamentos:', error);
      toast.error('Erro ao carregar pagamentos');
    } finally {
      setLoading(false);
    }
  }, []);

  const createPayment = useCallback(async (data: CreatePaymentData) => {
    try {
      const { data: payment, error } = await supabase
        .from('plan_payments')
        .insert([data])
        .select()
        .single();

      if (error) throw error;

      const typedPayment = payment as PlanPayment;
      setPayments(prev => [typedPayment, ...prev]);
      toast.success('Pagamento iniciado com sucesso');
      return { data: typedPayment, error: null };
    } catch (error) {
      console.error('Erro ao criar pagamento:', error);
      toast.error('Erro ao iniciar pagamento');
      return { data: null, error };
    }
  }, []);

  const updatePaymentStatus = useCallback(async (
    id: string, 
    status: PlanPayment['status'],
    gatewayPaymentId?: string,
    gatewayResponse?: any
  ) => {
    try {
      const updateData: any = { status };
      if (gatewayPaymentId) updateData.gateway_payment_id = gatewayPaymentId;
      if (gatewayResponse) updateData.gateway_response = gatewayResponse;

      const { data: payment, error } = await supabase
        .from('plan_payments')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      const typedPayment = payment as PlanPayment;
      setPayments(prev => prev.map(p => p.id === id ? typedPayment : p));
      toast.success('Status do pagamento atualizado');
      return { data: typedPayment, error: null };
    } catch (error) {
      console.error('Erro ao atualizar pagamento:', error);
      toast.error('Erro ao atualizar status');
      return { data: null, error };
    }
  }, []);

  useEffect(() => {
    fetchPayments();
  }, [fetchPayments]);

  return {
    payments,
    metrics,
    loading,
    createPayment,
    updatePaymentStatus,
    refetch: fetchPayments
  };
};
