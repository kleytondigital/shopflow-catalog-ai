import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface VariationImageData {
  variationId: string;
  color: string;
  image?: File;
  imageUrl?: string;
  preview?: string;
}

export const useVariationImageUpload = () => {
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();

  const uploadVariationImage = useCallback(
    async (
      productId: string,
      variationId: string,
      file: File,
      color: string
    ): Promise<string | null> => {
      if (!file || !productId || !variationId) {
        return null;
      }

      setIsUploading(true);
      try {
        // Gerar nome do arquivo baseado na cor e timestamp
        const fileExt = file.name.split(".").pop();
        const colorSlug = color
          .toLowerCase()
          .replace(/\s+/g, "-")
          .replace(/[^a-z0-9-]/g, "");
        const fileName = `${productId}/variations/${colorSlug}-${Date.now()}.${fileExt}`;

        // Upload do arquivo
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from("product-images")
          .upload(fileName, file);

        if (uploadError) {
          throw new Error(`Erro no upload: ${uploadError.message}`);
        }

        // Obter URL pública
        const { data: urlData } = supabase.storage
          .from("product-images")
          .getPublicUrl(uploadData.path);

        const imageUrl = urlData.publicUrl;

        // Atualizar a variação com a URL da imagem
        const { error: updateVariationError } = await supabase
          .from("product_variations")
          .update({ image_url: imageUrl })
          .eq("id", variationId);

        if (updateVariationError) {
          throw new Error(
            `Erro ao associar imagem: ${updateVariationError.message}`
          );
        }

        toast({
          title: "Sucesso!",
          description: `Imagem da cor ${color} enviada com sucesso`,
        });

        return imageUrl;
      } catch (error) {
        console.error("💥 Erro no upload da imagem da variação:", error);
        toast({
          title: "Erro no upload",
          description:
            error instanceof Error
              ? error.message
              : "Falha no upload da imagem",
          variant: "destructive",
        });
        return null;
      } finally {
        setIsUploading(false);
      }
    },
    [toast]
  );

  const loadVariationImages = useCallback(async (productId: string) => {
    try {
      // Buscar URLs diretamente nas variações
      const { data: variations, error: variationsError } = await supabase
        .from("product_variations")
        .select("id, color, image_url")
        .eq("product_id", productId)
        .not("image_url", "is", null);

      if (variationsError) {
        console.error(
          "Erro ao carregar imagens das variações:",
          variationsError
        );
        return {};
      }

      // Criar mapa color -> imageUrl
      const imageMap: Record<string, string> = {};
      variations?.forEach((variation) => {
        if (variation.color && variation.image_url) {
          imageMap[variation.color] = variation.image_url;
        }
      });

      return imageMap;
    } catch (error) {
      console.error("💥 Erro ao carregar imagens das variações:", error);
      return {};
    }
  }, []);

  const removeVariationImage = useCallback(
    async (variationId: string, imageUrl: string): Promise<boolean> => {
      try {
        // Remover da variação
        const { error: updateError } = await supabase
          .from("product_variations")
          .update({ image_url: null })
          .eq("id", variationId);

        if (updateError) {
          throw new Error(`Erro ao remover imagem: ${updateError.message}`);
        }

        // Tentar remover arquivo do storage
        if (imageUrl) {
          const pathMatch = imageUrl.match(/\/product-images\/(.+)$/);
          if (pathMatch) {
            await supabase.storage
              .from("product-images")
              .remove([pathMatch[1]]);
          }
        }

        toast({
          title: "Sucesso!",
          description: "Imagem da variação removida",
        });

        return true;
      } catch (error) {
        console.error("💥 Erro ao remover imagem da variação:", error);
        toast({
          title: "Erro",
          description: "Falha ao remover imagem da variação",
          variant: "destructive",
        });
        return false;
      }
    },
    [toast]
  );

  return {
    isUploading,
    uploadVariationImage,
    loadVariationImages,
    removeVariationImage,
  };
};
