
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export interface Coupon {
  id: string;
  store_id: string;
  code: string;
  description: string | null;
  discount_type: 'percentage' | 'fixed';
  discount_value: number;
  min_order_amount: number | null;
  max_uses: number | null;
  current_uses: number;
  expires_at: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateCouponData {
  code: string;
  description?: string;
  discount_type: 'percentage' | 'fixed';
  discount_value: number;
  min_order_amount?: number;
  max_uses?: number;
  expires_at?: string;
  is_active?: boolean;
}

export interface UpdateCouponData extends Partial<CreateCouponData> {}

export const useCoupons = () => {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const { profile } = useAuth();

  const fetchCoupons = async () => {
    try {
      setLoading(true);
      if (!profile?.store_id) return;

      const { data, error } = await supabase
        .from('coupons')
        .select('*')
        .eq('store_id', profile.store_id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCoupons(data || []);
    } catch (error) {
      console.error('Erro ao buscar cupons:', error);
    } finally {
      setLoading(false);
    }
  };

  const createCoupon = async (couponData: CreateCouponData) => {
    try {
      if (!profile?.store_id) {
        return { data: null, error: 'Store ID não encontrado' };
      }

      const { data, error } = await supabase
        .from('coupons')
        .insert([{
          ...couponData,
          store_id: profile.store_id
        }])
        .select()
        .single();

      if (error) throw error;
      await fetchCoupons();
      return { data, error: null };
    } catch (error) {
      console.error('Erro ao criar cupom:', error);
      return { data: null, error };
    }
  };

  const updateCoupon = async (id: string, updates: UpdateCouponData) => {
    try {
      const { data, error } = await supabase
        .from('coupons')
        .update(updates)
        .eq('id', id)
        .eq('store_id', profile?.store_id)
        .select()
        .single();

      if (error) throw error;
      await fetchCoupons();
      return { data, error: null };
    } catch (error) {
      console.error('Erro ao atualizar cupom:', error);
      return { data: null, error };
    }
  };

  const deleteCoupon = async (id: string) => {
    try {
      const { error } = await supabase
        .from('coupons')
        .delete()
        .eq('id', id)
        .eq('store_id', profile?.store_id);

      if (error) throw error;
      await fetchCoupons();
      return { error: null };
    } catch (error) {
      console.error('Erro ao deletar cupom:', error);
      return { error };
    }
  };

  const validateCoupon = async (code: string, orderAmount: number) => {
    try {
      if (!profile?.store_id) return { valid: false, error: 'Store não encontrado' };

      const { data, error } = await supabase
        .from('coupons')
        .select('*')
        .eq('store_id', profile.store_id)
        .eq('code', code.toUpperCase())
        .eq('is_active', true)
        .single();

      if (error || !data) {
        return { valid: false, error: 'Cupom não encontrado ou inválido' };
      }

      // Verificar se expirou
      if (data.expires_at && new Date(data.expires_at) < new Date()) {
        return { valid: false, error: 'Cupom expirado' };
      }

      // Verificar valor mínimo
      if (data.min_order_amount && orderAmount < data.min_order_amount) {
        return { valid: false, error: `Pedido mínimo de R$ ${data.min_order_amount}` };
      }

      // Verificar limite de uso
      if (data.max_uses && data.current_uses >= data.max_uses) {
        return { valid: false, error: 'Cupom esgotado' };
      }

      return { valid: true, coupon: data };
    } catch (error) {
      console.error('Erro ao validar cupom:', error);
      return { valid: false, error: 'Erro ao validar cupom' };
    }
  };

  useEffect(() => {
    if (profile?.store_id) {
      fetchCoupons();
    }
  }, [profile?.store_id]);

  return {
    coupons,
    loading,
    fetchCoupons,
    createCoupon,
    updateCoupon,
    deleteCoupon,
    validateCoupon
  };
};
