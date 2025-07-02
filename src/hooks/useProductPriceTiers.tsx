import { useState, useEffect } from "react";
import { supabase } from "../integrations/supabase/client";
import { ProductPriceTier, StorePriceModel } from "../types/price-models";
import { useStorePriceModel } from "./useStorePriceModel";

export const useProductPriceTiers = (productId: string, storeId?: string) => {
  const [tiers, setTiers] = useState<ProductPriceTier[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { priceModel: storePriceModel } = useStorePriceModel(storeId);

  // Buscar níveis de preço do produto
  const fetchTiers = async () => {
    if (!productId) return;

    try {
      setLoading(true);
      setError(null);

      console.log(
        "🔍 USE PRODUCT PRICE TIERS - Buscando níveis para produto:",
        productId
      );
      const { data, error: fetchError } = await supabase
        .from("product_price_tiers")
        .select("*")
        .eq("product_id", productId)
        .eq("is_active", true)
        .order("tier_order");

      if (fetchError) {
        console.error(
          "❌ USE PRODUCT PRICE TIERS - Erro ao buscar:",
          fetchError
        );
        throw fetchError;
      }

      console.log("🔍 USE PRODUCT PRICE TIERS - Níveis encontrados:", data);
      setTiers(data || []);
    } catch (err) {
      console.error(
        "💥 USE PRODUCT PRICE TIERS - Erro ao buscar níveis de preço:",
        err
      );
      setError(err instanceof Error ? err.message : "Erro desconhecido");
    } finally {
      setLoading(false);
    }
  };

  // Criar níveis padrão baseados no modelo da loja
  const createDefaultTiers = async (retailPrice: number) => {
    if (!productId || !storePriceModel) return;

    try {
      const defaultTiers: Omit<
        ProductPriceTier,
        "id" | "created_at" | "updated_at"
      >[] = [];

      // Sempre criar nível de varejo
      defaultTiers.push({
        product_id: productId,
        tier_name: storePriceModel.tier_1_name || "Varejo",
        tier_order: 1,
        tier_type: "retail",
        price: retailPrice,
        min_quantity: 1,
        is_active: true,
      });

      // Adicionar níveis conforme modelo da loja
      if (
        storePriceModel.price_model === "simple_wholesale" &&
        storePriceModel.tier_2_enabled
      ) {
        const wholesalePrice = retailPrice * 0.85; // 15% desconto padrão
        defaultTiers.push({
          product_id: productId,
          tier_name: storePriceModel.tier_2_name,
          tier_order: 2,
          tier_type: "simple_wholesale",
          price: wholesalePrice,
          min_quantity: storePriceModel.simple_wholesale_min_qty,
          is_active: true,
        });
      }

      if (storePriceModel.price_model === "gradual_wholesale") {
        // Nível 2 (Atacarejo)
        if (storePriceModel.tier_2_enabled) {
          const tier2Price = retailPrice * 0.9; // 10% desconto
          defaultTiers.push({
            product_id: productId,
            tier_name: storePriceModel.tier_2_name,
            tier_order: 2,
            tier_type: "gradual_wholesale",
            price: tier2Price,
            min_quantity: 5,
            is_active: true,
          });
        }

        // Nível 3 (Atacado Pequeno)
        if (storePriceModel.tier_3_enabled) {
          const tier3Price = retailPrice * 0.8; // 20% desconto
          defaultTiers.push({
            product_id: productId,
            tier_name: storePriceModel.tier_3_name,
            tier_order: 3,
            tier_type: "gradual_wholesale",
            price: tier3Price,
            min_quantity: 10,
            is_active: true,
          });
        }

        // Nível 4 (Atacado Grande)
        if (storePriceModel.tier_4_enabled) {
          const tier4Price = retailPrice * 0.7; // 30% desconto
          defaultTiers.push({
            product_id: productId,
            tier_name: storePriceModel.tier_4_name,
            tier_order: 4,
            tier_type: "gradual_wholesale",
            price: tier4Price,
            min_quantity: 50,
            is_active: true,
          });
        }
      }

      if (defaultTiers.length > 0) {
        const { data, error: createError } = await supabase
          .from("product_price_tiers")
          .insert(defaultTiers)
          .select();

        if (createError) throw createError;

        setTiers(data || []);
      }
    } catch (err) {
      console.error("Erro ao criar níveis padrão:", err);
      setError(
        err instanceof Error ? err.message : "Erro ao criar níveis padrão"
      );
    }
  };

  // Atualizar nível de preço
  const updateTier = async (
    tierId: string,
    updates: Partial<ProductPriceTier>
  ) => {
    try {
      setError(null);

      const { data, error: updateError } = await supabase
        .from("product_price_tiers")
        .update(updates)
        .eq("id", tierId)
        .select()
        .single();

      if (updateError) throw updateError;

      setTiers((prev) =>
        prev.map((tier) => (tier.id === tierId ? data : tier))
      );
      return data;
    } catch (err) {
      console.error("Erro ao atualizar nível:", err);
      setError(err instanceof Error ? err.message : "Erro ao atualizar nível");
      throw err;
    }
  };

  // Desativar nível
  const deactivateTier = async (tierId: string) => {
    return await updateTier(tierId, { is_active: false });
  };

  // Calcular preço baseado na quantidade
  const calculatePriceForQuantity = (
    quantity: number
  ): ProductPriceTier | null => {
    if (!tiers.length) return null;

    // Ordenar por quantidade mínima (decrescente) para encontrar o melhor preço
    const sortedTiers = [...tiers].sort(
      (a, b) => b.min_quantity - a.min_quantity
    );

    // Encontrar o primeiro nível que atende à quantidade
    return sortedTiers.find((tier) => quantity >= tier.min_quantity) || null;
  };

  // Obter próximo nível disponível
  const getNextTier = (currentQuantity: number): ProductPriceTier | null => {
    if (!tiers.length) return null;

    const sortedTiers = [...tiers].sort(
      (a, b) => a.min_quantity - b.min_quantity
    );
    return (
      sortedTiers.find((tier) => tier.min_quantity > currentQuantity) || null
    );
  };

  // Calcular economia
  const calculateSavings = (
    currentTier: ProductPriceTier,
    nextTier?: ProductPriceTier
  ) => {
    if (!nextTier) return { amount: 0, percentage: 0 };

    const savingsAmount = currentTier.price - nextTier.price;
    const savingsPercentage = (savingsAmount / currentTier.price) * 100;

    return {
      amount: savingsAmount,
      percentage: savingsPercentage,
    };
  };

  // Buscar dados quando productId mudar
  useEffect(() => {
    if (productId) {
      fetchTiers();
    }
  }, [productId]);

  return {
    tiers,
    loading,
    error,
    updateTier,
    deactivateTier,
    createDefaultTiers,
    calculatePriceForQuantity,
    getNextTier,
    calculateSavings,
    refetch: fetchTiers,
  };
};
