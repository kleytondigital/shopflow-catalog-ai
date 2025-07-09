
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

  // Aliases para compatibilidade
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
        isPrimary: false, // Nova imagem nunca é principal por padrão
        displayOrder: draftImages.length,
      };

      setDraftImages(prev => {
        // Se não há nenhuma imagem, a primeira pode ser principal
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
      
      // Se removemos a imagem principal e ainda há imagens, tornar a primeira como principal
      if (imageToRemove?.isPrimary && filtered.length > 0) {
        filtered[0].isPrimary = true;
      }
      
      return filtered.map((img, index) => ({ ...img, displayOrder: index }));
    });
  }, []);

  const setPrimaryImage = useCallback((imageId: string) => {
    setDraftImages(prev => 
      prev.map(img => ({
        ...img,
        isPrimary: img.id === imageId // Apenas a imagem selecionada será principal
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
    const imagesToUpload = draftImages.filter(img => !img.uploaded && img.file);
    
    if (imagesToUpload.length === 0) {
      console.log('📋 Nenhuma imagem nova para upload');
      
      // Atualizar status das imagens existentes se necessário
      const existingImages = draftImages.filter(img => img.isExisting && img.uploaded);
      if (existingImages.length > 0) {
        try {
          for (const image of existingImages) {
            await supabase
              .from('product_images')
              .update({
                is_primary: image.isPrimary,
                display_order: image.displayOrder
              })
              .eq('id', image.id);
          }
          console.log('✅ Status das imagens existentes atualizado');
        } catch (error) {
          console.error('❌ Erro ao atualizar imagens existentes:', error);
        }
      }
      
      return [];
    }

    setUploading(true);
    const uploadedUrls: string[] = [];

    try {
      console.log('📤 Iniciando upload de', imagesToUpload.length, 'imagens');

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

      toast({
        title: "Imagens enviadas!",
        description: `${uploadedUrls.length} imagem(s) enviada(s) com sucesso.`,
      });

      return uploadedUrls;
    } catch (error) {
      console.error('💥 Erro no upload das imagens:', error);
      toast({
        title: "Erro no upload",
        description: "Ocorreu um erro ao enviar as imagens",
        variant: "destructive",
      });
      return [];
    } finally {
      setUploading(false);
    }
  }, [draftImages, toast]);

  // Alias para compatibilidade
  const uploadDraftImages = uploadAllImages;

  const clearDraftImages = useCallback(() => {
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
