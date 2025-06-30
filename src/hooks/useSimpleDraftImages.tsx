import { useState, useCallback, useRef, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface SimpleDraftImage {
  id: string;
  file?: File;
  preview: string;
  uploaded?: boolean;
  url?: string;
  isExisting?: boolean;
}

export const useSimpleDraftImages = () => {
  const [images, setImages] = useState<SimpleDraftImage[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const blobUrlsRef = useRef<Set<string>>(new Set());
  const loadedProductIdRef = useRef<string | null>(null);
  const { toast } = useToast();

  // Cleanup seguro das blob URLs
  const revokeBlobUrl = useCallback((url: string) => {
    if (url?.startsWith("blob:") && blobUrlsRef.current.has(url)) {
      try {
        URL.revokeObjectURL(url);
        blobUrlsRef.current.delete(url);
        console.log("🗑️ Blob URL revogada:", url.substring(0, 50) + "...");
      } catch (error) {
        console.warn("Erro ao revogar blob URL:", error);
      }
    }
  }, []);

  // Cleanup automático apenas no unmount
  useEffect(() => {
    return () => {
      console.log(
        "🧹 Limpeza final - revogando",
        blobUrlsRef.current.size,
        "blob URLs"
      );
      blobUrlsRef.current.forEach((url) => {
        try {
          URL.revokeObjectURL(url);
        } catch (error) {
          console.warn("Erro na limpeza final:", error);
        }
      });
      blobUrlsRef.current.clear();
    };
  }, []);

  const createBlobUrl = useCallback((file: File): string => {
    const url = URL.createObjectURL(file);
    blobUrlsRef.current.add(url);
    console.log("🔗 Nova blob URL criada:", url.substring(0, 50) + "...");
    return url;
  }, []);

  const addImages = useCallback(
    (files: File[]) => {
      console.log("📷 Adicionando", files.length, "imagens");

      const newImages: SimpleDraftImage[] = files.map((file) => {
        const preview = createBlobUrl(file);
        return {
          id: `draft-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          file,
          preview,
          uploaded: false,
          isExisting: false,
        };
      });

      setImages((prev) => {
        const updated = [...prev, ...newImages];
        console.log("📊 Total de imagens após adição:", updated.length);
        return updated;
      });

      return newImages;
    },
    [createBlobUrl]
  );

  const removeImage = useCallback(
    (id: string) => {
      console.log("🗑️ Removendo imagem:", id);

      setImages((prev) => {
        const imageToRemove = prev.find((img) => img.id === id);

        if (
          imageToRemove?.preview &&
          imageToRemove.preview.startsWith("blob:")
        ) {
          revokeBlobUrl(imageToRemove.preview);
        }

        const filtered = prev.filter((img) => img.id !== id);
        console.log("📊 Imagens restantes:", filtered.length);
        return filtered;
      });
    },
    [revokeBlobUrl]
  );

  const uploadImages = useCallback(
    async (productId: string): Promise<string[]> => {
      if (!productId || images.length === 0 || isUploading) {
        console.log("⏭️ Upload pulado:", {
          productId,
          imagesCount: images.length,
          isUploading,
        });
        return [];
      }

      setIsUploading(true);
      const uploadedUrls: string[] = [];

      try {
        console.log(
          "📤 Iniciando upload de",
          images.length,
          "imagens para produto:",
          productId
        );

        // Remover imagens existentes
        await supabase
          .from("product_images")
          .delete()
          .eq("product_id", productId);

        const { data: existingFiles } = await supabase.storage
          .from("product-images")
          .list(productId);

        if (existingFiles?.length) {
          const filesToDelete = existingFiles.map(
            (file) => `${productId}/${file.name}`
          );
          await supabase.storage.from("product-images").remove(filesToDelete);
        }

        // Upload novas imagens (apenas as que têm arquivo)
        const imagesToUpload = images.filter((img) => img.file);
        console.log(
          "📤 Fazendo upload de",
          imagesToUpload.length,
          "imagens novas"
        );

        for (let i = 0; i < imagesToUpload.length; i++) {
          const image = imagesToUpload[i];
          const fileExt = image.file!.name.split(".").pop();
          const fileName = `${productId}/${Date.now()}-${i}.${fileExt}`;

          const { data: uploadData, error: uploadError } =
            await supabase.storage
              .from("product-images")
              .upload(fileName, image.file!);

          if (uploadError) {
            console.error("Erro no upload da imagem", i, ":", uploadError);
            continue;
          }

          const { data: urlData } = supabase.storage
            .from("product-images")
            .getPublicUrl(uploadData.path);

          const imageUrl = urlData.publicUrl;
          uploadedUrls.push(imageUrl);

          await supabase.from("product_images").insert({
            product_id: productId,
            image_url: imageUrl,
            image_order: i + 1,
            is_primary: i === 0,
            alt_text: `Imagem ${i + 1} do produto`,
          });

          console.log(
            "✅ Imagem",
            i + 1,
            "enviada:",
            imageUrl.substring(0, 50) + "..."
          );
        }

        // Atualizar imagem principal do produto
        if (uploadedUrls.length > 0) {
          await supabase
            .from("products")
            .update({ image_url: uploadedUrls[0] })
            .eq("id", productId);
        }

        toast({
          title: "Sucesso!",
          description: `${uploadedUrls.length} imagem(ns) enviada(s) com sucesso`,
        });

        console.log("🎉 Upload concluído:", uploadedUrls.length, "imagens");
        return uploadedUrls;
      } catch (error) {
        console.error("💥 Erro no upload:", error);
        toast({
          title: "Erro no upload",
          description: "Falha no processo de upload das imagens",
          variant: "destructive",
        });
        return [];
      } finally {
        setIsUploading(false);
      }
    },
    [images, toast, isUploading]
  );

  const loadExistingImages = useCallback(
    async (productId: string) => {
      // Evitar chamadas duplicadas para o mesmo produto
      if (!productId || isLoading || loadedProductIdRef.current === productId) {
        console.log("🚫 Carregamento de imagens ignorado:", {
          productId,
          isLoading,
          alreadyLoaded: loadedProductIdRef.current === productId,
        });
        return;
      }

      setIsLoading(true);
      loadedProductIdRef.current = productId;
      console.log("📥 Carregando imagens existentes para produto:", productId);

      try {
        const { data: productImages, error } = await supabase
          .from("product_images")
          .select("*")
          .eq("product_id", productId)
          .order("image_order");

        if (error) {
          console.error("Erro ao carregar imagens:", error);
          return;
        }

        if (productImages && productImages.length > 0) {
          const existingImages: SimpleDraftImage[] = productImages.map(
            (img) => ({
              id: `existing-${img.id}`,
              preview: img.image_url,
              url: img.image_url,
              uploaded: true,
              isExisting: true,
            })
          );

          // Manter as imagens existentes sem limpar imagens novas já adicionadas
          setImages((prev) => {
            // Filtrar imagens existentes antigas e manter apenas as novas (não enviadas)
            const newImages = prev.filter((img) => !img.isExisting);
            console.log("📊 Mesclando imagens:", {
              existing: existingImages.length,
              new: newImages.length,
              total: existingImages.length + newImages.length,
            });
            return [...existingImages, ...newImages];
          });

          console.log(
            "✅ Carregadas",
            existingImages.length,
            "imagens existentes"
          );
        } else {
          console.log("📭 Nenhuma imagem existente encontrada");
        }
      } catch (error) {
        console.error("💥 Erro no carregamento de imagens:", error);
      } finally {
        setIsLoading(false);
      }
    },
    [isLoading]
  );

  const clearImages = useCallback(() => {
    console.log("🧹 Limpando imagens. Total atual:", images.length);

    // Revogar apenas blob URLs de imagens não enviadas
    images.forEach((img) => {
      if (img.preview?.startsWith("blob:") && !img.uploaded) {
        revokeBlobUrl(img.preview);
      }
    });

    setImages([]);
    loadedProductIdRef.current = null;
    console.log("✅ Imagens limpa");
  }, [images, revokeBlobUrl]);

  // Função para fazer upload apenas das imagens novas (preservando existentes)
  const uploadNewImages = useCallback(
    async (productId: string): Promise<string[]> => {
      if (!productId || isUploading) {
        console.log("⏭️ Upload de novas imagens pulado:", {
          productId,
          isUploading,
        });
        return [];
      }

      const newImages = images.filter((img) => img.file && !img.uploaded);
      if (newImages.length === 0) {
        console.log("📭 Nenhuma imagem nova para upload");
        return [];
      }

      setIsUploading(true);
      const uploadedUrls: string[] = [];

      try {
        console.log(
          "📤 Iniciando upload de",
          newImages.length,
          "imagens novas para produto:",
          productId
        );

        // Obter a maior ordem atual
        const { data: maxOrderData } = await supabase
          .from("product_images")
          .select("image_order")
          .eq("product_id", productId)
          .order("image_order", { ascending: false })
          .limit(1);

        let nextOrder = (maxOrderData?.[0]?.image_order || 0) + 1;

        // Upload apenas das novas imagens
        for (let i = 0; i < newImages.length; i++) {
          const image = newImages[i];
          const fileExt = image.file!.name.split(".").pop();
          const fileName = `${productId}/${Date.now()}-${i}.${fileExt}`;

          const { data: uploadData, error: uploadError } =
            await supabase.storage
              .from("product-images")
              .upload(fileName, image.file!);

          if (uploadError) {
            console.error("Erro no upload da imagem", i, ":", uploadError);
            continue;
          }

          const { data: urlData } = supabase.storage
            .from("product-images")
            .getPublicUrl(uploadData.path);

          const imageUrl = urlData.publicUrl;
          uploadedUrls.push(imageUrl);

          await supabase.from("product_images").insert({
            product_id: productId,
            image_url: imageUrl,
            image_order: nextOrder + i,
            is_primary: false, // Não sobrescrever imagem principal
            alt_text: `Imagem ${nextOrder + i} do produto`,
          });

          console.log(
            "✅ Nova imagem",
            i + 1,
            "enviada:",
            imageUrl.substring(0, 50) + "..."
          );
        }

        toast({
          title: "Sucesso!",
          description: `${uploadedUrls.length} nova(s) imagem(ns) adicionada(s)`,
        });

        console.log(
          "🎉 Upload de novas imagens concluído:",
          uploadedUrls.length
        );
        return uploadedUrls;
      } catch (error) {
        console.error("💥 Erro no upload de novas imagens:", error);
        toast({
          title: "Erro no upload",
          description: "Falha no upload das novas imagens",
          variant: "destructive",
        });
        return [];
      } finally {
        setIsUploading(false);
      }
    },
    [images, toast, isUploading]
  );

  return {
    images,
    isUploading,
    isLoading,
    addImages,
    removeImage,
    uploadImages, // Upload completo (limpa e refaz tudo)
    uploadNewImages, // Upload apenas de novas (preserva existentes)
    loadExistingImages,
    clearImages,
  };
};
