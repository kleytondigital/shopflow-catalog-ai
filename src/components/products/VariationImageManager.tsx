
import React, { useState, useCallback } from "react";
import {
  Upload,
  X,
  Camera,
  ImageIcon,
  Palette,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useVariationDraftImages } from "@/hooks/useVariationDraftImages";
import { useSimpleDraftImages } from "@/hooks/useSimpleDraftImages";
import { useProductImages } from "@/hooks/useProductImages";
import { useToast } from "@/hooks/use-toast";
import { ProductVariation } from "@/types/variation";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface VariationImageManagerProps {
  productId?: string;
  variations: ProductVariation[];
  onImagesUpdated: (color: string, imageUrl: string) => void;
}

const VariationImageManager: React.FC<VariationImageManagerProps> = ({
  productId,
  variations,
  onImagesUpdated,
}) => {
  const { toast } = useToast();
  const [selectedVariationForImage, setSelectedVariationForImage] = useState<
    string | null
  >(null);
  const [showImageSelector, setShowImageSelector] = useState(false);

  const {
    addVariationImage,
    removeVariationImage,
    getVariationImage,
    uploadVariationImages,
  } = useVariationDraftImages();
  const { images: productImages } = useSimpleDraftImages();
  const { images: savedProductImages } = useProductImages(productId);

  // Combinar imagens do produto (draft + salvas)
  const allProductImages = React.useMemo(() => {
    const draftUrls = productImages
      .map((img) => img.url || img.preview)
      .filter(Boolean);
    const savedUrls = savedProductImages
      .map((img) => img.image_url)
      .filter(Boolean);

    // Remover duplicatas
    const uniqueUrls = [...new Set([...draftUrls, ...savedUrls])];
    return uniqueUrls;
  }, [productImages, savedProductImages]);

  // Filtrar apenas variações com cor
  const colorVariations = variations.filter((v) => v.color);

  // Agrupar variações por cor
  const variationsByColor = React.useMemo(() => {
    const grouped: Record<string, ProductVariation[]> = {};

    colorVariations.forEach((variation) => {
      const color = variation.color!.toLowerCase();
      if (!grouped[color]) {
        grouped[color] = [];
      }
      grouped[color].push(variation);
    });

    return grouped;
  }, [colorVariations]);

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
      const imageName = image.file?.name?.toLowerCase() || "";
      return keywords.some((keyword) => imageName.includes(keyword));
    });

    return matchingImage?.url || null;
  };

  // Função para aplicar imagem a todas as variações da mesma cor
  const applyImageToColorVariations = useCallback(
    (color: string, imageUrl: string) => {
      console.log(
        "🎨 APPLYING IMAGE - Aplicando imagem para cor:",
        color,
        "URL:",
        imageUrl
      );

      // Chamar o callback para atualizar o estado pai
      onImagesUpdated(color, imageUrl);

      toast({
        title: "Imagem aplicada",
        description: `Imagem aplicada para todas as variações da cor ${color}.`,
      });
    },
    [onImagesUpdated, toast]
  );

  const handleImageUpload = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>, color: string) => {
      const file = event.target.files?.[0];
      if (!file) return;

      try {
        // Adicionar imagem ao draft
        addVariationImage(color, file);

        // Aplicar a todas as variações da mesma cor
        const imageUrl = URL.createObjectURL(file);
        applyImageToColorVariations(color, imageUrl);

        toast({
          title: "Imagem adicionada",
          description: `Imagem da cor ${color} será enviada ao salvar o produto.`,
        });
      } catch (error) {
        toast({
          title: "Erro no upload",
          description: "Erro ao adicionar imagem da variação.",
          variant: "destructive",
        });
      }
    },
    [addVariationImage, applyImageToColorVariations, toast]
  );

  const handleImageSelect = useCallback(
    (imageUrl: string | null, color: string) => {
      if (imageUrl) {
        applyImageToColorVariations(color, imageUrl);
      } else {
        // Tentar encontrar imagem automática baseada na cor
        const matchingImage = findMatchingProductImage(color);
        if (matchingImage) {
          applyImageToColorVariations(color, matchingImage);
          toast({
            title: "Imagem automática",
            description: `Imagem ${color} aplicada automaticamente.`,
          });
        }
      }
    },
    [applyImageToColorVariations, findMatchingProductImage, toast]
  );

  // Função para abrir modal de seleção de imagens
  const handleOpenImageSelector = useCallback((color: string) => {
    setSelectedVariationForImage(color);
    setShowImageSelector(true);
  }, []);

  // Função para selecionar imagem da modal
  const handleSelectImageFromModal = useCallback(
    (imageUrl: string) => {
      if (selectedVariationForImage) {
        applyImageToColorVariations(selectedVariationForImage, imageUrl);
      }
      setShowImageSelector(false);
      setSelectedVariationForImage(null);
    },
    [selectedVariationForImage, applyImageToColorVariations]
  );

  const handleRemoveImage = useCallback(
    (color: string) => {
      const colorLower = color.toLowerCase();
      const variationsOfColor = variationsByColor[colorLower] || [];

      removeVariationImage(color);
      onImagesUpdated(color, "");

      toast({
        title: "Imagem removida",
        description: `Imagem da cor ${color} removida.`,
      });
    },
    [variationsByColor, removeVariationImage, onImagesUpdated, toast]
  );

  // Função para obter a imagem atual de uma cor
  const getCurrentImageForColor = useCallback(
    (color: string): string | null => {
      // Primeiro, verificar se há uma imagem salva nas variações
      const variationWithImage = variations.find(
        (v) =>
          v.color &&
          v.color.toLowerCase() === color.toLowerCase() &&
          v.image_url
      );

      if (variationWithImage?.image_url) {
        return variationWithImage.image_url;
      }

      // Se não houver, verificar no draft
      const draftImage = getVariationImage(color);
      return draftImage?.preview || draftImage?.file ? URL.createObjectURL(draftImage.file) : null;
    },
    [variations, getVariationImage]
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Object.keys(variationsByColor).map((color) => {
            const currentImage = getCurrentImageForColor(color);
            const variationsCount = variationsByColor[color].length;

            return (
              <Card key={color} className="border">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Palette className="h-4 w-4" />
                      <span className="font-medium capitalize">{color}</span>
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      {variationsCount} variações
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {currentImage ? (
                    <div className="relative">
                      <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden border">
                        <img
                          src={currentImage}
                          alt={`Variação ${color}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <Button
                        variant="destructive"
                        size="sm"
                        className="absolute top-2 right-2 h-6 w-6 p-0"
                        onClick={() => handleRemoveImage(color)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ) : (
                    <div className="aspect-square border-2 border-dashed rounded-lg flex flex-col items-center justify-center text-center p-4">
                      <Camera className="h-8 w-8 text-gray-400 mb-2" />
                      <p className="text-sm text-gray-500 mb-2">
                        Nenhuma imagem
                      </p>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleImageUpload(e, color)}
                        className="hidden"
                        id={`upload-${color}`}
                      />
                      <label
                        htmlFor={`upload-${color}`}
                        className="cursor-pointer"
                      >
                        <Button size="sm" variant="outline" asChild>
                          <span>
                            <Upload className="h-3 w-3 mr-1" />
                            Adicionar
                          </span>
                        </Button>
                      </label>
                    </div>
                  )}

                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1"
                      onClick={() => handleOpenImageSelector(color)}
                    >
                      Escolher Existente
                    </Button>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleImageUpload(e, color)}
                      className="hidden"
                      id={`upload-new-${color}`}
                    />
                    <label htmlFor={`upload-new-${color}`}>
                      <Button size="sm" variant="default" asChild>
                        <span>Nova Imagem</span>
                      </Button>
                    </label>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Modal de Seleção de Imagens */}
        <Dialog open={showImageSelector} onOpenChange={setShowImageSelector}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                Escolher Imagem para {selectedVariationForImage}
              </DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-3 gap-4 max-h-96 overflow-y-auto">
              {allProductImages.map((imageUrl, index) => (
                <div
                  key={index}
                  className="aspect-square bg-gray-100 rounded-lg overflow-hidden border cursor-pointer hover:border-primary"
                  onClick={() => handleSelectImageFromModal(imageUrl)}
                >
                  <img
                    src={imageUrl}
                    alt={`Opção ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
};

export default VariationImageManager;
