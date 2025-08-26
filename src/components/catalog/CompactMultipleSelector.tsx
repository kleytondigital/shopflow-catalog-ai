
import React, { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Plus, Minus, ShoppingCart, Package } from "lucide-react";
import { ProductVariation } from "@/types/variation";
import { Product } from "@/types/product";
import { usePriceCalculation } from "@/hooks/usePriceCalculation";

interface VariationSelection {
  variation: ProductVariation;
  quantity: number;
}

interface CompactMultipleSelectorProps {
  product: Product;
  variations: ProductVariation[];
  onAddToCart: (selections: VariationSelection[]) => void;
  catalogType?: "retail" | "wholesale";
}

const CompactMultipleSelector: React.FC<CompactMultipleSelectorProps> = ({
  product,
  variations,
  onAddToCart,
  catalogType = "retail",
}) => {
  const [selections, setSelections] = useState<VariationSelection[]>([]);

  const priceCalculation = usePriceCalculation(
    product.store_id || "",
    {
      product_id: product.id,
      retail_price: product.retail_price,
      wholesale_price: product.wholesale_price,
      min_wholesale_qty: product.min_wholesale_qty,
      quantity: selections.reduce((sum, s) => sum + s.quantity, 0),
      price_tiers: product.price_tiers,
      enable_gradual_wholesale: product.enable_gradual_wholesale,
    }
  );

  const getVariationKey = (variation: ProductVariation) =>
    `${variation.color || ""}-${variation.size || ""}-${variation.id}`;

  const addVariationSelection = useCallback(
    (variation: ProductVariation) => {
      const existingIndex = selections.findIndex(
        (s) => getVariationKey(s.variation) === getVariationKey(variation)
      );

      if (existingIndex >= 0) {
        const newSelections = [...selections];
        const maxQty = variation.stock;
        newSelections[existingIndex] = {
          ...newSelections[existingIndex],
          quantity: Math.min(newSelections[existingIndex].quantity + 1, maxQty),
        };
        setSelections(newSelections);
      } else {
        setSelections((prev) => [...prev, { variation, quantity: 1 }]);
      }
    },
    [selections]
  );

  const updateQuantity = useCallback(
    (variationKey: string, quantity: number) => {
      setSelections((prev) =>
        prev
          .map((selection) => {
            if (getVariationKey(selection.variation) === variationKey) {
              const maxQty = selection.variation.stock;
              return {
                ...selection,
                quantity: Math.max(0, Math.min(quantity, maxQty)),
              };
            }
            return selection;
          })
          .filter((selection) => selection.quantity > 0)
      );
    },
    []
  );

  const handleAddAllToCart = () => {
    if (selections.length > 0) {
      onAddToCart(selections);
      setSelections([]);
    }
  };

  // Agrupar variações por cor
  const colorGroups = variations.reduce((groups: any, variation) => {
    const color = variation.color || 'Único';
    if (!groups[color]) {
      groups[color] = [];
    }
    groups[color].push(variation);
    return groups;
  }, {});

  const totalItems = selections.reduce((sum, s) => sum + s.quantity, 0);

  return (
    <div className="space-y-4">
      {/* Grid Compacto de Variações */}
      <div className="space-y-3">
        {Object.entries(colorGroups).map(([color, colorVariations]: [string, any]) => (
          <div key={color} className="border rounded-lg p-3">
            <div className="flex items-center gap-2 mb-2">
              {color !== 'Único' && (
                <div
                  className="w-3 h-3 rounded-full border border-gray-300"
                  style={{ backgroundColor: color.toLowerCase() }}
                />
              )}
              <span className="text-sm font-medium">{color}</span>
            </div>

            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
              {colorVariations.map((variation: ProductVariation) => {
                const isSelected = selections.some(
                  (s) => getVariationKey(s.variation) === getVariationKey(variation)
                );
                const selectedQty = selections.find(
                  (s) => getVariationKey(s.variation) === getVariationKey(variation)
                )?.quantity || 0;

                return (
                  <Button
                    key={getVariationKey(variation)}
                    variant={isSelected ? "default" : "outline"}
                    size="sm"
                    disabled={variation.stock === 0}
                    onClick={() => addVariationSelection(variation)}
                    className="h-auto flex-col gap-1 p-2 relative text-xs"
                  >
                    <span className="font-medium">
                      {variation.size || "Único"}
                    </span>
                    <span className="text-gray-500">
                      {variation.stock} un.
                    </span>
                    {selectedQty > 0 && (
                      <Badge
                        variant="secondary"
                        className="absolute -top-1 -right-1 w-5 h-5 p-0 flex items-center justify-center text-xs"
                      >
                        {selectedQty}
                      </Badge>
                    )}
                  </Button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Resumo de Seleções */}
      {selections.length > 0 && (
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="p-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-blue-800">
                {totalItems} {totalItems === 1 ? 'item selecionado' : 'itens selecionados'}
              </span>
              {priceCalculation.savings > 0 && (
                <Badge className="bg-green-100 text-green-800 text-xs">
                  Economia: {priceCalculation.formattedSavings}
                </Badge>
              )}
            </div>

            {/* Lista Compacta de Seleções */}
            <div className="space-y-1 mb-3 max-h-32 overflow-y-auto">
              {selections.map((selection) => {
                const variationKey = getVariationKey(selection.variation);
                const basePrice = catalogType === "wholesale" && product.wholesale_price
                  ? product.wholesale_price
                  : product.retail_price;
                const itemPrice = basePrice + (selection.variation.price_adjustment || 0);

                return (
                  <div
                    key={variationKey}
                    className="flex items-center justify-between text-xs bg-white rounded p-2"
                  >
                    <div className="flex items-center gap-2">
                      <div className="flex gap-1">
                        {selection.variation.color && (
                          <Badge variant="outline" className="text-xs px-1 py-0">
                            {selection.variation.color}
                          </Badge>
                        )}
                        {selection.variation.size && (
                          <Badge variant="outline" className="text-xs px-1 py-0">
                            {selection.variation.size}
                          </Badge>
                        )}
                      </div>
                      <span className="text-gray-600">
                        R$ {itemPrice.toFixed(2)}
                      </span>
                    </div>

                    <div className="flex items-center gap-1">
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-6 h-6 p-0"
                        onClick={() =>
                          updateQuantity(variationKey, selection.quantity - 1)
                        }
                      >
                        <Minus className="w-3 h-3" />
                      </Button>

                      <Input
                        type="number"
                        value={selection.quantity}
                        onChange={(e) =>
                          updateQuantity(
                            variationKey,
                            parseInt(e.target.value) || 0
                          )
                        }
                        className="w-12 h-6 text-center text-xs"
                        min={0}
                        max={selection.variation.stock}
                      />

                      <Button
                        variant="outline"
                        size="sm"
                        className="w-6 h-6 p-0"
                        onClick={() =>
                          updateQuantity(variationKey, selection.quantity + 1)
                        }
                        disabled={selection.quantity >= selection.variation.stock}
                      >
                        <Plus className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Total e Botão */}
            <div className="flex items-center justify-between">
              <div className="text-sm font-semibold text-blue-800">
                Total: {priceCalculation.formattedTotal}
              </div>
              <Button
                onClick={handleAddAllToCart}
                size="sm"
                className="bg-blue-600 hover:bg-blue-700"
              >
                <ShoppingCart className="w-4 h-4 mr-1" />
                Adicionar ({totalItems})
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {selections.length === 0 && (
        <div className="text-center py-4 text-gray-500">
          <Package className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p className="text-sm">
            Selecione as variações desejadas para continuar
          </p>
        </div>
      )}
    </div>
  );
};

export default CompactMultipleSelector;
