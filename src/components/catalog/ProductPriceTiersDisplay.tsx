
import React from "react";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";

interface PriceTier {
  id: string;
  tier_name: string;
  min_quantity: number;
  price: number;
  is_active: boolean;
}

interface ProductPriceTiersDisplayProps {
  tiers: PriceTier[];
  currentQuantity?: number;
}

const ProductPriceTiersDisplay: React.FC<ProductPriceTiersDisplayProps> = ({
  tiers,
  currentQuantity = 1,
}) => {
  const activeTiers = tiers.filter(tier => tier.is_active);
  
  if (activeTiers.length === 0) return null;

  return (
    <div className="space-y-2">
      <h4 className="font-medium text-sm">Preços por Quantidade:</h4>
      <div className="space-y-1">
        {activeTiers.map((tier) => (
          <div
            key={tier.id}
            className={`flex justify-between items-center p-2 rounded-md text-sm ${
              currentQuantity >= tier.min_quantity
                ? "bg-green-50 border border-green-200"
                : "bg-gray-50"
            }`}
          >
            <span>
              {tier.tier_name} ({tier.min_quantity}+ un.)
            </span>
            <span className="font-semibold">
              {formatCurrency(tier.price)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProductPriceTiersDisplay;
