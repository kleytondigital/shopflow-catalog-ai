import React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ProductVariation } from "@/types/variation";

interface ProductVariationSelectorProps {
  variations: ProductVariation[];
  selectedVariation: ProductVariation | null;
  onVariationChange: (variation: ProductVariation | null) => void;
  loading?: boolean;
}

const ProductVariationSelector: React.FC<ProductVariationSelectorProps> = ({
  variations,
  selectedVariation,
  onVariationChange,
  loading = false,
}) => {
  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-4 w-20" />
        <div className="flex gap-2 flex-wrap">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-10 w-20" />
          ))}
        </div>
      </div>
    );
  }

  if (!variations || variations.length === 0) {
    return null;
  }

  // Verificar se são variações de grade
  const hasGradeVariations = variations.some(
    (v) => v.variation_type === "grade" || v.is_grade
  );

  if (hasGradeVariations) {
    // Renderizar seletor para variações de grade
    return (
      <div className="space-y-4">
        <div>
          <h4 className="font-medium mb-3 text-blue-700">Selecione a Grade</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {variations.map((variation) => {
              const isSelected = selectedVariation?.id === variation.id;
              const isAvailable = variation.stock > 0;

              return (
                <Button
                  key={variation.id}
                  variant={isSelected ? "default" : "outline"}
                  size="lg"
                  onClick={() => onVariationChange(variation)}
                  disabled={!isAvailable}
                  className={`relative h-auto p-4 ${
                    !isAvailable ? "opacity-50" : ""
                  } ${isSelected ? "bg-blue-600 text-white" : ""}`}
                >
                  <div className="flex flex-col items-start gap-2 w-full">
                    <div className="flex items-center gap-2 w-full">
                      <Badge
                        variant={isSelected ? "secondary" : "outline"}
                        className={
                          isSelected ? "bg-blue-100 text-blue-800" : ""
                        }
                      >
                        {variation.grade_name || "Grade"}
                      </Badge>
                      {variation.grade_color && (
                        <Badge
                          variant={isSelected ? "secondary" : "outline"}
                          className={
                            isSelected ? "bg-blue-100 text-blue-800" : ""
                          }
                        >
                          {variation.grade_color}
                        </Badge>
                      )}
                    </div>

                    {variation.grade_sizes &&
                      variation.grade_sizes.length > 0 && (
                        <div className="flex flex-wrap gap-3 mt-1">
                          {variation.grade_sizes.map((size, idx) => (
                            <div key={idx} className="relative inline-block">
                              <span
                                className={`text-base bg-blue-100 text-blue-900 px-3 py-1 rounded-full border-2 border-blue-400 font-bold shadow-sm`}
                              >
                                {size}
                              </span>
                              {variation.grade_pairs &&
                                variation.grade_pairs[idx] && (
                                  <span className="absolute -top-2 -right-2 bg-yellow-400 text-gray-900 text-[10px] px-1.5 py-0.5 rounded-full border border-white shadow font-bold">
                                    {variation.grade_pairs[idx]}
                                  </span>
                                )}
                            </div>
                          ))}
                        </div>
                      )}
                    {/* SKU discreto */}
                    {variation.sku && (
                      <div className="text-[9px] text-gray-400 mt-1 select-all font-mono">
                        SKU: {variation.sku}
                      </div>
                    )}

                    <div className="flex items-center justify-between w-full mt-2">
                      <span
                        className={`text-sm font-medium ${
                          isSelected ? "text-blue-100" : "text-gray-700"
                        }`}
                      >
                        {variation.stock} disponível
                      </span>
                    </div>
                  </div>

                  {!isAvailable && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-full h-px bg-gray-400 transform rotate-45" />
                    </div>
                  )}
                </Button>
              );
            })}
          </div>
        </div>

        {/* Informações da variação selecionada */}
        {selectedVariation && (
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-center justify-between mb-3">
              <h5 className="font-medium text-blue-900">
                Grade Selecionada: {selectedVariation.grade_name} -{" "}
                {selectedVariation.grade_color}
              </h5>
              <Badge className="bg-blue-600 text-white">
                {selectedVariation.stock} disponível
              </Badge>
            </div>

            {selectedVariation.grade_sizes &&
              selectedVariation.grade_sizes.length > 0 && (
                <div className="mb-3">
                  <span className="text-sm font-medium text-blue-800 mb-2 block">
                    Tamanhos incluídos:
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {selectedVariation.grade_sizes.map((size, index) => (
                      <span
                        key={index}
                        className="text-sm bg-white px-2 py-1 rounded border border-blue-300 text-blue-800"
                      >
                        {size}
                      </span>
                    ))}
                  </div>
                </div>
              )}

            {selectedVariation.price_adjustment !== 0 && (
              <div className="text-sm">
                <span className="text-blue-700">
                  Ajuste de preço:{" "}
                  {selectedVariation.price_adjustment > 0 ? "+" : ""}
                  R${" "}
                  {selectedVariation.price_adjustment.toLocaleString("pt-BR", {
                    minimumFractionDigits: 2,
                  })}
                </span>
              </div>
            )}
          </div>
        )}
      </div>
    );
  }

  // Renderizar seletor tradicional para variações normais
  // Agrupar variações por atributos
  const colors = [
    ...new Set(variations.filter((v) => v.color).map((v) => v.color)),
  ];
  const sizes = [
    ...new Set(variations.filter((v) => v.size).map((v) => v.size)),
  ];

  const getVariationsForAttributes = (color?: string, size?: string) => {
    return variations.filter(
      (v) => (!color || v.color === color) && (!size || v.size === size)
    );
  };

  const getAvailableStock = (color?: string, size?: string) => {
    const matchingVariations = getVariationsForAttributes(color, size);
    return matchingVariations.reduce((total, v) => total + v.stock, 0);
  };

  const handleAttributeSelection = (color?: string, size?: string) => {
    const matchingVariations = getVariationsForAttributes(color, size);

    if (matchingVariations.length === 1) {
      onVariationChange(matchingVariations[0]);
    } else if (matchingVariations.length > 1) {
      // Se há múltiplas variações, escolher a primeira disponível
      const availableVariation = matchingVariations.find((v) => v.stock > 0);
      onVariationChange(availableVariation || matchingVariations[0]);
    } else {
      onVariationChange(null);
    }
  };

  return (
    <div className="space-y-4">
      {/* Color Selection */}
      {colors.length > 0 && (
        <div>
          <h4 className="font-medium mb-2">Cor</h4>
          <div className="flex gap-2 flex-wrap">
            {colors.map((color) => {
              const isSelected = selectedVariation?.color === color;
              const stock = getAvailableStock(
                color as string,
                selectedVariation?.size || undefined
              );
              const isAvailable = stock > 0;

              return (
                <Button
                  key={color}
                  variant={isSelected ? "default" : "outline"}
                  size="sm"
                  onClick={() =>
                    handleAttributeSelection(
                      color as string,
                      selectedVariation?.size || undefined
                    )
                  }
                  disabled={!isAvailable}
                  className={`relative ${!isAvailable ? "opacity-50" : ""}`}
                >
                  {color}
                  {!isAvailable && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-full h-px bg-gray-400 transform rotate-45" />
                    </div>
                  )}
                </Button>
              );
            })}
          </div>
        </div>
      )}

      {/* Size Selection */}
      {sizes.length > 0 && (
        <div>
          <h4 className="font-medium mb-2">Tamanho</h4>
          <div className="flex gap-2 flex-wrap">
            {sizes.map((size) => {
              const isSelected = selectedVariation?.size === size;
              const stock = getAvailableStock(
                selectedVariation?.color || undefined,
                size as string
              );
              const isAvailable = stock > 0;

              return (
                <Button
                  key={size}
                  variant={isSelected ? "default" : "outline"}
                  size="sm"
                  onClick={() =>
                    handleAttributeSelection(
                      selectedVariation?.color || undefined,
                      size as string
                    )
                  }
                  disabled={!isAvailable}
                  className={`relative ${!isAvailable ? "opacity-50" : ""}`}
                >
                  {size}
                  {!isAvailable && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-full h-px bg-gray-400 transform rotate-45" />
                    </div>
                  )}
                </Button>
              );
            })}
          </div>
        </div>
      )}

      {/* Selected Variation Info */}
      {selectedVariation && (
        <div className="p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex gap-2 items-center">
              {selectedVariation.color && (
                <Badge variant="outline">{selectedVariation.color}</Badge>
              )}
              {selectedVariation.size && (
                <Badge variant="outline">{selectedVariation.size}</Badge>
              )}
              {selectedVariation.sku && (
                <Badge variant="outline">SKU: {selectedVariation.sku}</Badge>
              )}
            </div>
            <div className="text-sm flex items-center gap-2">
              <span className="font-medium">
                {selectedVariation.stock} em estoque
              </span>
              {selectedVariation.price_adjustment !== 0 && (
                <span className="text-primary">
                  {selectedVariation.price_adjustment > 0 ? "+" : ""}
                  R${" "}
                  {selectedVariation.price_adjustment.toLocaleString("pt-BR", {
                    minimumFractionDigits: 2,
                  })}
                </span>
              )}
            </div>
          </div>

          {/* Mostrar imagem da variação se disponível */}
          {selectedVariation.image_url && (
            <div className="mt-2">
              <img
                src={selectedVariation.image_url}
                alt={`${selectedVariation.color || ""} ${
                  selectedVariation.size || ""
                }`.trim()}
                className="w-16 h-16 object-cover rounded border"
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ProductVariationSelector;
