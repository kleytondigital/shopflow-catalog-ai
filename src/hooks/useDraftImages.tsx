
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface DraftImage {
  id: string;
  file?: File;
  preview?: string;
  url?: string;
  uploaded: boolean;
  isExisting: boolean;
  isPrimary: boolean;
  displayOrder: number;
}

export const useDraftImages = () => {
  const [draftImages, setDraftImages] = useState<DraftImage[]>([]);
  const [uploading, setUploading] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const isUploading = uploading;

  const addDraftImage = useCallback((file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const newImage: DraftImage = {
        id: `draft-${Date.now()}-${Math.random()}`,
        file,
        preview: e.target?.result as string,
        uploaded: false,
        isExisting: false,
        isPrimary: false,
        displayOrder: draftImages.length,
      };

      setDraftImages(prev => {
        if (prev.length === 0) {
          newImage.isPrimary = true;
        }
        return [...prev, newImage];
      });
    };
    reader.readAsDataURL(file);
  }, [draftImages.length]);

  const addDraftImages = useCallback((files: File[]) => {
    files.forEach(file => addDraftImage(file));
  }, [addDraftImage]);

  const removeDraftImage = useCallback((imageId: string) => {
    setDraftImages(prev => {
      const imageToRemove = prev.find(img => img.id === imageId);
      const filtered = prev.filter(img => img.id !== imageId);
      
      if (imageToRemove?.isPrimary && filtered.length > 0) {
        filtered[0].isPrimary = true;
      }
      
      return filtered.map((img, index) => ({ ...img, displayOrder: index }));
    });
  }, []);

  const setPrimaryImage = useCallback((imageId: string) => {
    console.log('🌟 SETTING PRIMARY IMAGE:', imageId);
    setDraftImages(prev => 
      prev.map(img => ({
        ...img,
        isPrimary: img.id === imageId
      }))
    );
  }, []);

  const reorderImages = useCallback((imageId: string, newIndex: number) => {
    setDraftImages(prev => {
      const currentIndex = prev.findIndex(img => img.id === imageId);
      if (currentIndex === -1) return prev;

      const newArray = [...prev];
      const [movedImage] = newArray.splice(currentIndex, 1);
      newArray.splice(newIndex, 0, movedImage);

      return newArray.map((img, index) => ({ ...img, displayOrder: index }));
    });
  }, []);

  const loadExistingImages = useCallback(async (productId: string) => {
    if (!productId) return;
    
    setIsLoading(true);
    try {
      console.log('📂 LOADING EXISTING IMAGES para produto:', productId);
      
      const { data, error } = await supabase
        .from('product_images')
        .select('*')
        .eq('product_id', productId)
        .order('display_order');

      if (error) {
        console.error('❌ Erro ao carregar imagens:', error);
        throw error;
      }

      const existingImages: DraftImage[] = data?.map((img, index) => ({
        id: img.id,
        url: img.image_url,
        uploaded: true,
        isExisting: true,
        isPrimary: img.is_primary || index === 0,
        displayOrder: img.display_order || index,
      })) || [];

      console.log('✅ Imagens carregadas:', existingImages.length);
      setDraftImages(existingImages);
    } catch (error) {
      console.error('❌ Erro ao carregar imagens existentes:', error);
      toast({
        title: "Erro ao carregar imagens",
        description: "Não foi possível carregar as imagens existentes",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  const uploadAllImages = useCallback(async (productId: string): Promise<string[]> => {
    console.log('📤 UPLOAD ALL IMAGES - Iniciado para produto:', productId);
    console.log('📤 UPLOAD ALL IMAGES - Draft images:', draftImages.length);
    
    if (!productId) {
      console.error('❌ UPLOAD - Product ID é obrigatório');
      return [];
    }

    const imagesToUpload = draftImages.filter(img => !img.uploaded && img.file);
    const existingImages = draftImages.filter(img => img.isExisting && img.uploaded);
    
    console.log('📤 UPLOAD - Imagens para upload:', imagesToUpload.length);
    console.log('📤 UPLOAD - Imagens existentes:', existingImages.length);

    if (imagesToUpload.length === 0 && existingImages.length === 0) {
      console.log('📋 Nenhuma imagem para processar');
      return [];
    }

    setUploading(true);
    const uploadedUrls: string[] = [];

    try {
      // Atualizar imagens existentes se necessário
      if (existingImages.length > 0) {
        console.log('🔄 Atualizando imagens existentes...');
        for (const image of existingImages) {
          await supabase
            .from('product_images')
            .update({
              is_primary: image.isPrimary,
              display_order: image.displayOrder
            })
            .eq('id', image.id);
        }
      }

      // Upload de novas imagens
      if (imagesToUpload.length > 0) {
        console.log('📤 Iniciando upload de', imagesToUpload.length, 'novas imagens');

        for (let i = 0; i < imagesToUpload.length; i++) {
          const image = imagesToUpload[i];
          if (!image.file) continue;

          const fileExt = image.file.name.split('.').pop()?.toLowerCase();
          const fileName = `products/${productId}/${Date.now()}-${i}.${fileExt}`;

          console.log('📁 Upload arquivo:', fileName);

          const { data: uploadData, error: uploadError } = await supabase.storage
            .from('product-images')
            .upload(fileName, image.file, {
              cacheControl: '3600',
              upsert: false
            });

          if (uploadError) {
            console.error('❌ Erro no upload:', uploadError);
            throw uploadError;
          }

          const { data: { publicUrl } } = supabase.storage
            .from('product-images')
            .getPublicUrl(fileName);

          console.log('🔗 URL pública gerada:', publicUrl);

          const { error: dbError } = await supabase
            .from('product_images')
            .insert({
              product_id: productId,
              image_url: publicUrl,
              display_order: image.displayOrder,
              is_primary: image.isPrimary,
              alt_text: `Produto ${image.displayOrder + 1}`
            });

          if (dbError) {
            console.error('❌ Erro ao salvar no banco:', dbError);
            throw dbError;
          }

          uploadedUrls.push(publicUrl);
          console.log('✅ Imagem salva com sucesso');

          // Atualizar estado local
          setDraftImages(prev => 
            prev.map(img => 
              img.id === image.id 
                ? { ...img, uploaded: true, url: publicUrl, isExisting: true }
                : img
            )
          );
        }
      }

      const totalProcessed = uploadedUrls.length + existingImages.length;
      if (totalProcessed > 0) {
        toast({
          title: "Imagens processadas!",
          description: `${totalProcessed} imagem(s) processada(s) com sucesso.`,
        });
      }

      return uploadedUrls;
    } catch (error) {
      console.error('💥 Erro no processamento das imagens:', error);
      toast({
        title: "Erro no processamento",
        description: "Ocorreu um erro ao processar as imagens",
        variant: "destructive",
      });
      return [];
    } finally {
      setUploading(false);
    }
  }, [draftImages, toast]);

  const uploadDraftImages = uploadAllImages;

  const clearDraftImages = useCallback(() => {
    console.log('🧹 CLEARING DRAFT IMAGES');
    setDraftImages([]);
  }, []);

  return {
    draftImages,
    uploading,
    isUploading,
    isLoading,
    addDraftImage,
    addDraftImages,
    removeDraftImage,
    setPrimaryImage,
    reorderImages,
    loadExistingImages,
    uploadAllImages,
    uploadDraftImages,
    clearDraftImages,
  };
};
