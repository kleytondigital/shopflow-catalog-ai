import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Eye,
  Package,
  Palette,
  ShoppingCart,
  Star,
  Info,
  Shirt,
  Grid,
  List,
  Monitor,
  Smartphone,
} from "lucide-react";
import { ProductVariation } from "@/types/product";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface VariationPreviewProps {
  variations: ProductVariation[];
  productName?: string;
  productPrice?: number;
  productImage?: string;
  showPreview?: boolean;
  onTogglePreview?: () => void;
}

const VariationPreview: React.FC<VariationPreviewProps> = ({
  variations,
  productName = "Produto de Exemplo",
  productPrice = 99.9,
  productImage = "/placeholder.svg",
  showPreview = true,
  onTogglePreview,
}) => {
  const [viewMode, setViewMode] = useState<"desktop" | "mobile">("desktop");
  const [selectedVariation, setSelectedVariation] =
    useState<ProductVariation | null>(null);

  // Agrupar variações por cor (para produtos com grade)
  const groupedVariations = variations.reduce((acc, variation) => {
    const key = variation.color || "Sem cor";
    if (!acc[key]) {
      acc[key] = [];
    }
    acc[key].push(variation);
    return acc;
  }, {} as Record<string, ProductVariation[]>);

  // Detectar se são variações de grade
  const hasGradeVariations = variations.some(
    (v) => v.variation_type === "grade" || v.is_grade
  );

  const renderProductCard = () => (
    <div
      className={`border rounded-lg overflow-hidden bg-white shadow-sm ${
        viewMode === "mobile" ? "max-w-xs" : "max-w-sm"
      }`}
    >
      {/* Imagem do produto */}
      <div className="aspect-square bg-gray-100 flex items-center justify-center">
        <img
          src={productImage}
          alt={productName}
          className="w-full h-full object-cover"
          onError={(e) => {
            e.currentTarget.src = "/placeholder.svg";
          }}
        />
      </div>

      {/* Informações do produto */}
      <div className="p-4 space-y-3">
        <div>
          <h3 className="font-medium text-gray-900 line-clamp-2">
            {productName}
          </h3>
          <div className="flex items-center gap-1 mt-1">
            <Star className="w-4 h-4 text-yellow-400 fill-current" />
            <span className="text-sm text-gray-600">4.5 (123)</span>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <span className="text-lg font-bold text-gray-900">
              R$ {productPrice.toFixed(2)}
            </span>
            <span className="text-sm text-gray-500 line-through ml-2">
              R$ {(productPrice * 1.2).toFixed(2)}
            </span>
          </div>
          <Badge variant="secondary" className="text-xs">
            {variations.length} variações
          </Badge>
        </div>

        {/* Variações */}
        {variations.length > 0 && (
          <div className="space-y-2">
            {hasGradeVariations ? (
              // Preview para produtos com grade
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">
                  Disponível em:
                </h4>
                <div className="space-y-2">
                  {Object.entries(groupedVariations).map(
                    ([color, colorVariations]) => (
                      <div
                        key={color}
                        className="flex items-center justify-between"
                      >
                        <div className="flex items-center gap-2">
                          <div
                            className="w-4 h-4 rounded-full border border-gray-300"
                            style={{
                              backgroundColor:
                                colorVariations[0]?.hex_color || "#000000",
                            }}
                          />
                          <span className="text-sm">{color}</span>
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {colorVariations.map((variation) => (
                            <Badge
                              key={variation.id}
                              variant="outline"
                              className="text-xs"
                            >
                              {variation.grade_name || "Grade"}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )
                  )}
                </div>
              </div>
            ) : (
              // Preview para variações tradicionais
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">
                  Cores disponíveis:
                </h4>
                <div className="flex flex-wrap gap-1">
                  {Array.from(
                    new Set(variations.map((v) => v.color).filter(Boolean))
                  ).map((color) => (
                    <div
                      key={color}
                      className="w-6 h-6 rounded-full border border-gray-300 cursor-pointer hover:scale-110 transition-transform"
                      style={{
                        backgroundColor:
                          variations.find((v) => v.color === color)
                            ?.hex_color || "#000000",
                      }}
                      title={color}
                    />
                  ))}
                </div>

                {Array.from(
                  new Set(variations.map((v) => v.size).filter(Boolean))
                ).length > 0 && (
                  <div className="mt-2">
                    <h4 className="text-sm font-medium text-gray-700 mb-1">
                      Tamanhos:
                    </h4>
                    <div className="flex flex-wrap gap-1">
                      {Array.from(
                        new Set(variations.map((v) => v.size).filter(Boolean))
                      ).map((size) => (
                        <Badge key={size} variant="outline" className="text-xs">
                          {size}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Botão de compra */}
        <Button className="w-full" size="sm">
          <ShoppingCart className="w-4 h-4 mr-2" />
          Adicionar ao Carrinho
        </Button>
      </div>
    </div>
  );

  const renderVariationsList = () => (
    <div className="space-y-2">
      <h4 className="font-medium text-gray-900">
        Variações Criadas ({variations.length})
      </h4>
      <div className="max-h-60 overflow-y-auto space-y-1">
        {variations.map((variation, index) => (
          <div
            key={variation.id || index}
            className={`p-2 border rounded-lg text-sm cursor-pointer transition-colors ${
              selectedVariation?.id === variation.id
                ? "border-blue-500 bg-blue-50"
                : "border-gray-200 hover:border-gray-300"
            }`}
            onClick={() => setSelectedVariation(variation)}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {variation.color && (
                  <div
                    className="w-3 h-3 rounded-full border"
                    style={{
                      backgroundColor: variation.hex_color || "#000000",
                    }}
                  />
                )}
                <span className="font-medium">
                  {variation.name ||
                    `${variation.color || "Sem cor"} ${
                      variation.size || variation.grade_name || ""
                    }`.trim()}
                </span>
              </div>
              <div className="flex items-center gap-2">
                {variation.is_grade && (
                  <Badge variant="secondary" className="text-xs">
                    Grade
                  </Badge>
                )}
                <span className="text-xs text-gray-500">
                  Estoque: {variation.stock || 0}
                </span>
              </div>
            </div>

            {variation.is_grade && variation.grade_sizes && (
              <div className="mt-1 text-xs text-gray-600">
                Tamanhos: {variation.grade_sizes.join(", ")}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );

  if (!showPreview) {
    return null;
  }

  return (
    <Card className="border-green-200 bg-green-50">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Eye className="w-5 h-5 text-green-600" />
            Preview do Catálogo
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                setViewMode(viewMode === "desktop" ? "mobile" : "desktop")
              }
            >
              {viewMode === "desktop" ? (
                <Smartphone className="w-4 h-4" />
              ) : (
                <Monitor className="w-4 h-4" />
              )}
            </Button>
            {onTogglePreview && (
              <Button variant="outline" size="sm" onClick={onTogglePreview}>
                Ocultar
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {variations.length === 0 ? (
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              Nenhuma variação criada ainda. Configure as variações para ver o
              preview.
            </AlertDescription>
          </Alert>
        ) : (
          <Tabs defaultValue="preview" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="preview">Como Aparece</TabsTrigger>
              <TabsTrigger value="list">Lista de Variações</TabsTrigger>
            </TabsList>

            <TabsContent value="preview" className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <Badge variant="outline">
                  {viewMode === "desktop" ? "Desktop" : "Mobile"}
                </Badge>
                <span className="text-sm text-gray-600">
                  Assim seu produto aparece no catálogo
                </span>
              </div>

              <div className="flex justify-center">{renderProductCard()}</div>

              {hasGradeVariations && (
                <Alert>
                  <Package className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Produto com Grade:</strong> Clientes verão as cores
                    disponíveis e poderão escolher a grade desejada. Cada grade
                    contém múltiplos tamanhos.
                  </AlertDescription>
                </Alert>
              )}
            </TabsContent>

            <TabsContent value="list" className="space-y-4">
              {renderVariationsList()}

              {selectedVariation && (
                <Card className="border-blue-200 bg-blue-50">
                  <CardContent className="pt-4">
                    <h5 className="font-medium mb-2">Detalhes da Variação</h5>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="text-gray-600">Nome:</span>
                        <span className="ml-2 font-medium">
                          {selectedVariation.name || "Sem nome"}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-600">SKU:</span>
                        <span className="ml-2 font-medium">
                          {selectedVariation.sku || "Não definido"}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-600">Estoque:</span>
                        <span className="ml-2 font-medium">
                          {selectedVariation.stock || 0}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-600">Preço:</span>
                        <span className="ml-2 font-medium">
                          {selectedVariation.price_adjustment
                            ? `+R$ ${selectedVariation.price_adjustment.toFixed(
                                2
                              )}`
                            : "Sem ajuste"}
                        </span>
                      </div>
                      {selectedVariation.is_grade && (
                        <>
                          <div>
                            <span className="text-gray-600">Grade:</span>
                            <span className="ml-2 font-medium">
                              {selectedVariation.grade_name || "Sem nome"}
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-600">Tamanhos:</span>
                            <span className="ml-2 font-medium">
                              {selectedVariation.grade_sizes?.join(", ") ||
                                "Não definido"}
                            </span>
                          </div>
                        </>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        )}
      </CardContent>
    </Card>
  );
};

export default VariationPreview;
