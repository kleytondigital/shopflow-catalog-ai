import React, { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Plus, Minus, Trash2, Package, ShoppingCart } from "lucide-react";
import { ProductVariation } from "@/types/variation";
import { Product } from "@/types/product";

interface VariationSelection {
  variation: ProductVariation;
  quantity: number;
}

interface MultipleVariationSelectorProps {
  product: Product;
  variations: ProductVariation[];
  onAddToCart: (selections: VariationSelection[]) => void;
  catalogType?: "retail" | "wholesale";
}

const MultipleVariationSelector: React.FC<MultipleVariationSelectorProps> = ({
  product,
  variations,
  onAddToCart,
  catalogType = "retail",
}) => {
  const [selections, setSelections] = useState<VariationSelection[]>([]);

  // Agrupar variações por cor e tamanho
  const colors = [
    ...new Set(variations.filter((v) => v.color).map((v) => v.color)),
  ];
  const sizes = [
    ...new Set(variations.filter((v) => v.size).map((v) => v.size)),
  ];

  const getVariationKey = (variation: ProductVariation) =>
    `${variation.color || ""}-${variation.size || ""}-${variation.id}`;

  const addVariationSelection = useCallback(
    (variation: ProductVariation) => {
      const existingIndex = selections.findIndex(
        (s) => getVariationKey(s.variation) === getVariationKey(variation)
      );

      if (existingIndex >= 0) {
        // Se já existe, aumentar quantidade
        const newSelections = [...selections];
        const maxQty = variation.stock;
        newSelections[existingIndex] = {
          ...newSelections[existingIndex],
          quantity: Math.min(newSelections[existingIndex].quantity + 1, maxQty),
        };
        setSelections(newSelections);
      } else {
        // Adicionar nova seleção
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

  const removeSelection = useCallback((variationKey: string) => {
    setSelections((prev) =>
      prev.filter((s) => getVariationKey(s.variation) !== variationKey)
    );
  }, []);

  const calculateTotalPrice = () => {
    const basePrice =
      catalogType === "wholesale" && product.wholesale_price
        ? product.wholesale_price
        : product.retail_price;

    return selections.reduce((total, selection) => {
      const variationPrice =
        basePrice + (selection.variation.price_adjustment || 0);
      return total + variationPrice * selection.quantity;
    }, 0);
  };

  const calculateTotalItems = () => {
    return selections.reduce(
      (total, selection) => total + selection.quantity,
      0
    );
  };

  const handleAddAllToCart = () => {
    if (selections.length > 0) {
      onAddToCart(selections);
      setSelections([]); // Limpar seleções após adicionar ao carrinho
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Selecionar Múltiplas Variações
        </h3>
        <p className="text-sm text-gray-600">
          Escolha diferentes cores e tamanhos em uma única compra
        </p>
      </div>

      {/* Grid de Variações Disponíveis */}
      <div className="space-y-4">
        <h4 className="font-medium text-gray-900">Variações Disponíveis</h4>

        {colors.length > 0 && (
          <div className="space-y-3">
            {colors.map((color) => (
              <div key={color} className="border rounded-lg p-4">
                <h5 className="font-medium text-gray-800 mb-3 flex items-center gap-2">
                  <div
                    className="w-4 h-4 rounded-full border border-gray-300"
                    style={{ backgroundColor: color.toLowerCase() }}
                  />
                  {color}
                </h5>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                  {variations
                    .filter((v) => v.color === color)
                    .map((variation) => {
                      const isSelected = selections.some(
                        (s) =>
                          getVariationKey(s.variation) ===
                          getVariationKey(variation)
                      );
                      const selectedQty =
                        selections.find(
                          (s) =>
                            getVariationKey(s.variation) ===
                            getVariationKey(variation)
                        )?.quantity || 0;

                      return (
                        <Button
                          key={getVariationKey(variation)}
                          variant={isSelected ? "default" : "outline"}
                          size="sm"
                          disabled={variation.stock === 0}
                          onClick={() => addVariationSelection(variation)}
                          className="h-auto flex-col gap-1 p-3 relative"
                        >
                          <span className="text-xs font-medium">
                            {variation.size || "Único"}
                          </span>
                          <span className="text-xs text-gray-500">
                            {variation.stock} un.
                          </span>
                          {selectedQty > 0 && (
                            <Badge
                              variant="secondary"
                              className="absolute -top-2 -right-2 w-6 h-6 p-0 flex items-center justify-center text-xs"
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
        )}

        {/* Se não há cores, mostrar todas as variações */}
        {colors.length === 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {variations.map((variation) => {
              const isSelected = selections.some(
                (s) =>
                  getVariationKey(s.variation) === getVariationKey(variation)
              );
              const selectedQty =
                selections.find(
                  (s) =>
                    getVariationKey(s.variation) === getVariationKey(variation)
                )?.quantity || 0;

              return (
                <Button
                  key={getVariationKey(variation)}
                  variant={isSelected ? "default" : "outline"}
                  disabled={variation.stock === 0}
                  onClick={() => addVariationSelection(variation)}
                  className="h-auto flex-col gap-1 p-3 relative"
                >
                  <span className="text-sm font-medium">
                    {variation.size || variation.color || "Variação"}
                  </span>
                  <span className="text-xs text-gray-500">
                    {variation.stock} un.
                  </span>
                  {selectedQty > 0 && (
                    <Badge
                      variant="secondary"
                      className="absolute -top-2 -right-2 w-6 h-6 p-0 flex items-center justify-center text-xs"
                    >
                      {selectedQty}
                    </Badge>
                  )}
                </Button>
              );
            })}
          </div>
        )}
      </div>

      {/* Itens Selecionados */}
      {selections.length > 0 && (
        <Card>
          <CardContent className="p-4">
            <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
              <Package className="w-4 h-4" />
              Itens Selecionados ({calculateTotalItems()})
            </h4>

            <div className="space-y-3">
              {selections.map((selection) => {
                const variationKey = getVariationKey(selection.variation);
                const basePrice =
                  catalogType === "wholesale" && product.wholesale_price
                    ? product.wholesale_price
                    : product.retail_price;
                const itemPrice =
                  basePrice + (selection.variation.price_adjustment || 0);
                const totalItemPrice = itemPrice * selection.quantity;

                return (
                  <div
                    key={variationKey}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        {selection.variation.color && (
                          <Badge variant="outline" className="text-xs">
                            {selection.variation.color}
                          </Badge>
                        )}
                        {selection.variation.size && (
                          <Badge variant="outline" className="text-xs">
                            {selection.variation.size}
                          </Badge>
                        )}
                      </div>
                      <div className="text-sm text-gray-600">
                        R${" "}
                        {itemPrice.toLocaleString("pt-BR", {
                          minimumFractionDigits: 2,
                        })}{" "}
                        cada
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1">
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-8 h-8 p-0"
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
                          className="w-16 h-8 text-center"
                          min={0}
                          max={selection.variation.stock}
                        />

                        <Button
                          variant="outline"
                          size="sm"
                          className="w-8 h-8 p-0"
                          onClick={() =>
                            updateQuantity(variationKey, selection.quantity + 1)
                          }
                          disabled={
                            selection.quantity >= selection.variation.stock
                          }
                        >
                          <Plus className="w-3 h-3" />
                        </Button>
                      </div>

                      <div className="text-sm font-medium min-w-[80px] text-right">
                        R${" "}
                        {totalItemPrice.toLocaleString("pt-BR", {
                          minimumFractionDigits: 2,
                        })}
                      </div>

                      <Button
                        variant="outline"
                        size="sm"
                        className="w-8 h-8 p-0 text-red-500 hover:text-red-700"
                        onClick={() => removeSelection(variationKey)}
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>

            <Separator className="my-4" />

            <div className="flex items-center justify-between">
              <div className="text-lg font-semibold">
                Total: R${" "}
                {calculateTotalPrice().toLocaleString("pt-BR", {
                  minimumFractionDigits: 2,
                })}
              </div>
              <Button
                onClick={handleAddAllToCart}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                <ShoppingCart className="w-4 h-4 mr-2" />
                Adicionar ao Carrinho ({calculateTotalItems()})
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {selections.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <Package className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p className="text-sm">
            Selecione as variações desejadas para continuar
          </p>
        </div>
      )}
    </div>
  );
};

export default MultipleVariationSelector;
