
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface ProductVariation {
  id: string;
  product_id: string;
  color: string | null;
  size: string | null;
  sku: string | null;
  stock: number;
  price_adjustment: number;
  is_active: boolean;
  image_url: string | null;
  created_at: string;
  updated_at: string;
}

export const useProductVariations = (productId?: string) => {
  const [variations, setVariations] = useState<ProductVariation[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchVariations = async (id: string) => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('🎨 VARIAÇÕES - Carregando para produto:', id);

      const { data, error: fetchError } = await supabase
        .from('product_variations')
        .select('*')
        .eq('product_id', id)
        .eq('is_active', true)
        .order('created_at', { ascending: true });

      if (fetchError) {
        console.error('❌ Erro ao buscar variações:', fetchError);
        setError(fetchError.message);
        setVariations([]);
        return;
      }

      console.log('✅ VARIAÇÕES - Carregadas com sucesso:', {
        productId: id,
        count: data?.length || 0,
        variations: data?.map(v => ({
          id: v.id,
          color: v.color,
          size: v.size,
          stock: v.stock,
          hasImage: !!v.image_url
        })) || []
      });

      setVariations(data || []);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      console.error('🚨 Erro inesperado ao carregar variações:', err);
      setError(errorMessage);
      setVariations([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (productId) {
      fetchVariations(productId);
    } else {
      setVariations([]);
      setLoading(false);
      setError(null);
    }
  }, [productId]);

  return {
    variations,
    loading,
    error,
    refetch: () => productId && fetchVariations(productId)
  };
};
