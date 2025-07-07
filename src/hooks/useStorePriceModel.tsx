
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export type PriceModelType = 'retail_only' | 'simple_wholesale' | 'gradual_wholesale';

export interface StorePriceModel {
  id?: string;
  store_id?: string;
  price_model: PriceModelType;
  simple_wholesale_enabled: boolean;
  simple_wholesale_name: string;
  simple_wholesale_min_qty: number;
  gradual_wholesale_enabled: boolean;
  gradual_tiers_count: number;
  tier_1_enabled: boolean;
  tier_1_name: string;
  tier_2_enabled: boolean;
  tier_2_name: string;
  tier_3_enabled: boolean;
  tier_3_name: string;
  tier_4_enabled: boolean;
  tier_4_name: string;
  show_price_tiers: boolean;
  show_savings_indicators: boolean;
  show_next_tier_hint: boolean;
  created_at?: string;
  updated_at?: string;
}

export const useStorePriceModel = (storeId?: string) => {
  const [priceModel, setPriceModel] = useState<StorePriceModel>({
    price_model: 'retail_only',
    simple_wholesale_enabled: false,
    simple_wholesale_name: 'Atacado',
    simple_wholesale_min_qty: 10,
    gradual_wholesale_enabled: false,
    gradual_tiers_count: 2,
    tier_1_enabled: true,
    tier_1_name: 'Varejo',
    tier_2_enabled: false,
    tier_2_name: 'Atacarejo',
    tier_3_enabled: false,
    tier_3_name: 'Atacado Pequeno',
    tier_4_enabled: false,
    tier_4_name: 'Atacado Grande',
    show_price_tiers: true,
    show_savings_indicators: true,
    show_next_tier_hint: true,
  });
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const fetchPriceModel = useCallback(async () => {
    if (!storeId) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('store_price_models')
        .select('*')
        .eq('store_id', storeId)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (data) {
        // Convert string to PriceModelType
        const convertedData = {
          ...data,
          price_model: data.price_model as PriceModelType
        };
        setPriceModel(convertedData);
      }
    } catch (error: any) {
      console.error('Error fetching price model:', error);
      toast({
        title: "Erro",
        description: "Falha ao carregar modelo de preços",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [storeId, toast]);

  const updatePriceModel = useCallback(async (updates: Partial<StorePriceModel>) => {
    if (!storeId) return;

    setLoading(true);
    try {
      const updatedModel = { ...priceModel, ...updates };
      
      const { data, error } = await supabase
        .from('store_price_models')
        .upsert({
          ...updatedModel,
          store_id: storeId,
        })
        .select()
        .single();

      if (error) throw error;

      // Convert string to PriceModelType for state
      const convertedData = {
        ...data,
        price_model: data.price_model as PriceModelType
      };
      setPriceModel(convertedData);

      toast({
        title: "Sucesso",
        description: "Modelo de preços atualizado com sucesso",
      });
    } catch (error: any) {
      console.error('Error updating price model:', error);
      toast({
        title: "Erro",
        description: "Falha ao atualizar modelo de preços",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [storeId, priceModel, toast]);

  const createDefaultPriceModel = useCallback(async () => {
    if (!storeId) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('store_price_models')
        .insert({
          store_id: storeId,
          price_model: 'retail_only',
          simple_wholesale_enabled: false,
          simple_wholesale_name: 'Atacado',
          simple_wholesale_min_qty: 10,
          gradual_wholesale_enabled: false,
          gradual_tiers_count: 2,
          tier_1_enabled: true,
          tier_1_name: 'Varejo',
          tier_2_enabled: false,
          tier_2_name: 'Atacarejo',
          tier_3_enabled: false,
          tier_3_name: 'Atacado Pequeno',
          tier_4_enabled: false,
          tier_4_name: 'Atacado Grande',
          show_price_tiers: true,
          show_savings_indicators: true,
          show_next_tier_hint: true,
        })
        .select()
        .single();

      if (error) throw error;

      // Convert string to PriceModelType for state
      const convertedData = {
        ...data,
        price_model: data.price_model as PriceModelType
      };
      setPriceModel(convertedData);

      toast({
        title: "Sucesso",
        description: "Modelo de preços padrão criado",
      });
    } catch (error: any) {
      console.error('Error creating default price model:', error);
      toast({
        title: "Erro",
        description: "Falha ao criar modelo de preços padrão",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [storeId, toast]);

  useEffect(() => {
    if (storeId) {
      fetchPriceModel();
    }
  }, [fetchPriceModel, storeId]);

  return {
    priceModel,
    loading,
    updatePriceModel,
    createDefaultPriceModel,
    refetch: fetchPriceModel,
  };
};
