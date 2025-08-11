import React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ProductVariation } from "@/types/product";
import { Package, CheckCircle2, AlertCircle } from "lucide-react";

interface GradeVariationCardProps {
  variation: ProductVariation;
  isSelected: boolean;
  onSelect: () => void;
  showPrice?: boolean;
  basePrice?: number;
}

const GradeVariationCard: React.FC<GradeVariationCardProps> = ({
  variation,
  isSelected,
  onSelect,
  showPrice = false,
  basePrice = 0,
}) => {
  const isAvailable = variation.stock > 0;
  const finalPrice = basePrice + (variation.price_adjustment || 0);

  return (
    <Button
      variant="outline"
      onClick={onSelect}
      disabled={!isAvailable}
      className={`
        relative h-auto p-4 w-full text-left transition-all duration-200
        ${!isAvailable ? "opacity-50" : ""}
        ${
          isSelected
            ? "border-2 border-primary bg-primary/5 shadow-md scale-[1.02] ring-2 ring-primary/20"
            : "hover:border-primary/50 hover:shadow-sm hover:bg-muted/30"
        }
        ${isSelected ? "bg-gradient-to-r from-primary/5 to-primary/10" : ""}
      `}
    >
      <div className="flex flex-col gap-3 w-full">
        {/* Header with Grade Name and Status */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-0">
          <div className="flex items-center gap-2">
            <Package className="h-4 w-4" />
            <span className="font-semibold text-sm sm:text-base">
              {variation.grade_name || "Grade"}
            </span>
            {isSelected && <CheckCircle2 className="h-4 w-4 text-green-600" />}
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {variation.grade_color && (
              <Badge
                variant={isSelected ? "secondary" : "outline"}
                className="text-xs px-2 py-1"
              >
                {variation.grade_color}
              </Badge>
            )}

            <Badge
              variant={isAvailable ? "outline" : "destructive"}
              className="text-xs flex items-center gap-1 px-2 py-1"
            >
              {isAvailable ? (
                <>
                  <CheckCircle2 className="h-3 w-3" />
                  <span className="hidden sm:inline">
                    {variation.stock} disponível
                  </span>
                  <span className="sm:hidden">{variation.stock} disp</span>
                </>
              ) : (
                <>
                  <AlertCircle className="h-3 w-3" />
                  <span className="hidden sm:inline">Esgotado</span>
                  <span className="sm:hidden">Indisp</span>
                </>
              )}
            </Badge>
          </div>
        </div>

        {/* Size Summary - More Compact */}
        {variation.grade_sizes && variation.grade_sizes.length > 0 && (
          <div className="space-y-2">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 sm:gap-0">
              <span className="text-xs font-medium text-muted-foreground">
                Tamanhos incluídos:
              </span>
              <Badge
                variant="outline"
                className="text-[10px] px-1 py-0 self-start sm:self-center"
              >
                {variation.grade_sizes.length} tamanhos
              </Badge>
            </div>

            {/* Compact Size Display - Mobile Optimized */}
            <div className="grid grid-cols-4 sm:flex sm:flex-wrap gap-1">
              {variation.grade_sizes.slice(0, 8).map((size, idx) => {
                const pairCount =
                  variation.grade_pairs && variation.grade_pairs[idx]
                    ? variation.grade_pairs[idx]
                    : 0;
                return (
                  <div
                    key={idx}
                    className="flex flex-col sm:flex-row sm:items-center gap-1 px-2 py-1 bg-muted/50 rounded text-xs text-center sm:text-left"
                  >
                    <span className="font-medium">{size}</span>
                    {pairCount > 0 && (
                      <span className="text-muted-foreground text-[10px] sm:text-xs">
                        ({pairCount})
                      </span>
                    )}
                  </div>
                );
              })}
              {variation.grade_sizes.length > 8 && (
                <div className="px-2 py-1 bg-muted/50 rounded text-xs text-muted-foreground text-center col-span-2 sm:col-span-1">
                  +{variation.grade_sizes.length - 8} mais
                </div>
              )}
            </div>

            {/* Total pairs if available */}
            {variation.grade_pairs && variation.grade_pairs.length > 0 && (
              <div className="text-xs text-muted-foreground text-center sm:text-left">
                Total:{" "}
                {variation.grade_pairs.reduce(
                  (total, pairs) => total + (pairs || 0),
                  0
                )}{" "}
                pares
              </div>
            )}
          </div>
        )}

        {/* Price Information */}
        {showPrice && (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-0 pt-2 border-t border-border/50">
            {variation.price_adjustment !== 0 ? (
              <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                <span className="text-xs sm:text-sm text-muted-foreground">
                  Preço:
                </span>
                <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                  <span className="font-semibold text-sm sm:text-base">
                    R${" "}
                    {finalPrice.toLocaleString("pt-BR", {
                      minimumFractionDigits: 2,
                    })}
                  </span>
                  <Badge
                    variant={
                      variation.price_adjustment > 0 ? "destructive" : "default"
                    }
                    className="text-xs px-2 py-1"
                  >
                    {variation.price_adjustment > 0 ? "+" : ""}
                    R${" "}
                    {variation.price_adjustment.toLocaleString("pt-BR", {
                      minimumFractionDigits: 2,
                    })}
                  </Badge>
                </div>
              </div>
            ) : (
              <span className="text-xs sm:text-sm text-muted-foreground text-center sm:text-left">
                Mesmo preço base
              </span>
            )}
          </div>
        )}

        {/* SKU */}
        {variation.sku && (
          <div className="text-xs text-muted-foreground font-mono text-center sm:text-left">
            SKU: {variation.sku}
          </div>
        )}
      </div>

      {/* Unavailable Overlay */}
      {!isAvailable && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/80 rounded">
          <div className="text-xs sm:text-sm font-medium text-destructive flex items-center gap-2">
            <AlertCircle className="h-3 w-3 sm:h-4 sm:w-4" />
            <span className="hidden sm:inline">Indisponível</span>
            <span className="sm:hidden">Indisp</span>
          </div>
        </div>
      )}
    </Button>
  );
};

export default GradeVariationCard;
