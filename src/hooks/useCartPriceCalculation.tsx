import { useMemo } from "react";
import { useProductPriceTiers } from "./useProductPriceTiers";
import { useCatalogSettings } from "./useCatalogSettings";
import { CartItem } from "./useCart";

export interface CartItemPriceCalculation {
  item: CartItem;
  currentTier: any;
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

export const useCartPriceCalculation = (item: CartItem) => {
  const { tiers, loading } = useProductPriceTiers(
    item.product.id,
    item.product.store_id || ""
  );
  const { settings: catalogSettings } = useCatalogSettings(
    item.product.store_id
  );

  const calculation = useMemo((): CartItemPriceCalculation => {
    // Se não for catálogo híbrido ou não há níveis, usar preço atual do item
    if (
      catalogSettings?.catalog_mode !== "hybrid" ||
      loading ||
      tiers.length <= 1
    ) {
      return {
        item,
        currentTier: {
          tier_name: "Varejo",
          price: item.originalPrice,
          min_quantity: 1,
        },
        price: item.price,
        savings: { amount: 0, percentage: 0 },
      };
    }

    // Ordenar níveis por quantidade mínima (decrescente) para encontrar o melhor preço
    const sortedTiers = [...tiers]
      .filter((tier) => tier.is_active)
      .sort((a, b) => b.min_quantity - a.min_quantity);

    // Encontrar o nível atual baseado na quantidade
    const currentTier = sortedTiers.find(
      (tier) => item.quantity >= tier.min_quantity
    );

    if (!currentTier) {
      // Se não encontrou nível, usar varejo
      return {
        item,
        currentTier: {
          tier_name: "Varejo",
          price: item.originalPrice,
          min_quantity: 1,
        },
        price: item.originalPrice,
        savings: { amount: 0, percentage: 0 },
      };
    }

    // Calcular economia em relação ao varejo
    const savingsAmount = item.originalPrice - currentTier.price;
    const savingsPercentage = (savingsAmount / item.originalPrice) * 100;

    // Encontrar próximo nível para dica
    const nextTier = sortedTiers
      .sort((a, b) => a.min_quantity - b.min_quantity)
      .find((tier) => tier.min_quantity > item.quantity);

    let nextTierHint;
    if (nextTier) {
      const nextTierSavings = item.originalPrice - nextTier.price;
      nextTierHint = {
        quantityNeeded: nextTier.min_quantity - item.quantity,
        potentialSavings: nextTierSavings,
      };
    }

    return {
      item,
      currentTier,
      price: currentTier.price,
      savings: {
        amount: savingsAmount,
        percentage: savingsPercentage,
      },
      nextTierHint,
    };
  }, [tiers, loading, item, catalogSettings?.catalog_mode]);

  return calculation;
};
