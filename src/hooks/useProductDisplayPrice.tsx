
import { useMemo } from "react";
import { useStorePriceModel } from "@/hooks/useStorePriceModel";
import { Product } from "@/types/product";

interface UseProductDisplayPriceProps {
  product: Product;
  catalogType?: "retail" | "wholesale";
  quantity?: number;
}

export const useProductDisplayPrice = ({
  product,
  catalogType = "retail",
  quantity = 1,
}: UseProductDisplayPriceProps) => {
  const { priceModel } = useStorePriceModel(product.store_id);

  return useMemo(() => {
    const modelKey = priceModel?.price_model || "retail_only";
    
    // Para wholesale_only, sempre usar wholesale_price
    if (modelKey === "wholesale_only") {
      const displayPrice = product.wholesale_price || 0;
      const minQuantity = product.min_wholesale_qty || 1;
      
      return {
        displayPrice,
        originalPrice: displayPrice,
        minQuantity,
        isWholesaleOnly: true,
        shouldShowRetailPrice: false,
        shouldShowWholesaleInfo: true,
        modelKey,
      };
    }

    // Para retail_only, sempre usar retail_price
    if (modelKey === "retail_only") {
      const displayPrice = product.retail_price || 0;
      
      return {
        displayPrice,
        originalPrice: displayPrice,
        minQuantity: 1,
        isWholesaleOnly: false,
        shouldShowRetailPrice: true,
        shouldShowWholesaleInfo: false,
        modelKey,
      };
    }

    // Para modelos mistos (simple_wholesale, gradual_wholesale)
    const retailPrice = product.retail_price || 0;
    const wholesalePrice = product.wholesale_price || retailPrice;
    const minWholesaleQty = product.min_wholesale_qty || 1;

    let displayPrice = retailPrice;
    let minQuantity = 1;

    // Se catálogo é atacado ou quantidade atinge mínimo
    if (catalogType === "wholesale" || quantity >= minWholesaleQty) {
      displayPrice = wholesalePrice;
      minQuantity = minWholesaleQty;
    }

    const shouldShowRetailPrice = retailPrice > 0;
    const shouldShowWholesaleInfo = wholesalePrice > 0 && wholesalePrice !== retailPrice;

    return {
      displayPrice,
      originalPrice: retailPrice,
      minQuantity,
      isWholesaleOnly: false,
      shouldShowRetailPrice,
      shouldShowWholesaleInfo,
      modelKey,
      retailPrice,
      wholesalePrice,
      minWholesaleQty,
    };
  }, [product, catalogType, quantity, priceModel]);
};
