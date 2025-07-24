
import React from "react";
import { Badge } from "../ui/badge";
import { TrendingDown, ArrowUp, Info } from "lucide-react";
import { usePriceCalculation } from "@/hooks/usePriceCalculation";
import { useProductPriceTiers } from "@/hooks/useProductPriceTiers";
import { useStorePriceModel } from "@/hooks/useStorePriceModel";
import { useCatalogSettings } from "@/hooks/useCatalogSettings";

interface CartItemPriceDisplayProps {
  item: any;
  className?: string;
}

const CartItemPriceDisplay: React.FC<CartItemPriceDisplayProps> = ({
  item,
  className = "",
}) => {
  const product = item.product;
  const quantity = item.quantity;
  const originalPrice = item.originalPrice || product.retail_price;
  
  // Buscar configurações do catálogo para conectar com o modo de preços
  const { settings } = useCatalogSettings();
  const catalogMode = settings?.catalog_mode || 'separated';
  
  // Buscar tiers do produto
  const { tiers: priceTiers } = useProductPriceTiers(product.id, {
    wholesale_price: product.wholesale_price,
    min_wholesale_qty: product.min_wholesale_qty,
    retail_price: product.retail_price,
  });
  
  // Usar hook padronizado
  const calculation = usePriceCalculation(product.store_id, {
    product_id: product.id,
    retail_price: product.retail_price,
    wholesale_price: product.wholesale_price,
    min_wholesale_qty: product.min_wholesale_qty,
    quantity,
    price_tiers: product.enable_gradual_wholesale ? priceTiers : [],
    enable_gradual_wholesale: product.enable_gradual_wholesale,
  });

  const { priceModel, loading } = useStorePriceModel(product.store_id);
  const modelKey: import("@/types/price-models").PriceModelType =
    product.price_model || priceModel?.price_model || "retail_only";

  if (loading) {
    return <div className={className}>Carregando preço...</div>;
  }

  // Calcular preço baseado no modo do catálogo e modelo da loja
  const getDisplayPrice = () => {
    switch (modelKey) {
      case "wholesale_only":
        return item.price; // Sempre usar preço do item para wholesale_only
      case "gradual_wholesale":
        return calculation.price; // Usar cálculo gradativo
      case "simple_wholesale":
        return calculation.price; // Usar cálculo simples
      default:
        return catalogMode === 'toggle' || catalogMode === 'hybrid' 
          ? calculation.price 
          : product.retail_price;
    }
  };

  const displayPrice = getDisplayPrice();
  const totalPrice = displayPrice * quantity;
  const totalRetailPrice = originalPrice * quantity;
  const totalSavings = totalRetailPrice - totalPrice;

  // Determinar nome do nível baseado no modelo
  const getTierDisplayName = () => {
    if (modelKey === "wholesale_only") return "Atacado";
    if (modelKey === "retail_only") return "Varejo";
    return calculation.currentTier.tier_name;
  };

  return (
    <div className={`space-y-1 ${className}`}>
      {/* Preço unitário atual - sem "Preço final" inadequado */}
      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center gap-1">
          <span className="text-gray-600">Preço unitário:</span>
        </div>
        <div className="flex items-center gap-1">
          {totalSavings > 0 && modelKey !== "wholesale_only" && (
            <span className="text-xs text-gray-400 line-through">
              R$ {originalPrice.toFixed(2).replace(".", ",")}
            </span>
          )}
          <span className={`font-semibold ${
            modelKey === "wholesale_only" ? "text-orange-700" : 
            totalSavings > 0 ? "text-green-700" : "text-gray-900"
          }`}>
            R$ {displayPrice.toFixed(2).replace(".", ",")}
          </span>
        </div>
      </div>

      {/* Total */}
      <div className="flex items-center justify-between">
        <span className="text-sm text-gray-600">Total ({quantity} un):</span>
        <div className="flex items-center gap-1">
          {totalSavings > 0 && modelKey !== "wholesale_only" && (
            <span className="text-xs text-gray-400 line-through">
              R$ {totalRetailPrice.toFixed(2).replace(".", ",")}
            </span>
          )}
          <span className={`font-bold ${
            modelKey === "wholesale_only" ? "text-orange-700" : 
            totalSavings > 0 ? "text-green-700" : "text-gray-900"
          }`}>
            R$ {totalPrice.toFixed(2).replace(".", ",")}
          </span>
        </div>
      </div>

      {/* Economia total - apenas se aplicável */}
      {totalSavings > 0 && modelKey !== "wholesale_only" && (
        <div className="flex items-center justify-between text-xs bg-green-50 p-1 rounded">
          <span className="text-green-700 font-medium">Economia total:</span>
          <span className="text-green-700 font-bold">
            R$ {totalSavings.toFixed(2).replace(".", ",")}
          </span>
        </div>
      )}

      {/* Incentivos baseados no modelo de preços */}
      {modelKey !== "wholesale_only" && calculation.nextTierHint && (
        <div className="flex items-center gap-1 text-xs text-blue-600 bg-blue-50 p-2 rounded border border-blue-200">
          <ArrowUp className="h-3 w-3 flex-shrink-0" />
          <span className="flex-1">
            <strong>💡 Incentivo:</strong> Adicione{" "}
            <strong className="text-blue-800">
              +{calculation.nextTierHint.quantityNeeded}
            </strong>{" "}
            unidades para ativar{" "}
            {modelKey === "simple_wholesale" ? "o atacado" : "o próximo nível"}{" "}
            e economizar{" "}
            <strong className="text-green-600">
              R${" "}
              {calculation.nextTierHint.potentialSavings
                .toFixed(2)
                .replace(".", ",")}
            </strong>{" "}
            por unidade!
          </span>
        </div>
      )}

      {/* Nível atual - baseado no modelo real */}
      <div className="flex items-center gap-1 text-xs text-gray-500">
        <Info className="h-3 w-3" />
        <span>
          Nível atual: <strong>{getTierDisplayName()}</strong>
          {modelKey === "wholesale_only" && (
            <span className="ml-1 text-orange-600">(Atacado Exclusivo)</span>
          )}
        </span>
      </div>
    </div>
  );
};

export default CartItemPriceDisplay;
