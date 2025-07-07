
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface ProductPriceTier {
  id: string;
  product_id: string;
  tier_name: string;
  min_quantity: number;
  price: number;
  tier_type: 'bulk' | 'wholesale' | 'retail';
  tier_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export const useProductPriceTiers = (productId?: string) => {
  const [tiers, setTiers] = useState<ProductPriceTier[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchTiers = async () => {
    if (!productId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const { data, error } = await supabase
        .from('product_price_tiers')
        .select('*')
        .eq('product_id', productId)
        .order('tier_order');

      if (error) throw error;

      const formattedTiers: ProductPriceTier[] = (data || []).map(tier => ({
        ...tier,
        tier_type: tier.tier_type as 'bulk' | 'wholesale' | 'retail'
      }));

      setTiers(formattedTiers);
    } catch (err: any) {
      console.error('Erro ao buscar tiers de preço:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const createTier = async (newTier: Omit<ProductPriceTier, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data, error } = await supabase
        .from('product_price_tiers')
        .insert([newTier])
        .select()
        .single();

      if (error) throw error;

      const formattedTier: ProductPriceTier = {
        ...data,
        tier_type: data.tier_type as 'bulk' | 'wholesale' | 'retail'
      };

      setTiers(prev => [...prev, formattedTier]);
      
      toast({
        title: "Tier criado",
        description: "Tier de preço criado com sucesso"
      });

      return formattedTier;
    } catch (err: any) {
      console.error('Erro ao criar tier:', err);
      toast({
        title: "Erro",
        description: "Falha ao criar tier de preço",
        variant: "destructive"
      });
      throw err;
    }
  };

  const updateTier = async (tierId: string, updates: Partial<ProductPriceTier>) => {
    try {
      const { data, error } = await supabase
        .from('product_price_tiers')
        .update(updates)
        .eq('id', tierId)
        .select()
        .single();

      if (error) throw error;

      const formattedTier: ProductPriceTier = {
        ...data,
        tier_type: data.tier_type as 'bulk' | 'wholesale' | 'retail'
      };

      setTiers(prev => prev.map(tier => 
        tier.id === tierId ? formattedTier : tier
      ));

      toast({
        title: "Tier atualizado",
        description: "Tier de preço atualizado com sucesso"
      });

      return formattedTier;
    } catch (err: any) {
      console.error('Erro ao atualizar tier:', err);
      toast({
        title: "Erro",
        description: "Falha ao atualizar tier de preço",
        variant: "destructive"
      });
      throw err;
    }
  };

  const deleteTier = async (tierId: string) => {
    try {
      const { error } = await supabase
        .from('product_price_tiers')
        .delete()
        .eq('id', tierId);

      if (error) throw error;

      setTiers(prev => prev.filter(tier => tier.id !== tierId));
      
      toast({
        title: "Tier removido",
        description: "Tier de preço removido com sucesso"
      });
    } catch (err: any) {
      console.error('Erro ao remover tier:', err);
      toast({
        title: "Erro",
        description: "Falha ao remover tier de preço",
        variant: "destructive"
      });
      throw err;
    }
  };

  const createDefaultTiers = async (productId: string, basePrice: number) => {
    const defaultTiers = [
      {
        product_id: productId,
        tier_name: 'Varejo',
        min_quantity: 1,
        price: basePrice,
        tier_type: 'retail' as const,
        tier_order: 1,
        is_active: true
      },
      {
        product_id: productId,
        tier_name: 'Atacado',
        min_quantity: 10,
        price: basePrice * 0.9,
        tier_type: 'wholesale' as const,
        tier_order: 2,
        is_active: true
      }
    ];

    try {
      const { data, error } = await supabase
        .from('product_price_tiers')
        .insert(defaultTiers)
        .select();

      if (error) throw error;

      const formattedTiers: ProductPriceTier[] = (data || []).map(tier => ({
        ...tier,
        tier_type: tier.tier_type as 'bulk' | 'wholesale' | 'retail'
      }));

      setTiers(prev => [...prev, ...formattedTiers]);
      return formattedTiers;
    } catch (err: any) {
      console.error('Erro ao criar tiers padrão:', err);
      throw err;
    }
  };

  useEffect(() => {
    fetchTiers();
  }, [productId]);

  return {
    tiers,
    loading,
    error,
    fetchTiers,
    createTier,
    updateTier,
    deleteTier,
    createDefaultTiers
  };
};
