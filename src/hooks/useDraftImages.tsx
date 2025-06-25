
import { useState, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface DraftImage {
  id: string;
  file: File;
  preview: string;
  uploaded?: boolean;
  url?: string;
}

export const useDraftImages = () => {
  const [draftImages, setDraftImages] = useState<DraftImage[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const loadedProductIdRef = useRef<string | null>(null);
  const { toast } = useToast();

  const addDraftImages = useCallback((files: File[]) => {
    const newImages: DraftImage[] = files.map((file) => ({
      id: Math.random().toString(36).substr(2, 9),
      file,
      preview: URL.createObjectURL(file),
      uploaded: false
    }));
    
    setDraftImages(prev => [...prev, ...newImages]);
  }, []);

  const removeDraftImage = useCallback((id: string) => {
    setDraftImages(prev => {
      const imageToRemove = prev.find(img => img.id === id);
      if (imageToRemove && imageToRemove.preview) {
        URL.revokeObjectURL(imageToRemove.preview);
      }
      return prev.filter(img => img.id !== id);
    });
  }, []);

  const uploadDraftImages = useCallback(async (productId: string): Promise<string[]> => {
    if (draftImages.length === 0) return [];

    setIsUploading(true);
    const uploadedUrls: string[] = [];

    try {
      for (let i = 0; i < draftImages.length; i++) {
        const image = draftImages[i];
        
        if (image.uploaded && image.url) {
          uploadedUrls.push(image.url);
          continue;
        }

        const fileExt = image.file.name.split('.').pop();
        const fileName = `${productId}/${Date.now()}-${i}.${fileExt}`;

        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('product-images')
          .upload(fileName, image.file);

        if (uploadError) {
          console.error('Erro no upload da imagem:', uploadError);
          continue;
        }

        const { data: urlData } = supabase.storage
          .from('product-images')
          .getPublicUrl(uploadData.path);

        const imageUrl = urlData.publicUrl;
        uploadedUrls.push(imageUrl);

        // Salvar na tabela product_images
        const { error: dbError } = await supabase
          .from('product_images')
          .insert({
            product_id: productId,
            image_url: imageUrl,
            image_order: i + 1,
            is_primary: i === 0,
            alt_text: `Imagem ${i + 1} do produto`
          });

        if (dbError) {
          console.error('Erro ao salvar imagem no banco:', dbError);
        }

        // Marcar como enviada
        setDraftImages(prev => prev.map(img => 
          img.id === image.id 
            ? { ...img, uploaded: true, url: imageUrl }
            : img
        ));
      }

      if (uploadedUrls.length > 0) {
        // Atualizar image_url principal do produto
        await supabase
          .from('products')
          .update({ image_url: uploadedUrls[0] })
          .eq('id', productId);

        toast({
          title: 'Sucesso!',
          description: `${uploadedUrls.length} imagem(ns) enviada(s) com sucesso`,
        });
      }

      return uploadedUrls;
    } catch (error) {
      console.error('Erro no processo de upload:', error);
      toast({
        title: 'Erro no upload',
        description: 'Falha no processo de upload das imagens',
        variant: 'destructive',
      });
      return [];
    } finally {
      setIsUploading(false);
    }
  }, [draftImages, toast]);

  const clearDraftImages = useCallback(() => {
    draftImages.forEach(image => {
      if (image.preview) {
        URL.revokeObjectURL(image.preview);
      }
    });
    setDraftImages([]);
    loadedProductIdRef.current = null;
  }, [draftImages]);

  const loadExistingImages = useCallback(async (productId: string) => {
    // Evitar carregar o mesmo produto múltiplas vezes
    if (loadedProductIdRef.current === productId || isLoading) {
      return;
    }

    setIsLoading(true);
    loadedProductIdRef.current = productId;

    try {
      const { data: images, error } = await supabase
        .from('product_images')
        .select('*')
        .eq('product_id', productId)
        .order('image_order');

      if (error) {
        console.error('Erro ao carregar imagens existentes:', error);
        return;
      }

      if (images && images.length > 0) {
        const existingImages: DraftImage[] = images.map((img) => ({
          id: img.id,
          file: new File([], ''), // File vazio para imagens já salvas
          preview: img.image_url,
          uploaded: true,
          url: img.image_url
        }));
        
        setDraftImages(existingImages);
      }
    } catch (error) {
      console.error('Erro ao carregar imagens:', error);
    } finally {
      setIsLoading(false);
    }
  }, [isLoading]);

  return {
    draftImages,
    isUploading,
    isLoading,
    addDraftImages,
    removeDraftImage,
    uploadDraftImages,
    clearDraftImages,
    loadExistingImages
  };
};
