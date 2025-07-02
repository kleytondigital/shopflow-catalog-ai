import React, { useState, useCallback, useEffect } from "react";
import { Upload, X, Camera, ImageIcon, Palette, Shirt } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useVariationDraftImages } from "@/hooks/useVariationDraftImages";
import { useSimpleDraftImages } from "@/hooks/useSimpleDraftImages";
import { useToast } from "@/hooks/use-toast";
import { ProductVariation } from "@/types/variation";

interface VariationImageManagerProps {
  variations: ProductVariation[];
  onImagesUpdated: (variationId: string, imageUrl: string) => void;
}

const VariationImageManager: React.FC<VariationImageManagerProps> = ({
  variations,
  onImagesUpdated,
}) => {
  const { toast } = useToast();
  const {
    draftImages,
    uploadVariationImage,
    removeVariationImage,
    getImageForColor,
  } = useVariationDraftImages();
  const { images: productImages } = useSimpleDraftImages();

  // Filtrar apenas variações com cor
  const colorVariations = variations.filter((v) => v.color);

  // Mapeamento de cores para palavras-chave nas imagens
  const colorKeywords: Record<string, string[]> = {
    azul: ["azul", "blue", "azul"],
    preto: ["preto", "black", "negro", "preta"],
    branco: ["branco", "white", "blanco", "branca"],
    rosa: ["rosa", "pink", "rosa"],
    verde: ["verde", "green", "verde"],
    vermelho: ["vermelho", "red", "rojo", "vermelha"],
    amarelo: ["amarelo", "yellow", "amarillo", "amarela"],
    laranja: ["laranja", "orange", "naranja"],
    roxo: ["roxo", "purple", "morado", "roxa"],
    cinza: ["cinza", "gray", "gris", "cinza"],
  };

  // Encontrar imagem principal que corresponde à cor da variação
  const findMatchingProductImage = (color: string): string | null => {
    if (!color || !productImages.length) return null;

    const colorLower = color.toLowerCase();
    const keywords = colorKeywords[colorLower] || [colorLower];

    // Procurar por imagem que contenha a palavra-chave da cor
    const matchingImage = productImages.find((image) => {
      const imageName = image.name?.toLowerCase() || "";
      return keywords.some((keyword) => imageName.includes(keyword));
    });

    return matchingImage?.url || null;
  };

  const handleImageUpload = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>, variationId: string) => {
      const file = event.target.files?.[0];
      if (!file) return;

      try {
        const imageUrl = await uploadVariationImage(file, variationId);
        onImagesUpdated(variationId, imageUrl);

        toast({
          title: "Imagem enviada",
          description: "Imagem da variação enviada com sucesso.",
        });
      } catch (error) {
        toast({
          title: "Erro no upload",
          description: "Erro ao enviar imagem da variação.",
          variant: "destructive",
        });
      }
    },
    [uploadVariationImage, onImagesUpdated, toast]
  );

  const handleImageSelect = useCallback(
    (imageUrl: string | null, color: string, variationId: string) => {
      if (imageUrl) {
        onImagesUpdated(variationId, imageUrl);
        toast({
          title: "Imagem selecionada",
          description: `Imagem ${color} selecionada para a variação.`,
        });
      } else {
        // Tentar encontrar imagem automática baseada na cor
        const matchingImage = findMatchingProductImage(color);
        if (matchingImage) {
          onImagesUpdated(variationId, matchingImage);
          toast({
            title: "Imagem automática",
            description: `Imagem ${color} aplicada automaticamente.`,
          });
        }
      }
    },
    [onImagesUpdated, toast, findMatchingProductImage]
  );

  const handleRemoveImage = useCallback(
    (variationId: string) => {
      removeVariationImage(variationId);
      onImagesUpdated(variationId, "");

      toast({
        title: "Imagem removida",
        description: "Imagem da variação removida.",
      });
    },
    [removeVariationImage, onImagesUpdated, toast]
  );

  if (colorVariations.length === 0) {
    return (
      <Card>
        <CardContent className="p-4 text-center text-gray-500">
          <ImageIcon className="h-8 w-8 mx-auto mb-2 opacity-50" />
          <p>Nenhuma variação com cor encontrada</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ImageIcon className="h-5 w-5" />
          Gerenciar Imagens das Variações
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {colorVariations.map((variation) => {
          const currentImage = getImageForColor(variation.color!);
          const suggestedImage = findMatchingProductImage(variation.color!);

          return (
            <div key={variation.id} className="border rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Badge variant="outline">{variation.color}</Badge>
                  {variation.size && (
                    <Badge variant="secondary">{variation.size}</Badge>
                  )}
                </div>
              </div>

              {/* Imagem Atual */}
              {currentImage && (
                <div className="relative mb-3">
                  <img
                    src={currentImage}
                    alt={`Variação ${variation.color}`}
                    className="w-full h-24 object-cover rounded border"
                  />
                  <Button
                    size="sm"
                    variant="destructive"
                    className="absolute top-2 right-2 h-6 w-6 p-0"
                    onClick={() => handleRemoveImage(variation.id!)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              )}

              {/* Botões de Ação */}
              <div className="flex flex-wrap gap-2">
                {/* Upload de Nova Imagem */}
                <div className="relative">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleImageUpload(e, variation.id!)}
                    className="hidden"
                    id={`variation-upload-${variation.id}`}
                  />
                  <label
                    htmlFor={`variation-upload-${variation.id}`}
                    className="cursor-pointer"
                  >
                    <Button size="sm" variant="outline" className="h-8">
                      <Upload className="h-3 w-3 mr-1" />
                      Upload
                    </Button>
                  </label>
                </div>

                {/* Selecionar das Imagens Principais */}
                {productImages.length > 0 && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-8"
                    onClick={() =>
                      handleImageSelect(null, variation.color!, variation.id!)
                    }
                  >
                    <Palette className="h-3 w-3 mr-1" />
                    Reaproveitar
                  </Button>
                )}

                {/* Sugestão Automática */}
                {suggestedImage && !currentImage && (
                  <Button
                    size="sm"
                    variant="secondary"
                    className="h-8"
                    onClick={() =>
                      handleImageSelect(
                        suggestedImage,
                        variation.color!,
                        variation.id!
                      )
                    }
                  >
                    <Shirt className="h-3 w-3 mr-1" />
                    Usar {variation.color}
                  </Button>
                )}
              </div>
            </div>
          );
        })}

        {/* Dica de Reaproveitamento */}
        {productImages.length > 0 && (
          <div className="text-xs text-gray-600 bg-blue-50 p-3 rounded">
            💡 <strong>Dica:</strong> Você pode reaproveitar as imagens
            principais do produto para as variações. O sistema tentará encontrar
            automaticamente a imagem que corresponde à cor da variação.
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default VariationImageManager;
