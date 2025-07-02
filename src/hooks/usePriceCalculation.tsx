import { useMemo } from "react";
import { useProductPriceTiers } from "./useProductPriceTiers";
import { useCatalogSettings } from "./useCatalogSettings";

export interface PriceCalculation {
  currentTier: any;
  nextTier?: any;
  price: number;
  savings: {
    amount: number;
    percentage: number;
  };
  nextTierHint?: {
    quantityNeeded: number;
    potentialSavings: number;
  };
}

export const usePriceCalculation = (
  productId: string,
  storeId: string,
  quantity: number,
  retailPrice: number
) => {
  const { tiers, loading } = useProductPriceTiers(productId, storeId);
  const { settings: catalogSettings } = useCatalogSettings(storeId);

  const calculation = useMemo((): PriceCalculation => {
    // Se não for catálogo híbrido ou não há níveis, usar preço de varejo
    if (
      catalogSettings?.catalog_mode !== "hybrid" ||
      loading ||
      tiers.length <= 1
    ) {
      return {
        currentTier: {
          tier_name: "Varejo",
          price: retailPrice,
          min_quantity: 1,
        },
        price: retailPrice,
        savings: { amount: 0, percentage: 0 },
      };
    }

    // Ordenar níveis por quantidade mínima (decrescente) para encontrar o melhor preço
    const sortedTiers = [...tiers]
      .filter((tier) => tier.is_active)
      .sort((a, b) => b.min_quantity - a.min_quantity);

    // Encontrar o nível atual baseado na quantidade
    const currentTier = sortedTiers.find(
      (tier) => quantity >= tier.min_quantity
    );

    if (!currentTier) {
      // Se não encontrou nível, usar varejo
      return {
        currentTier: {
          tier_name: "Varejo",
          price: retailPrice,
          min_quantity: 1,
        },
        price: retailPrice,
        savings: { amount: 0, percentage: 0 },
      };
    }

    // Calcular economia em relação ao varejo
    const savingsAmount = retailPrice - currentTier.price;
    const savingsPercentage = (savingsAmount / retailPrice) * 100;

    // Encontrar próximo nível para dica
    const nextTier = sortedTiers
      .sort((a, b) => a.min_quantity - b.min_quantity)
      .find((tier) => tier.min_quantity > quantity);

    let nextTierHint;
    if (nextTier) {
      const nextTierSavings = retailPrice - nextTier.price;
      nextTierHint = {
        quantityNeeded: nextTier.min_quantity - quantity,
        potentialSavings: nextTierSavings,
      };
    }

    return {
      currentTier,
      nextTier,
      price: currentTier.price,
      savings: {
        amount: savingsAmount,
        percentage: savingsPercentage,
      },
      nextTierHint,
    };
  }, [tiers, loading, quantity, retailPrice, catalogSettings?.catalog_mode]);

  return calculation;
};
