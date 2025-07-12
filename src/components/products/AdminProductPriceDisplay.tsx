import React from "react";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";
import { DollarSign, AlertTriangle } from "lucide-react";

interface AdminProductPriceDisplayProps {
  retailPrice?: number | null;
  wholesalePrice?: number | null;
  minWholesaleQty?: number | null;
  priceTiers?: Array<{
    id: string;
    tier_name: string;
    min_quantity: number;
    price: number;
  }>;
  modelKey: string;
}

const AdminProductPriceDisplay: React.FC<AdminProductPriceDisplayProps> = ({
  retailPrice,
  wholesalePrice,
  minWholesaleQty,
  priceTiers = [],
  modelKey,
}) => {
  return (
    <div className="space-y-1">
      {/* Varejo */}
      {(modelKey === "retail_only" ||
        modelKey === "simple_wholesale" ||
        modelKey === "gradual_wholesale") && (
        <div className="flex items-center gap-2 text-sm">
          <DollarSign className="h-4 w-4 text-green-600" />
          <span className="font-medium">Preço Varejo:</span>
          <span className="text-green-600 font-bold">
            {retailPrice != null ? (
              formatCurrency(retailPrice)
            ) : (
              <Badge variant="destructive">Não definido</Badge>
            )}
          </span>
          {retailPrice === 0 && (
            <Badge variant="destructive">
              <AlertTriangle className="h-3 w-3 mr-1" />
              Zero
            </Badge>
          )}
        </div>
      )}
      {/* Atacado Simples */}
      {(modelKey === "simple_wholesale" || modelKey === "wholesale_only") && (
        <div className="flex items-center gap-2 text-sm">
          <DollarSign className="h-4 w-4 text-orange-600" />
          <span className="font-medium">Preço Atacado:</span>
          <span className="text-orange-600 font-bold">
            {wholesalePrice != null ? (
              formatCurrency(wholesalePrice)
            ) : (
              <Badge variant="destructive">Não definido</Badge>
            )}
          </span>
          {wholesalePrice === 0 && (
            <Badge variant="destructive">
              <AlertTriangle className="h-3 w-3 mr-1" />
              Zero
            </Badge>
          )}
        </div>
      )}
      {/* Quantidade mínima */}
      {(modelKey === "simple_wholesale" || modelKey === "wholesale_only") && (
        <div className="flex items-center gap-2 text-sm">
          <span className="font-medium">Qtd. Mínima Atacado:</span>
          <span className="text-orange-600 font-bold">
            {minWholesaleQty != null ? (
              minWholesaleQty
            ) : (
              <Badge variant="destructive">Não definido</Badge>
            )}
          </span>
        </div>
      )}
      {/* Níveis de preço gradativo */}
      {modelKey === "gradual_wholesale" && priceTiers.length > 0 && (
        <div className="mt-1">
          <span className="text-xs text-blue-700 font-semibold">
            Níveis de Preço:
          </span>
          <div className="grid grid-cols-1 gap-1 mt-1">
            {priceTiers.map((tier) => (
              <div key={tier.id} className="flex items-center gap-2 text-xs">
                <span className="font-medium">{tier.tier_name}:</span>
                <span>{tier.min_quantity}+ un.</span>
                <span className="text-blue-700 font-bold">
                  {formatCurrency(tier.price)}
                </span>
                {tier.price === 0 && (
                  <Badge variant="destructive">
                    <AlertTriangle className="h-3 w-3 mr-1" />
                    Zero
                  </Badge>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminProductPriceDisplay;
