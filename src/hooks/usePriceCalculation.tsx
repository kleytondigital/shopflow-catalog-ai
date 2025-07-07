
import { useMemo } from 'react';
import { useStorePriceModel } from '@/hooks/useStorePriceModel';
import { ProductPriceTier } from '@/types/product';

interface PriceCalculationOptions {
  product_id: string;
  retail_price: number;
  wholesale_price?: number;
  min_wholesale_qty?: number;
  quantity: number;
  price_tiers?: ProductPriceTier[];
}

export const usePriceCalculation = (storeId: string, options: PriceCalculationOptions) => {
  const { priceModel } = useStorePriceModel(storeId);

  return useMemo(() => {
    const { retail_price, wholesale_price, min_wholesale_qty, quantity, price_tiers } = options;

    // Calcular preço baseado na quantidade e configurações
    let finalPrice = retail_price;
    let appliedTier: ProductPriceTier | null = null;
    let savings = 0;

    // Verificar níveis de preço personalizados primeiro
    if (price_tiers && price_tiers.length > 0) {
      const applicableTiers = price_tiers
        .filter(tier => tier.is_active && quantity >= tier.min_quantity)
        .sort((a, b) => b.min_quantity - a.min_quantity);

      if (applicableTiers.length > 0) {
        appliedTier = applicableTiers[0];
        finalPrice = appliedTier.price;
        savings = (retail_price - finalPrice) * quantity;
      }
    }
    // Se não há tiers personalizados, verificar atacado simples
    else if (
      priceModel?.simple_wholesale_enabled &&
      wholesale_price &&
      quantity >= (min_wholesale_qty || 1)
    ) {
      finalPrice = wholesale_price;
      savings = (retail_price - wholesale_price) * quantity;
    }

    const total = finalPrice * quantity;
    const retailTotal = retail_price * quantity;

    return {
      unitPrice: finalPrice,
      total,
      savings,
      appliedTier,
      isWholesale: finalPrice < retail_price,
      formattedUnitPrice: new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
      }).format(finalPrice),
      formattedTotal: new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
      }).format(total),
      formattedSavings: new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
      }).format(savings),
    };
  }, [options, priceModel]);
};
