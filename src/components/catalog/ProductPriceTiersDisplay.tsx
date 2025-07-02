import React from "react";
import { useProductPriceTiers } from "../../hooks/useProductPriceTiers";
import { useCatalogSettings } from "../../hooks/useCatalogSettings";
import { Badge } from "../ui/badge";
import { Card, CardContent } from "../ui/card";
import { TrendingDown, Info, Package } from "lucide-react";

interface ProductPriceTiersDisplayProps {
  productId: string;
  storeId: string;
  retailPrice: number;
  className?: string;
}

const ProductPriceTiersDisplay: React.FC<ProductPriceTiersDisplayProps> = ({
  productId,
  storeId,
  retailPrice,
  className = "",
}) => {
  const { tiers, loading } = useProductPriceTiers(productId, storeId);
  const { settings: catalogSettings } = useCatalogSettings(storeId);

  // Se não for catálogo híbrido, não mostrar níveis
  if (catalogSettings?.catalog_mode !== "hybrid") {
    return null;
  }

  // Se não há níveis ou apenas varejo, não mostrar
  if (loading || tiers.length <= 1) {
    return null;
  }

  // Filtrar apenas níveis ativos (exceto varejo)
  const activeTiers = tiers.filter(
    (tier) => tier.tier_order > 1 && tier.is_active
  );

  if (activeTiers.length === 0) {
    return null;
  }

  // Calcular economia para cada nível
  const tiersWithSavings = activeTiers.map((tier) => {
    const savingsAmount = retailPrice - tier.price;
    const savingsPercentage = (savingsAmount / retailPrice) * 100;

    return {
      ...tier,
      savings: {
        amount: savingsAmount,
        percentage: savingsPercentage,
      },
    };
  });

  return (
    <Card className={`border-green-200 bg-green-50 ${className}`}>
      <CardContent className="p-3">
        <div className="flex items-center gap-2 mb-2">
          <TrendingDown className="h-4 w-4 text-green-600" />
          <span className="text-sm font-medium text-green-800">
            Descontos por Quantidade
          </span>
        </div>

        <div className="space-y-2">
          {tiersWithSavings.map((tier) => (
            <div
              key={tier.id}
              className="flex items-center justify-between text-sm"
            >
              <div className="flex items-center gap-2">
                <span className="text-gray-700 font-medium">
                  {tier.tier_name}
                </span>
                <Badge variant="outline" className="text-xs">
                  {tier.min_quantity}+ un
                </Badge>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-green-700 font-semibold">
                  R$ {tier.price.toFixed(2).replace(".", ",")}
                </span>
                <Badge
                  variant="secondary"
                  className="text-xs bg-green-100 text-green-700"
                >
                  -{tier.savings.percentage.toFixed(0)}%
                </Badge>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-2 pt-2 border-t border-green-200">
          <div className="flex items-center gap-1 text-xs text-green-600">
            <Info className="h-3 w-3" />
            <span>Preços mudam automaticamente no carrinho</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProductPriceTiersDisplay;
