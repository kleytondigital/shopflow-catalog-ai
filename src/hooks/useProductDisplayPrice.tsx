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
  const { priceModel, loading } = useStorePriceModel(product.store_id);

  return useMemo(() => {
    const modelKey = priceModel?.price_model || "retail_only";

    // Se ainda está carregando o modelo de preço, usar fallback baseado no catalogType
    if (loading) {
      // Para catálogo atacado, usar preço de atacado como fallback
      if (catalogType === "wholesale") {
        const fallbackPrice = product.wholesale_price || 0;
        return {
          displayPrice: fallbackPrice,
          originalPrice: fallbackPrice,
          minQuantity: product.min_wholesale_qty || 1,
          isWholesaleOnly: true,
          shouldShowRetailPrice: false,
          shouldShowWholesaleInfo: true,
          modelKey: "wholesale_only",
          retailPrice: product.retail_price || 0,
          wholesalePrice: product.wholesale_price || 0,
          minWholesaleQty: product.min_wholesale_qty || 1,
          isLoading: true,
        };
      }

      // Para catálogo varejo, usar preço de varejo como fallback
      const fallbackPrice = product.retail_price || 0;
      return {
        displayPrice: fallbackPrice,
        originalPrice: fallbackPrice,
        minQuantity: 1,
        isWholesaleOnly: false,
        shouldShowRetailPrice: true,
        shouldShowWholesaleInfo: false,
        modelKey: "retail_only",
        retailPrice: product.retail_price || 0,
        wholesalePrice: product.wholesale_price || 0,
        minWholesaleQty: product.min_wholesale_qty || 1,
        isLoading: true,
      };
    }

    // Para catálogo atacado, sempre usar wholesale_price como fallback
    if (catalogType === "wholesale") {
      // Para catálogo atacado, SEMPRE usar preço de atacado, mesmo que seja 0
      const displayPrice = product.wholesale_price || 0;
      const minQuantity = product.min_wholesale_qty || 1;

      console.log(
        "🎯 [useProductDisplayPrice] Catálogo ATACADO - Usando preço de atacado:",
        {
          productName: product.name,
          wholesalePrice: product.wholesale_price,
          retailPrice: product.retail_price,
          displayPrice,
          catalogType,
        }
      );

      return {
        displayPrice,
        originalPrice: displayPrice,
        minQuantity,
        isWholesaleOnly: true,
        shouldShowRetailPrice: false,
        shouldShowWholesaleInfo: true,
        modelKey: "wholesale_only",
        retailPrice: product.retail_price || 0,
        wholesalePrice: product.wholesale_price || 0,
        minWholesaleQty: minQuantity,
        isLoading: false,
      };
    }

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
        isLoading: false,
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
        isLoading: false,
      };
    }

    // Para modelos mistos (simple_wholesale, gradual_wholesale)
    const retailPrice = product.retail_price || 0;
    const wholesalePrice = product.wholesale_price || retailPrice;
    const minWholesaleQty = product.min_wholesale_qty || 1;

    let displayPrice = retailPrice;
    let minQuantity = 1;

    // Se catálogo é atacado ou quantidade atinge mínimo (para modelos mistos)
    if (
      (catalogType as string) === "wholesale" ||
      quantity >= minWholesaleQty
    ) {
      displayPrice = wholesalePrice;
      minQuantity = minWholesaleQty;
    }

    const shouldShowRetailPrice = retailPrice > 0;
    const shouldShowWholesaleInfo =
      wholesalePrice > 0 && wholesalePrice !== retailPrice;

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
      isLoading: false,
    };
  }, [product, catalogType, quantity, priceModel]);
};
