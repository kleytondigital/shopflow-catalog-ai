
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface ProductVariation {
  id: string;
  product_id: string;
  color: string | null;
  size: string | null;
  sku: string | null;
  stock: number;
  price_adjustment: number | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateVariationData {
  product_id: string;
  color?: string;
  size?: string;
  sku?: string;
  stock: number;
  price_adjustment?: number;
  is_active?: boolean;
}

export const useProductVariations = (productId?: string) => {
  const [variations, setVariations] = useState<ProductVariation[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchVariations = async () => {
    if (!productId) return;
    
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('product_variations')
        .select('*')
        .eq('product_id', productId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setVariations(data || []);
    } catch (error) {
      console.error('Erro ao buscar variações:', error);
    } finally {
      setLoading(false);
    }
  };

  const createVariation = async (variationData: CreateVariationData) => {
    try {
      const { data, error } = await supabase
        .from('product_variations')
        .insert([variationData])
        .select()
        .single();

      if (error) throw error;
      await fetchVariations();
      return { data, error: null };
    } catch (error) {
      console.error('Erro ao criar variação:', error);
      return { data: null, error };
    }
  };

  const updateVariation = async (id: string, updates: Partial<CreateVariationData>) => {
    try {
      const { data, error } = await supabase
        .from('product_variations')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      await fetchVariations();
      return { data, error: null };
    } catch (error) {
      console.error('Erro ao atualizar variação:', error);
      return { data: null, error };
    }
  };

  const deleteVariation = async (id: string) => {
    try {
      const { error } = await supabase
        .from('product_variations')
        .delete()
        .eq('id', id);

      if (error) throw error;
      await fetchVariations();
      return { error: null };
    } catch (error) {
      console.error('Erro ao deletar variação:', error);
      return { error };
    }
  };

  useEffect(() => {
    if (productId) {
      fetchVariations();
    }
  }, [productId]);

  return {
    variations,
    loading,
    fetchVariations,
    createVariation,
    updateVariation,
    deleteVariation
  };
};
