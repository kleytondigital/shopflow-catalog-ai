import React, { useState, useCallback, useEffect } from "react";
import { Upload, X, Camera } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useVariationImageUpload } from "@/hooks/useVariationImageUpload";
import { ProductVariation } from "@/types/variation";

interface VariationImageUploaderProps {
  productId?: string;
  variations: ProductVariation[];
  onImagesUpdated?: () => void;
}

interface ImagePreview {
  color: string;
  variationId: string;
  file?: File;
  imageUrl?: string;
  preview?: string;
  isUploading?: boolean;
}

const VariationImageUploader: React.FC<VariationImageUploaderProps> = ({
  productId,
  variations,
  onImagesUpdated,
}) => {
  const [imagePreviews, setImagePreviews] = useState<ImagePreview[]>([]);
  const {
    isUploading,
    uploadVariationImage,
    loadVariationImages,
    removeVariationImage,
  } = useVariationImageUpload();

  // Filtrar apenas variações com cor
  const colorVariations = variations.filter((v) => v.color && v.color.trim());

  // Carregar imagens existentes quando o componente é montado
  useEffect(() => {
    if (productId && colorVariations.length > 0) {
      loadExistingImages();
    }
  }, [productId, colorVariations.length]);

  const loadExistingImages = async () => {
    if (!productId) return;

    const imageMap = await loadVariationImages(productId);

    // Criar previews para todas as cores, com ou sem imagem
    const previews: ImagePreview[] = colorVariations.map((variation) => ({
      color: variation.color!,
      variationId: variation.id!,
      imageUrl: imageMap[variation.color!],
    }));

    setImagePreviews(previews);
  };

  const handleImageSelect = useCallback(
    (
      event: React.ChangeEvent<HTMLInputElement>,
      color: string,
      variationId: string
    ) => {
      const file = event.target.files?.[0];
      if (!file) return;

      // Validar tipo de arquivo
      if (!file.type.startsWith("image/")) {
        return;
      }

      // Criar preview
      const reader = new FileReader();
      reader.onload = (e) => {
        const preview = e.target?.result as string;

        setImagePreviews((prev) =>
          prev.map((img) =>
            img.color === color
              ? { ...img, file, preview, imageUrl: undefined }
              : img
          )
        );
      };
      reader.readAsDataURL(file);

      // Reset do input
      event.target.value = "";
    },
    []
  );

  const handleUploadImage = async (color: string, variationId: string) => {
    const imagePreview = imagePreviews.find((img) => img.color === color);
    if (!imagePreview?.file || !productId) return;

    // Marcar como fazendo upload
    setImagePreviews((prev) =>
      prev.map((img) =>
        img.color === color ? { ...img, isUploading: true } : img
      )
    );

    try {
      const uploadedUrl = await uploadVariationImage(
        productId,
        variationId,
        imagePreview.file,
        color
      );

      if (uploadedUrl) {
        // Atualizar com a URL definitiva
        setImagePreviews((prev) =>
          prev.map((img) =>
            img.color === color
              ? {
                  ...img,
                  file: undefined,
                  preview: undefined,
                  imageUrl: uploadedUrl,
                  isUploading: false,
                }
              : img
          )
        );

        onImagesUpdated?.();
      }
    } catch (error) {
      console.error("Erro no upload:", error);
    } finally {
      // Remover estado de upload
      setImagePreviews((prev) =>
        prev.map((img) =>
          img.color === color ? { ...img, isUploading: false } : img
        )
      );
    }
  };

  const handleRemoveImage = async (color: string, variationId: string) => {
    const imagePreview = imagePreviews.find((img) => img.color === color);
    if (!imagePreview) return;

    // Se tem arquivo local (não enviado), apenas remover preview
    if (imagePreview.file) {
      setImagePreviews((prev) =>
        prev.map((img) =>
          img.color === color
            ? { ...img, file: undefined, preview: undefined }
            : img
        )
      );
      return;
    }

    // Se tem URL (já enviada), remover do servidor
    if (imagePreview.imageUrl) {
      const success = await removeVariationImage(
        variationId,
        imagePreview.imageUrl
      );
      if (success) {
        setImagePreviews((prev) =>
          prev.map((img) =>
            img.color === color ? { ...img, imageUrl: undefined } : img
          )
        );
        onImagesUpdated?.();
      }
    }
  };

  if (colorVariations.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Camera className="h-5 w-5" />
            Imagens das Variações
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Nenhuma variação de cor encontrada. Adicione variações de cor para
            fazer upload de imagens específicas.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Camera className="h-5 w-5" />
          Imagens das Variações
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Faça upload de imagens específicas para cada cor do produto
        </p>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {imagePreviews.map((imagePreview) => (
            <div key={imagePreview.color} className="space-y-2">
              <div className="flex items-center justify-between">
                <Badge variant="outline" className="text-xs">
                  {imagePreview.color}
                </Badge>
                {(imagePreview.file || imagePreview.imageUrl) && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      handleRemoveImage(
                        imagePreview.color,
                        imagePreview.variationId
                      )
                    }
                    disabled={imagePreview.isUploading}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>

              <div className="relative">
                {/* Preview da imagem */}
                {imagePreview.preview || imagePreview.imageUrl ? (
                  <div className="relative aspect-square rounded-lg overflow-hidden border">
                    <img
                      src={imagePreview.preview || imagePreview.imageUrl}
                      alt={`Cor ${imagePreview.color}`}
                      className="w-full h-full object-cover"
                    />
                    {imagePreview.isUploading && (
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                        <div className="text-white text-sm">Enviando...</div>
                      </div>
                    )}
                  </div>
                ) : (
                  /* Área de upload */
                  <div className="aspect-square border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center hover:border-gray-400 transition-colors">
                    <div className="text-center">
                      <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-500">
                        Clique para adicionar
                      </p>
                    </div>
                  </div>
                )}

                {/* Input de arquivo */}
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) =>
                    handleImageSelect(
                      e,
                      imagePreview.color,
                      imagePreview.variationId
                    )
                  }
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  disabled={imagePreview.isUploading}
                />
              </div>

              {/* Botão de upload para arquivo selecionado */}
              {imagePreview.file && productId && (
                <Button
                  size="sm"
                  onClick={() =>
                    handleUploadImage(
                      imagePreview.color,
                      imagePreview.variationId
                    )
                  }
                  disabled={imagePreview.isUploading || isUploading}
                  className="w-full"
                >
                  {imagePreview.isUploading ? "Enviando..." : "Enviar Imagem"}
                </Button>
              )}

              {/* Indicador de imagem salva */}
              {imagePreview.imageUrl && !imagePreview.file && (
                <div className="text-center">
                  <Badge variant="secondary" className="text-xs">
                    ✓ Salva
                  </Badge>
                </div>
              )}
            </div>
          ))}
        </div>

        {!productId && (
          <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-lg">
            <p className="text-sm text-amber-800">
              💡 Salve o produto primeiro para fazer upload de imagens das
              variações
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default VariationImageUploader;
