import { useMemo } from "react";
import { useStorePriceModel } from "@/hooks/useStorePriceModel";
import { ProductPriceTier } from "@/types/product";

interface PriceCalculationOptions {
  product_id: string;
  retail_price: number;
  wholesale_price?: number;
  min_wholesale_qty?: number;
  quantity: number;
  price_tiers?: ProductPriceTier[];
  enable_gradual_wholesale?: boolean; // Toggle para ativar/desativar atacado gradativo
}

interface PriceCalculationResult {
  unitPrice: number;
  total: number;
  savings: number;
  appliedTier: ProductPriceTier | null;
  isWholesale: boolean;
  formattedUnitPrice: string;
  formattedTotal: string;
  formattedSavings: string;
  currentTier: {
    tier_name: string;
    price: number;
  };
  nextTierHint?: {
    quantityNeeded: number;
    potentialSavings: number;
  };
  price: number;
  percentage: number;
}

export const usePriceCalculation = (
  storeId: string,
  options: PriceCalculationOptions
): PriceCalculationResult => {
  const { priceModel } = useStorePriceModel(storeId);

  return useMemo(() => {
    const {
      retail_price,
      wholesale_price,
      min_wholesale_qty,
      quantity,
      price_tiers,
      enable_gradual_wholesale,
    } = options;

    // Calcular preço baseado na quantidade e configurações
    let finalPrice = retail_price;
    let appliedTier: ProductPriceTier | null = null;
    let savings = 0;
    let currentTierName = "Varejo";
    let nextTierHint:
      | { quantityNeeded: number; potentialSavings: number }
      | undefined;

    // Verificar níveis de preço personalizados primeiro (só se atacado gradativo estiver ativo)
    if (enable_gradual_wholesale && price_tiers && price_tiers.length > 0) {
      const applicableTiers = price_tiers
        .filter((tier) => tier.is_active && quantity >= tier.min_quantity)
        .sort((a, b) => b.min_quantity - a.min_quantity);

      if (applicableTiers.length > 0) {
        appliedTier = applicableTiers[0];
        finalPrice = appliedTier.price;
        currentTierName = appliedTier.tier_name || "Nível Personalizado";
        savings = (retail_price - finalPrice) * quantity;
      } else {
        // Verificar próximo nível disponível
        const nextTiers = price_tiers
          .filter((tier) => tier.is_active && quantity < tier.min_quantity)
          .sort((a, b) => a.min_quantity - b.min_quantity);

        if (nextTiers.length > 0) {
          const nextTier = nextTiers[0];
          nextTierHint = {
            quantityNeeded: nextTier.min_quantity - quantity,
            potentialSavings: retail_price - nextTier.price,
          };
        }
      }
    }
    // Se não há tiers personalizados ou atacado gradativo está desativado, verificar atacado simples
    else if (
      !enable_gradual_wholesale && // Só atacado simples se gradativo estiver desativado
      priceModel?.simple_wholesale_enabled &&
      wholesale_price &&
      quantity >= (min_wholesale_qty || 1)
    ) {
      finalPrice = wholesale_price;
      currentTierName = priceModel.simple_wholesale_name || "Atacado";
      savings = (retail_price - wholesale_price) * quantity;
    } else if (
      !enable_gradual_wholesale && // Só atacado simples se gradativo estiver desativado
      priceModel?.simple_wholesale_enabled &&
      wholesale_price &&
      quantity < (min_wholesale_qty || 1)
    ) {
      nextTierHint = {
        quantityNeeded: (min_wholesale_qty || 1) - quantity,
        potentialSavings: retail_price - wholesale_price,
      };
    }

    const total = finalPrice * quantity;
    const savingsPercentage =
      retail_price > 0 ? ((retail_price - finalPrice) / retail_price) * 100 : 0;

    return {
      unitPrice: finalPrice,
      total,
      savings,
      appliedTier,
      isWholesale: finalPrice < retail_price,
      formattedUnitPrice: new Intl.NumberFormat("pt-BR", {
        style: "currency",
        currency: "BRL",
      }).format(finalPrice),
      formattedTotal: new Intl.NumberFormat("pt-BR", {
        style: "currency",
        currency: "BRL",
      }).format(total),
      formattedSavings: new Intl.NumberFormat("pt-BR", {
        style: "currency",
        currency: "BRL",
      }).format(savings),
      currentTier: {
        tier_name: currentTierName,
        price: finalPrice,
      },
      nextTierHint,
      price: finalPrice,
      percentage: savingsPercentage,
    };
  }, [options, priceModel, storeId]);
};
