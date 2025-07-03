import { useMemo } from "react";
import { useProductPriceTiers } from "./useProductPriceTiers";
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
    nextTierName: string;
  };
}

export const useCartPriceCalculation = (item: CartItem) => {
  const { tiers, loading } = useProductPriceTiers(
    item.product.id,
    item.product.store_id || ""
  );

  const calculation = useMemo((): CartItemPriceCalculation => {
    console.log(`💰 Calculando preços para ${item.product?.name}:`, {
      productId: item.product.id,
      quantity: item.quantity,
      originalPrice: item.originalPrice,
      currentPrice: item.price,
      tiersLoaded: tiers.length,
      tiers: tiers,
    });

    // Se não há níveis configurados, usar preços simples
    if (loading || tiers.length <= 1) {
      console.log("📋 Usando cálculo simples - sem níveis ou carregando");

      // Verificar se tem wholesale_price configurado no produto
      if (item.product.wholesale_price && item.product.min_wholesale_qty) {
        const hasWholesaleQty = item.quantity >= item.product.min_wholesale_qty;
        const currentPrice = hasWholesaleQty
          ? item.product.wholesale_price
          : item.originalPrice;
        const savingsAmount = hasWholesaleQty
          ? item.originalPrice - item.product.wholesale_price
          : 0;
        const savingsPercentage = hasWholesaleQty
          ? (savingsAmount / item.originalPrice) * 100
          : 0;

        let nextTierHint;
        if (!hasWholesaleQty) {
          nextTierHint = {
            quantityNeeded: item.product.min_wholesale_qty - item.quantity,
            potentialSavings: item.originalPrice - item.product.wholesale_price,
            nextTierName: "Atacado",
          };
        }

        return {
          item,
          currentTier: {
            tier_name: hasWholesaleQty ? "Atacado" : "Varejo",
            price: currentPrice,
            min_quantity: hasWholesaleQty ? item.product.min_wholesale_qty : 1,
          },
          price: currentPrice,
          savings: { amount: savingsAmount, percentage: savingsPercentage },
          nextTierHint,
        };
      }

      // Fallback para varejo simples
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

    console.log("🎯 Usando cálculo avançado com níveis:", tiers);

    // Ordenar níveis por quantidade mínima (decrescente) para encontrar o melhor preço
    const sortedTiers = [...tiers]
      .filter((tier) => tier.is_active)
      .sort((a, b) => b.min_quantity - a.min_quantity);

    console.log("📊 Níveis ordenados:", sortedTiers);

    // Encontrar o nível atual baseado na quantidade
    const currentTier = sortedTiers.find(
      (tier) => item.quantity >= tier.min_quantity
    );

    if (!currentTier) {
      console.log("❌ Nenhum nível encontrado para quantidade", item.quantity);
      // Se não encontrou nível, usar o primeiro (menor quantidade)
      const retailTier = sortedTiers[sortedTiers.length - 1] || {
        tier_name: "Varejo",
        price: item.originalPrice,
        min_quantity: 1,
      };

      return {
        item,
        currentTier: retailTier,
        price: retailTier.price,
        savings: { amount: 0, percentage: 0 },
      };
    }

    console.log("✅ Nível atual encontrado:", currentTier);

    // Calcular economia em relação ao varejo (sempre usar originalPrice como base)
    const retailPrice = item.originalPrice;
    const savingsAmount = retailPrice - currentTier.price;
    const savingsPercentage =
      savingsAmount > 0 ? (savingsAmount / retailPrice) * 100 : 0;

    console.log("💸 Cálculo de economia:", {
      retailPrice,
      currentPrice: currentTier.price,
      savingsAmount,
      savingsPercentage,
    });

    // Encontrar próximo nível para dica
    const nextTier = tiers
      .filter((tier) => tier.is_active && tier.min_quantity > item.quantity)
      .sort((a, b) => a.min_quantity - b.min_quantity)[0];

    let nextTierHint;
    if (nextTier) {
      const nextTierSavings = retailPrice - nextTier.price;
      const additionalSavings = nextTierSavings - savingsAmount;

      nextTierHint = {
        quantityNeeded: nextTier.min_quantity - item.quantity,
        potentialSavings:
          additionalSavings > 0 ? additionalSavings : nextTierSavings,
        nextTierName: nextTier.tier_name,
      };

      console.log("🎯 Dica para próximo nível:", nextTierHint);
    }

    const result = {
      item,
      currentTier,
      price: currentTier.price,
      savings: {
        amount: savingsAmount,
        percentage: savingsPercentage,
      },
      nextTierHint,
    };

    console.log("📋 Resultado final do cálculo:", result);
    return result;
  }, [
    tiers,
    loading,
    item.quantity,
    item.originalPrice,
    item.price,
    item.product.id,
  ]);

  return calculation;
};
