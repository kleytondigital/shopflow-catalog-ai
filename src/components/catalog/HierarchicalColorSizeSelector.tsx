
import React, { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Plus, Minus, ShoppingCart, Package, Palette, CheckCircle } from "lucide-react";
import { ProductVariation } from "@/types/variation";
import { Product } from "@/types/product";

interface VariationSelection {
  variation: ProductVariation;
  quantity: number;
}

interface ColorGroup {
  color: string;
  hex_color?: string;
  variations: ProductVariation[];
  totalStock: number;
}

interface HierarchicalColorSizeSelectorProps {
  product: Product;
  variations: ProductVariation[];
  onAddToCart: (selections: VariationSelection[]) => void;
  catalogType?: "retail" | "wholesale";
}

const HierarchicalColorSizeSelector: React.FC<HierarchicalColorSizeSelectorProps> = ({
  product,
  variations,
  onAddToCart,
  catalogType = "retail",
}) => {
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [selections, setSelections] = useState<VariationSelection[]>([]);

  // Agrupar variações por cor
  const colorGroups = React.useMemo(() => {
    const groups: { [key: string]: ColorGroup } = {};
    
    variations.forEach((variation) => {
      const color = variation.color || 'Único';
      if (!groups[color]) {
        groups[color] = {
          color,
          hex_color: variation.color,
          variations: [],
          totalStock: 0,
        };
      }
      groups[color].variations.push(variation);
      groups[color].totalStock += variation.stock || 0;
    });

    return Object.values(groups);
  }, [variations]);

  const getVariationKey = (variation: ProductVariation) =>
    `${variation.color || ""}-${variation.size || ""}-${variation.id}`;

  const updateQuantity = useCallback((variationKey: string, quantity: number) => {
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
  }, []);

  const addVariationSelection = useCallback((variation: ProductVariation) => {
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
  }, [selections]);

  const handleAddAllToCart = () => {
    if (selections.length > 0) {
      onAddToCart(selections);
      setSelections([]);
      setSelectedColor(null);
    }
  };

  const selectedColorGroup = colorGroups.find(group => group.color === selectedColor);
  const totalItems = selections.reduce((sum, s) => sum + s.quantity, 0);

  // Calcular preço total baseado nas seleções
  const totalPrice = selections.reduce((sum, selection) => {
    const basePrice = catalogType === "wholesale" && product.wholesale_price
      ? product.wholesale_price
      : product.retail_price;
    const itemPrice = basePrice + (selection.variation.price_adjustment || 0);
    return sum + (itemPrice * selection.quantity);
  }, 0);

  return (
    <div className="space-y-6">
      {/* Seleção de Cores */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="font-semibold text-lg flex items-center gap-2">
            <Palette className="h-5 w-5 text-primary" />
            Escolha a Cor
          </h4>
          <Badge variant="outline" className="text-sm">
            {colorGroups.length} cores disponíveis
          </Badge>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {colorGroups.map((colorGroup) => {
            const isSelected = selectedColor === colorGroup.color;
            const isAvailable = colorGroup.totalStock > 0;
            
            return (
              <Button
                key={colorGroup.color}
                variant={isSelected ? "default" : "outline"}
                disabled={!isAvailable}
                onClick={() => setSelectedColor(colorGroup.color)}
                className={`h-auto flex-col gap-2 p-4 relative transition-all ${
                  isSelected ? 'ring-2 ring-primary shadow-lg' : 'hover:shadow-md'
                }`}
              >
                {/* Indicador visual da cor */}
                {colorGroup.color !== 'Único' && (
                  <div
                    className="w-8 h-8 rounded-full border-2 border-white shadow-sm mx-auto"
                    style={{ 
                      backgroundColor: colorGroup.hex_color?.toLowerCase() || colorGroup.color.toLowerCase()
                    }}
                  />
                )}
                
                {/* Nome da cor */}
                <div className="text-center">
                  <span className="font-medium text-sm">
                    {colorGroup.color}
                  </span>
                  <div className="text-xs text-muted-foreground mt-1">
                    {colorGroup.variations.length} tamanhos
                  </div>
                  <div className="text-xs font-medium text-green-600">
                    {colorGroup.totalStock} em estoque
                  </div>
                </div>

                {/* Checkmark para cor selecionada */}
                {isSelected && (
                  <CheckCircle className="absolute -top-1 -right-1 h-5 w-5 text-primary bg-background rounded-full" />
                )}
              </Button>
            );
          })}
        </div>
      </div>

      {/* Seleção de Tamanhos da Cor Escolhida */}
      {selectedColorGroup && (
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="p-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-semibold text-lg flex items-center gap-2">
                  <Package className="h-5 w-5 text-primary" />
                  Tamanhos em {selectedColorGroup.color}
                </h4>
                <Badge variant="secondary">
                  {selectedColorGroup.variations.length} opções
                </Badge>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                {selectedColorGroup.variations.map((variation) => {
                  const selectedQty = selections.find(
                    (s) => getVariationKey(s.variation) === getVariationKey(variation)
                  )?.quantity || 0;
                  const isAvailable = variation.stock > 0;

                  return (
                    <Card
                      key={getVariationKey(variation)}
                      className={`transition-all cursor-pointer ${
                        selectedQty > 0 
                          ? 'ring-2 ring-primary bg-primary/10 shadow-md' 
                          : isAvailable 
                            ? 'hover:shadow-md hover:bg-muted/50' 
                            : 'opacity-50'
                      }`}
                    >
                      <CardContent className="p-4">
                        <div className="text-center space-y-2">
                          {/* Tamanho */}
                          <div className="font-semibold text-lg">
                            {variation.size || "Único"}
                          </div>
                          
                          {/* Informações de estoque e preço */}
                          <div className="text-xs text-muted-foreground space-y-1">
                            <div className="flex items-center justify-center gap-1">
                              <Package className="h-3 w-3" />
                              <span>{variation.stock} disponível</span>
                            </div>
                            {variation.price_adjustment !== 0 && (
                              <div className="text-primary font-medium">
                                {variation.price_adjustment > 0 ? '+' : ''}
                                R$ {variation.price_adjustment.toFixed(2)}
                              </div>
                            )}
                          </div>

                          {/* Controles de Quantidade */}
                          {isAvailable && (
                            <div className="space-y-2">
                              {selectedQty === 0 ? (
                                <Button
                                  size="sm"
                                  onClick={() => addVariationSelection(variation)}
                                  className="w-full"
                                >
                                  <Plus className="h-4 w-4 mr-1" />
                                  Adicionar
                                </Button>
                              ) : (
                                <div className="flex items-center justify-center gap-2">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="h-8 w-8 p-0"
                                    onClick={() =>
                                      updateQuantity(getVariationKey(variation), selectedQty - 1)
                                    }
                                  >
                                    <Minus className="h-3 w-3" />
                                  </Button>

                                  <Input
                                    type="number"
                                    value={selectedQty}
                                    onChange={(e) =>
                                      updateQuantity(
                                        getVariationKey(variation),
                                        parseInt(e.target.value) || 0
                                      )
                                    }
                                    className="w-16 h-8 text-center text-sm"
                                    min={0}
                                    max={variation.stock}
                                  />

                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="h-8 w-8 p-0"
                                    onClick={() =>
                                      updateQuantity(getVariationKey(variation), selectedQty + 1)
                                    }
                                    disabled={selectedQty >= variation.stock}
                                  >
                                    <Plus className="h-3 w-3" />
                                  </Button>
                                </div>
                              )}

                              {/* Badge com quantidade selecionada */}
                              {selectedQty > 0 && (
                                <Badge className="w-full justify-center">
                                  {selectedQty} selecionado{selectedQty > 1 ? 's' : ''}
                                </Badge>
                              )}
                            </div>
                          )}

                          {!isAvailable && (
                            <Badge variant="destructive" className="w-full justify-center">
                              Indisponível
                            </Badge>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Resumo de Seleções e Botão de Adicionar ao Carrinho */}
      {selections.length > 0 && (
        <Card className="border-green-200 bg-green-50">
          <CardContent className="p-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-semibold text-lg text-green-800">
                  Resumo da Seleção
                </h4>
                <div className="text-right">
                  <div className="text-sm text-green-700">
                    {totalItems} {totalItems === 1 ? 'item selecionado' : 'itens selecionados'}
                  </div>
                  <div className="text-xl font-bold text-green-800">
                    R$ {totalPrice.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </div>
                </div>
              </div>

              {/* Lista resumida de seleções */}
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {selections.map((selection) => {
                  const basePrice = catalogType === "wholesale" && product.wholesale_price
                    ? product.wholesale_price
                    : product.retail_price;
                  const itemPrice = basePrice + (selection.variation.price_adjustment || 0);

                  return (
                    <div
                      key={getVariationKey(selection.variation)}
                      className="flex items-center justify-between text-sm bg-white rounded-lg p-3"
                    >
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          {selection.variation.color}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {selection.variation.size}
                        </Badge>
                        <span className="text-muted-foreground">
                          × {selection.quantity}
                        </span>
                      </div>
                      <span className="font-medium text-green-700">
                        R$ {(itemPrice * selection.quantity).toFixed(2)}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Botão de Adicionar ao Carrinho */}
              <Button
                onClick={handleAddAllToCart}
                size="lg"
                className="w-full bg-green-600 hover:bg-green-700"
              >
                <ShoppingCart className="h-5 w-5 mr-2" />
                Adicionar ao Carrinho ({totalItems})
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Estado Vazio - Escolha de Cor */}
      {!selectedColor && (
        <div className="text-center py-8 text-muted-foreground">
          <Palette className="h-12 w-12 mx-auto mb-3 opacity-50" />
          <h3 className="font-medium text-lg mb-2">Escolha uma cor</h3>
          <p className="text-sm">
            Selecione uma cor acima para ver os tamanhos disponíveis
          </p>
        </div>
      )}

      {/* Estado Vazio - Seleção de Tamanhos */}
      {selectedColor && selections.length === 0 && (
        <div className="text-center py-6 text-muted-foreground">
          <Package className="h-10 w-10 mx-auto mb-2 opacity-50" />
          <p className="text-sm">
            Selecione os tamanhos desejados em <strong>{selectedColor}</strong>
          </p>
        </div>
      )}
    </div>
  );
};

export default HierarchicalColorSizeSelector;
