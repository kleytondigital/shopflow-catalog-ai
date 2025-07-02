import { useState, useEffect } from "react";
import { supabase } from "../integrations/supabase/client";
import {
  StorePriceModel,
  PriceModelType,
  PriceModelSettings,
} from "../types/price-models";
import { useAuth } from "./useAuth";

export const useStorePriceModel = (storeId?: string) => {
  const { user } = useAuth();
  const [priceModel, setPriceModel] = useState<StorePriceModel | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Buscar modelo de preço da loja
  const fetchPriceModel = async () => {
    if (!storeId) return;

    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from("store_price_models")
        .select("*")
        .eq("store_id", storeId)
        .single();

      if (fetchError && fetchError.code !== "PGRST116") {
        throw fetchError;
      }

      if (data) {
        setPriceModel(data);
      } else {
        // Criar modelo padrão se não existir
        await createDefaultPriceModel(storeId);
      }
    } catch (err) {
      console.error("Erro ao buscar modelo de preço:", err);
      setError(err instanceof Error ? err.message : "Erro desconhecido");
    } finally {
      setLoading(false);
    }
  };

  // Criar modelo padrão (apenas varejo)
  const createDefaultPriceModel = async (storeId: string) => {
    try {
      const defaultModel: Omit<
        StorePriceModel,
        "id" | "created_at" | "updated_at"
      > = {
        store_id: storeId,
        price_model: "retail_only",
        simple_wholesale_enabled: false,
        simple_wholesale_name: "Atacado",
        simple_wholesale_min_qty: 10,
        gradual_wholesale_enabled: false,
        gradual_tiers_count: 2,
        tier_1_name: "Varejo",
        tier_2_name: "Atacarejo",
        tier_3_name: "Atacado Pequeno",
        tier_4_name: "Atacado Grande",
        tier_1_enabled: true,
        tier_2_enabled: false,
        tier_3_enabled: false,
        tier_4_enabled: false,
        show_price_tiers: true,
        show_savings_indicators: true,
        show_next_tier_hint: true,
      };

      const { data, error: createError } = await supabase
        .from("store_price_models")
        .insert(defaultModel)
        .select()
        .single();

      if (createError) throw createError;

      setPriceModel(data);
    } catch (err) {
      console.error("Erro ao criar modelo padrão:", err);
      setError(
        err instanceof Error ? err.message : "Erro ao criar modelo padrão"
      );
    }
  };

  // Atualizar modelo de preço
  const updatePriceModel = async (updates: Partial<StorePriceModel>) => {
    if (!priceModel?.id) return;

    try {
      setError(null);

      const { data, error: updateError } = await supabase
        .from("store_price_models")
        .update(updates)
        .eq("id", priceModel.id)
        .select()
        .single();

      if (updateError) throw updateError;

      setPriceModel(data);
      return data;
    } catch (err) {
      console.error("Erro ao atualizar modelo de preço:", err);
      setError(err instanceof Error ? err.message : "Erro ao atualizar modelo");
      throw err;
    }
  };

  // Mudar modelo de preço
  const changePriceModel = async (newModel: PriceModelType) => {
    if (!priceModel) return;

    const updates: Partial<StorePriceModel> = {
      price_model: newModel,
    };

    // Configurações específicas por modelo
    switch (newModel) {
      case "retail_only":
        updates.simple_wholesale_enabled = false;
        updates.gradual_wholesale_enabled = false;
        updates.tier_1_enabled = true;
        updates.tier_2_enabled = false;
        updates.tier_3_enabled = false;
        updates.tier_4_enabled = false;
        break;

      case "simple_wholesale":
        updates.simple_wholesale_enabled = true;
        updates.gradual_wholesale_enabled = false;
        updates.tier_1_enabled = true;
        updates.tier_2_enabled = true;
        updates.tier_3_enabled = false;
        updates.tier_4_enabled = false;
        break;

      case "gradual_wholesale":
        updates.simple_wholesale_enabled = false;
        updates.gradual_wholesale_enabled = true;
        updates.tier_1_enabled = true;
        updates.tier_2_enabled = true;
        updates.tier_3_enabled = true;
        updates.tier_4_enabled = true;
        break;
    }

    return await updatePriceModel(updates);
  };

  // Converter para configurações de interface
  const getSettings = (): PriceModelSettings | null => {
    if (!priceModel) return null;

    return {
      selectedModel: priceModel.price_model,
      simpleWholesale: {
        enabled: priceModel.simple_wholesale_enabled,
        name: priceModel.simple_wholesale_name,
        minQuantity: priceModel.simple_wholesale_min_qty,
      },
      gradualWholesale: {
        enabled: priceModel.gradual_wholesale_enabled,
        tiersCount: priceModel.gradual_tiers_count,
        tiers: {
          1: {
            name: priceModel.tier_1_name,
            enabled: priceModel.tier_1_enabled,
            defaultMinQty: 1,
          },
          2: {
            name: priceModel.tier_2_name,
            enabled: priceModel.tier_2_enabled,
            defaultMinQty: 5,
          },
          3: {
            name: priceModel.tier_3_name,
            enabled: priceModel.tier_3_enabled,
            defaultMinQty: 10,
          },
          4: {
            name: priceModel.tier_4_name,
            enabled: priceModel.tier_4_enabled,
            defaultMinQty: 50,
          },
        },
      },
      display: {
        showPriceTiers: priceModel.show_price_tiers,
        showSavingsIndicators: priceModel.show_savings_indicators,
        showNextTierHint: priceModel.show_next_tier_hint,
      },
    };
  };

  // Verificar se modelo está ativo
  const isModelActive = (model: PriceModelType): boolean => {
    if (!priceModel) return false;
    return priceModel.price_model === model;
  };

  // Verificar se nível está habilitado
  const isTierEnabled = (tierOrder: number): boolean => {
    if (!priceModel) return false;

    switch (tierOrder) {
      case 1:
        return priceModel.tier_1_enabled;
      case 2:
        return priceModel.tier_2_enabled;
      case 3:
        return priceModel.tier_3_enabled;
      case 4:
        return priceModel.tier_4_enabled;
      default:
        return false;
    }
  };

  // Buscar dados quando storeId mudar
  useEffect(() => {
    if (storeId) {
      fetchPriceModel();
    }
  }, [storeId]);

  return {
    priceModel,
    loading,
    error,
    updatePriceModel,
    changePriceModel,
    getSettings,
    isModelActive,
    isTierEnabled,
    refetch: fetchPriceModel,
  };
};
