
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ProductPriceTier } from "@/types/product";

export const useProductPriceTiers = (
  productId?: string,
  productData?: {
    wholesale_price?: number;
    min_wholesale_qty?: number;
    retail_price?: number;
  }
) => {
  const [tiers, setTiers] = useState<ProductPriceTier[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTiers = async (id: string) => {
    setLoading(true);
    setError(null);

    try {
      const { data, error: fetchError } = await supabase
        .from("product_price_tiers")
        .select("*")
        .eq("product_id", id)
        .eq("is_active", true)
        .order("tier_order", { ascending: true });

      if (fetchError) {
        setError(fetchError.message);
        setTiers([]);
        return;
      }

      let processedTiers: ProductPriceTier[] =
        data?.map((tier) => ({
          id: tier.id,
          tier_name: tier.tier_name,
          tier_type: tier.tier_type,
          min_quantity: tier.min_quantity,
          price: tier.price,
          tier_order: tier.tier_order,
          is_active: tier.is_active,
        })) || [];

      // Fallback: se não houver tiers ativos, mas houver wholesale_price, criar tier "Atacado Simples"
      if (
        processedTiers.length === 0 &&
        productData &&
        productData.wholesale_price &&
        productData.min_wholesale_qty &&
        productData.wholesale_price < (productData.retail_price || 999999)
      ) {
        processedTiers = [
          {
            id: "simple-wholesale-tier",
            tier_name: "Atacado Simples",
            tier_type: "simple",
            min_quantity: productData.min_wholesale_qty,
            price: productData.wholesale_price,
            tier_order: 1,
            is_active: true,
          },
        ];
      }

      setTiers(processedTiers);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Erro desconhecido";
      setError(errorMessage);
      setTiers([]);
    } finally {
      setLoading(false);
    }
  };

  const createTier = async (tierData: Omit<ProductPriceTier, "id">) => {
    if (!productId) return;

    try {
      const { data, error } = await supabase
        .from("product_price_tiers")
        .insert([
          {
            product_id: productId,
            tier_name: tierData.tier_name,
            tier_type: tierData.tier_type,
            min_quantity: tierData.min_quantity,
            price: tierData.price,
            tier_order: tierData.tier_order,
            is_active: tierData.is_active ?? true,
          },
        ])
        .select()
        .single();

      if (error) throw error;

      if (data) {
        const newTier: ProductPriceTier = {
          id: data.id,
          tier_name: data.tier_name,
          tier_type: data.tier_type,
          min_quantity: data.min_quantity,
          price: data.price,
          tier_order: data.tier_order,
          is_active: data.is_active,
        };
        setTiers(prev => [...prev, newTier].sort((a, b) => a.tier_order - b.tier_order));
      }
      
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao criar tier");
      throw err;
    }
  };

  const updateTier = async (tierId: string, tierData: Partial<ProductPriceTier>) => {
    try {
      const { data, error } = await supabase
        .from("product_price_tiers")
        .update({
          tier_name: tierData.tier_name,
          tier_type: tierData.tier_type,
          min_quantity: tierData.min_quantity,
          price: tierData.price,
          tier_order: tierData.tier_order,
          is_active: tierData.is_active,
        })
        .eq("id", tierId)
        .select()
        .single();

      if (error) throw error;

      if (data) {
        setTiers(prev =>
          prev.map(tier =>
            tier.id === tierId
              ? {
                  id: data.id,
                  tier_name: data.tier_name,
                  tier_type: data.tier_type,
                  min_quantity: data.min_quantity,
                  price: data.price,
                  tier_order: data.tier_order,
                  is_active: data.is_active,
                }
              : tier
          )
        );
      }

      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao atualizar tier");
      throw err;
    }
  };

  const deleteTier = async (tierId: string) => {
    try {
      const { error } = await supabase
        .from("product_price_tiers")
        .delete()
        .eq("id", tierId);

      if (error) throw error;

      setTiers(prev => prev.filter(tier => tier.id !== tierId));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao deletar tier");
      throw err;
    }
  };

  const refetch = async () => {
    if (productId) {
      await fetchTiers(productId);
    }
  };

  useEffect(() => {
    if (productId && productId.trim() !== "") {
      fetchTiers(productId);
    } else {
      setTiers([]);
      setLoading(false);
      setError(null);
    }
  }, [
    productId,
    productData?.wholesale_price,
    productData?.min_wholesale_qty,
    productData?.retail_price,
  ]);

  return {
    tiers,
    loading,
    error,
    refetch,
    createTier,
    updateTier,
    deleteTier,
  };
};
