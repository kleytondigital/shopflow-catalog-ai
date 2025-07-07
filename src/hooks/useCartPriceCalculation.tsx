
import { useMemo } from 'react';
import { useStorePriceModel } from '@/hooks/useStorePriceModel';

interface CartItem {
  product_id: string;
  quantity: number;
  retail_price: number;
  wholesale_price?: number;
  min_wholesale_qty?: number;
}

export const useCartPriceCalculation = (storeId: string, items: CartItem[]) => {
  const { priceModel } = useStorePriceModel(storeId);

  return useMemo(() => {
    let total = 0;
    let savings = 0;

    items.forEach(item => {
      const unitPrice = item.retail_price;
      
      // Verificar se qualifica para preço de atacado
      if (
        priceModel?.simple_wholesale_enabled &&
        item.wholesale_price && 
        item.quantity >= (item.min_wholesale_qty || 1)
      ) {
        const wholesaleTotal = item.wholesale_price * item.quantity;
        const retailTotal = item.retail_price * item.quantity;
        total += wholesaleTotal;
        savings += (retailTotal - wholesaleTotal);
      } else {
        total += unitPrice * item.quantity;
      }
    });

    return {
      total,
      savings,
      formattedTotal: new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
      }).format(total),
      formattedSavings: new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
      }).format(savings),
    };
  }, [items, priceModel]);
};
