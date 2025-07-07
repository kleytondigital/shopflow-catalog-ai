
import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { VariationGroup, HierarchicalVariation } from '@/types/variation';

export const useVariationGroups = (productId?: string) => {
  const [groups, setGroups] = useState<VariationGroup[]>([]);
  const [variations, setVariations] = useState<HierarchicalVariation[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchGroups = useCallback(async () => {
    if (!productId) return;

    setLoading(true);
    setError(null);
    
    try {
      // Como a tabela product_variation_groups não existe, vamos usar uma implementação simples
      setGroups([]);
    } catch (err: any) {
      console.error('Error fetching variation groups:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [productId]);

  const fetchVariations = useCallback(async () => {
    if (!productId) return;

    try {
      const { data, error } = await supabase
        .from('product_variations')
        .select('*')
        .eq('product_id', productId)
        .order('display_order');

      if (error) throw error;
      
      const hierarchicalVariations: HierarchicalVariation[] = data?.map(v => ({
        id: v.id,
        product_id: v.product_id,
        variation_group_id: v.variation_group_id,
        parent_variation_id: v.parent_variation_id,
        variation_type: (v.variation_type as 'main' | 'sub' | 'simple') || 'simple',
        variation_value: v.variation_value || v.color || v.size || '',
        color: v.color,
        size: v.size,
        sku: v.sku,
        stock: v.stock,
        price_adjustment: v.price_adjustment,
        is_active: v.is_active,
        image_url: v.image_url,
        display_order: v.display_order || 0,
        children: []
      })) || [];
      
      setVariations(hierarchicalVariations);
    } catch (err: any) {
      console.error('Error fetching variations:', err);
      setError(err.message);
    }
  }, [productId]);

  const saveVariationGroup = useCallback(async (
    productId: string,
    groupData: Omit<VariationGroup, 'id' | 'created_at' | 'updated_at'>,
    variations: HierarchicalVariation[]
  ) => {
    try {
      // Salvar variações diretamente na tabela product_variations
      if (variations.length > 0) {
        const variationsToSave = variations.map((variation, index) => ({
          product_id: productId,
          variation_type: variation.variation_type,
          variation_value: variation.variation_value,
          color: variation.color,
          size: variation.size,
          sku: variation.sku || '',
          stock: variation.stock,
          price_adjustment: variation.price_adjustment,
          is_active: variation.is_active,
          image_url: variation.image_url,
          display_order: index,
          variation_group_id: null,
          parent_variation_id: variation.parent_variation_id
        }));

        const { error: variationsError } = await supabase
          .from('product_variations')
          .upsert(variationsToSave);

        if (variationsError) throw variationsError;
      }

      return { 
        success: true, 
        error: '',
        savedCount: variations.length 
      };
    } catch (error: any) {
      console.error('Error saving variation group:', error);
      return { 
        success: false, 
        error: error.message,
        savedCount: 0 
      };
    }
  }, []);

  useEffect(() => {
    if (productId) {
      fetchGroups();
      fetchVariations();
    }
  }, [productId, fetchGroups, fetchVariations]);

  return {
    groups,
    variations,
    loading,
    error,
    saveVariationGroup,
    fetchGroups,
    fetchVariations
  };
};
