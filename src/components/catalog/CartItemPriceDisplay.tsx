import React from "react";
import { Badge } from "../ui/badge";
import { TrendingDown, ArrowUp, Info } from "lucide-react";
import { useCartPriceCalculation } from "@/hooks/useCartPriceCalculation";
import { useStorePriceModel } from "@/hooks/useStorePriceModel";

interface CartItemPriceDisplayProps {
  item: any;
  className?: string;
}

const CartItemPriceDisplay: React.FC<CartItemPriceDisplayProps> = ({
  item,
  className = "",
}) => {
  const priceCalculation = useCartPriceCalculation(item);
  const product = item.product;
  const quantity = item.quantity;

  // Debug logs para entender o que está acontecendo
  console.log("🔍 CartItemPriceDisplay - Debug completo:", {
    product: {
      id: product.id,
      name: product.name,
      store_id: product.store_id,
      retail_price: product.retail_price,
      wholesale_price: product.wholesale_price,
      min_wholesale_qty: product.min_wholesale_qty,
    },
    quantity,
    priceCalculation: {
      priceModel: priceCalculation.priceModel,
      total: priceCalculation.total,
      currentTier: priceCalculation.currentTier,
      formattedTotal: priceCalculation.formattedTotal,
    },
  });

  const {
    total,
    savings,
    formattedTotal,
    formattedSavings,
    currentTier,
    nextTierHint,
  } = priceCalculation;

  return (
    <div className={`space-y-2 ${className}`}>
      {/* Preço unitário */}
      <div className="flex items-center justify-between text-sm">
        <span className="text-gray-600">Preço unitário:</span>
        <div className="flex items-center gap-2">
          {priceCalculation.priceModel === "wholesale_only" ? (
            product.wholesale_price && product.wholesale_price > 0 ? (
              <span className="font-semibold text-green-700">
                R$ {product.wholesale_price.toFixed(2).replace(".", ",")}
              </span>
            ) : (
              <span className="text-red-500 text-xs">
                Preço não configurado
              </span>
            )
          ) : (
            <span className="font-semibold text-gray-900">
              R${" "}
              {currentTier
                ? currentTier.price.toFixed(2).replace(".", ",")
                : (total / quantity).toFixed(2).replace(".", ",")}
            </span>
          )}

          {/* Indicador de tier atual */}
          {currentTier && (
            <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
              {currentTier.tier_name}
            </span>
          )}
        </div>
      </div>

      {/* Total */}
      <div className="flex items-center justify-between text-sm font-medium">
        <span>Total:</span>
        <span className="text-lg font-bold text-gray-900">
          {formattedTotal}
        </span>
      </div>

      {/* Economia */}
      {savings > 0 && (
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">Economia:</span>
          <span className="text-green-600 font-semibold">
            {formattedSavings}
          </span>
        </div>
      )}

      {/* Dica do próximo tier */}
      {nextTierHint && (
        <div className="text-xs text-blue-600 bg-blue-50 p-2 rounded">
          Adicione mais {nextTierHint.quantityNeeded} unidade(s) para economizar
          R$ {nextTierHint.potentialSavings.toFixed(2).replace(".", ",")}
        </div>
      )}
    </div>
  );
};

export default CartItemPriceDisplay;
