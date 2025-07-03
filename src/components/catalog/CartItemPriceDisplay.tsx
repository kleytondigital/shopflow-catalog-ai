import React from "react";
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
  // Função para calcular preço baseado na quantidade
  const calculatePriceInfo = () => {
    const product = item.product;
    const quantity = item.quantity;
    const originalPrice = item.originalPrice || product.retail_price;

    console.log("💰 CartItemPriceDisplay - Calculando preços:", {
      productName: product.name,
      quantity,
      originalPrice,
      wholesalePrice: product.wholesale_price,
      minWholesaleQty: product.min_wholesale_qty,
    });

    // Verificar se tem atacado simples configurado
    if (product.wholesale_price && product.min_wholesale_qty) {
      const hasWholesaleQty = quantity >= product.min_wholesale_qty;
      const currentPrice = hasWholesaleQty
        ? product.wholesale_price
        : originalPrice;
      const savingsAmount = hasWholesaleQty
        ? originalPrice - product.wholesale_price
        : 0;
      const savingsPercentage = hasWholesaleQty
        ? (savingsAmount / originalPrice) * 100
        : 0;

      let nextTierHint = null;
      if (!hasWholesaleQty) {
        const qtyNeeded = product.min_wholesale_qty - quantity;
        const potentialSavings = originalPrice - product.wholesale_price;
        nextTierHint = {
          quantityNeeded: qtyNeeded,
          potentialSavings,
          nextTierName: "Atacado",
        };
      }

      return {
        currentTier: {
          tier_name: hasWholesaleQty ? "Atacado" : "Varejo",
          price: currentPrice,
        },
        price: currentPrice,
        savings: { amount: savingsAmount, percentage: savingsPercentage },
        nextTierHint,
      };
    }

    // Caso não tenha atacado configurado
    return {
      currentTier: {
        tier_name: "Varejo",
        price: originalPrice,
      },
      price: item.price || originalPrice,
      savings: { amount: 0, percentage: 0 },
      nextTierHint: null,
    };
  };

  const calculation = calculatePriceInfo();
  const totalPrice = calculation.price * item.quantity;
  const totalRetailPrice = item.originalPrice * item.quantity;
  const totalSavings = totalRetailPrice - totalPrice;

  console.log("📊 CartItemPriceDisplay - Resultado:", {
    calculation,
    totalPrice,
    totalRetailPrice,
    totalSavings,
  });

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
          <span className="text-green-700 font-medium">Economia total:</span>
          <span className="text-green-700 font-bold">
            R$ {totalSavings.toFixed(2).replace(".", ",")}
          </span>
        </div>
      )}

      {/* Dica para próximo nível - INCENTIVO PRINCIPAL */}
      {calculation.nextTierHint && (
        <div className="flex items-center gap-1 text-xs text-blue-600 bg-blue-50 p-2 rounded border border-blue-200">
          <ArrowUp className="h-3 w-3 flex-shrink-0" />
          <span className="flex-1">
            <strong>💡 Incentivo:</strong> Adicione{" "}
            <strong className="text-blue-800">
              +{calculation.nextTierHint.quantityNeeded}
            </strong>{" "}
            unidades para ativar o{" "}
            <strong>{calculation.nextTierHint.nextTierName}</strong> e
            economizar{" "}
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

      {/* Nível atual */}
      <div className="flex items-center gap-1 text-xs text-gray-500">
        <Info className="h-3 w-3" />
        <span>
          Nível atual: <strong>{calculation.currentTier.tier_name}</strong>
        </span>
      </div>
    </div>
  );
};

export default CartItemPriceDisplay;
