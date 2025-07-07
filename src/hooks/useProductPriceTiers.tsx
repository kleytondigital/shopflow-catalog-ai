import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface ProductPriceTier {
  id: string;
  product_id: string;
  tier_name: string;
  tier_type: "retail" | "wholesale" | "bulk";
  min_quantity: number;
  price: number;
  tier_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export const useProductPriceTiers = (productId?: string) => {
  const [tiers, setTiers] = useState<ProductPriceTier[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const fetchTiers = useCallback(async () => {
    if (!productId) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("product_price_tiers")
        .select("*")
        .eq("product_id", productId)
        .order("tier_order");

      if (error) throw error;

      // Map the data with proper typing
      const typedTiers: ProductPriceTier[] = data?.map(tier => ({
        ...tier,
        tier_type: tier.tier_type as "retail" | "wholesale" | "bulk"
      })) || [];

      setTiers(typedTiers);
    } catch (error) {
      console.error("Error fetching price tiers:", error);
      toast({
        title: "Erro",
        description: "Erro ao carregar níveis de preço",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [productId, toast]);

  useEffect(() => {
    fetchTiers();
  }, [fetchTiers, productId]);

  const createTier = useCallback(
    async (newTier: Omit<ProductPriceTier, "id" | "created_at" | "updated_at">) => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from("product_price_tiers")
          .insert([{ ...newTier }])
          .select()
          .single();

        if (error) throw error;

        setTiers((prevTiers) => [...prevTiers, data]);
        toast({
          title: "Sucesso",
          description: "Nível de preço criado com sucesso",
        });
      } catch (error) {
        console.error("Error creating price tier:", error);
        toast({
          title: "Erro",
          description: "Erro ao criar nível de preço",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
        fetchTiers();
      }
    },
    [toast, fetchTiers]
  );

  const updateTier = useCallback(
    async (tierId: string, updates: Partial<ProductPriceTier>) => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from("product_price_tiers")
          .update(updates)
          .eq("id", tierId)
          .select()
          .single();

        if (error) throw error;

        setTiers((prevTiers) =>
          prevTiers.map((tier) => (tier.id === tierId ? { ...tier, ...data } : tier))
        );
        toast({
          title: "Sucesso",
          description: "Nível de preço atualizado com sucesso",
        });
      } catch (error) {
        console.error("Error updating price tier:", error);
        toast({
          title: "Erro",
          description: "Erro ao atualizar nível de preço",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
        fetchTiers();
      }
    },
    [toast, fetchTiers]
  );

  const deleteTier = useCallback(
    async (tierId: string) => {
      setLoading(true);
      try {
        const { error } = await supabase
          .from("product_price_tiers")
          .delete()
          .eq("id", tierId);

        if (error) throw error;

        setTiers((prevTiers) => prevTiers.filter((tier) => tier.id !== tierId));
        toast({
          title: "Sucesso",
          description: "Nível de preço removido com sucesso",
        });
      } catch (error) {
        console.error("Error deleting price tier:", error);
        toast({
          title: "Erro",
          description: "Erro ao remover nível de preço",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
        fetchTiers();
      }
    },
    [toast, fetchTiers]
  );

  return {
    tiers,
    loading,
    fetchTiers,
    createTier,
    updateTier,
    deleteTier,
  };
};
