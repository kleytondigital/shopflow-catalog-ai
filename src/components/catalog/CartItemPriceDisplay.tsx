import React from "react";
import { useCartPriceCalculation } from "../../hooks/useCartPriceCalculation";
import { Badge } from "../ui/badge";
import { TrendingDown, ArrowUp, Info } from "lucide-react";

interface CartItemPriceDisplayProps {
  item: any;
  className?: string;
}

const CartItemPriceDisplay: React.FC<CartItemPriceDisplayProps> = ({
  item,
  className = "",
}) => {
  const calculation = useCartPriceCalculation(item);

  const totalPrice = calculation.price * item.quantity;
  const totalRetailPrice = item.originalPrice * item.quantity;
  const totalSavings = totalRetailPrice - totalPrice;

  return (
    <div className={`space-y-1 ${className}`}>
      {/* Preço unitário atual */}
      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center gap-1">
          <span className="text-gray-600">Preço:</span>
          {calculation.savings.percentage > 0 && (
            <Badge
              variant="secondary"
              className="text-xs bg-green-100 text-green-700"
            >
              <TrendingDown className="h-3 w-3 mr-1" />-
              {calculation.savings.percentage.toFixed(0)}%
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-1">
          {calculation.savings.percentage > 0 && (
            <span className="text-xs text-gray-400 line-through">
              R$ {item.originalPrice.toFixed(2).replace(".", ",")}
            </span>
          )}
          <span className="font-semibold text-green-700">
            R$ {calculation.price.toFixed(2).replace(".", ",")}
          </span>
        </div>
      </div>

      {/* Total */}
      <div className="flex items-center justify-between">
        <span className="text-sm text-gray-600">
          Total ({item.quantity} un):
        </span>
        <div className="flex items-center gap-1">
          {totalSavings > 0 && (
            <span className="text-xs text-gray-400 line-through">
              R$ {totalRetailPrice.toFixed(2).replace(".", ",")}
            </span>
          )}
          <span className="font-bold text-green-700">
            R$ {totalPrice.toFixed(2).replace(".", ",")}
          </span>
        </div>
      </div>

      {/* Economia total */}
      {totalSavings > 0 && (
        <div className="flex items-center justify-between text-xs bg-green-50 p-1 rounded">
          <span className="text-green-700 font-medium">Economia:</span>
          <span className="text-green-700 font-bold">
            R$ {totalSavings.toFixed(2).replace(".", ",")}
          </span>
        </div>
      )}

      {/* Dica para próximo nível */}
      {calculation.nextTierHint && (
        <div className="flex items-center gap-1 text-xs text-blue-600 bg-blue-50 p-1 rounded">
          <ArrowUp className="h-3 w-3" />
          <span>
            +{calculation.nextTierHint.quantityNeeded} un para economizar R${" "}
            {calculation.nextTierHint.potentialSavings
              .toFixed(2)
              .replace(".", ",")}
            /un
          </span>
        </div>
      )}

      {/* Nível atual */}
      {calculation.currentTier.tier_name !== "Varejo" && (
        <div className="flex items-center gap-1 text-xs text-gray-500">
          <Info className="h-3 w-3" />
          <span>{calculation.currentTier.tier_name}</span>
        </div>
      )}
    </div>
  );
};

export default CartItemPriceDisplay;
