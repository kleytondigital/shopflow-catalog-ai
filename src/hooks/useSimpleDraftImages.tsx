
import { useState, useCallback, useRef, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

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
  const { toast } = useToast();

  // Cleanup automático das blob URLs
  useEffect(() => {
    return () => {
      blobUrlsRef.current.forEach(url => {
        try {
          URL.revokeObjectURL(url);
        } catch (error) {
          console.warn('Erro ao revogar blob URL:', error);
        }
      });
      blobUrlsRef.current.clear();
    };
  }, []);

  const createBlobUrl = useCallback((file: File): string => {
    const url = URL.createObjectURL(file);
    blobUrlsRef.current.add(url);
    return url;
  }, []);

  const addImages = useCallback((files: File[]) => {
    const newImages: SimpleDraftImage[] = files.map((file) => {
      const preview = createBlobUrl(file);
      return {
        id: `draft-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        file,
        preview,
        uploaded: false,
        isExisting: false
      };
    });
    
    setImages(prev => [...prev, ...newImages]);
    return newImages;
  }, [createBlobUrl]);

  const removeImage = useCallback((id: string) => {
    setImages(prev => {
      const imageToRemove = prev.find(img => img.id === id);
      
      if (imageToRemove && imageToRemove.preview?.startsWith('blob:')) {
        try {
          URL.revokeObjectURL(imageToRemove.preview);
          blobUrlsRef.current.delete(imageToRemove.preview);
        } catch (error) {
          console.warn('Erro ao revogar blob URL:', error);
        }
      }
      
      return prev.filter(img => img.id !== id);
    });
  }, []);

  const uploadImages = useCallback(async (productId: string): Promise<string[]> => {
    if (images.length === 0 || isUploading) return [];

    setIsUploading(true);
    const uploadedUrls: string[] = [];

    try {
      // Remover imagens existentes
      await supabase.from('product_images').delete().eq('product_id', productId);
      
      const { data: existingFiles } = await supabase.storage
        .from('product-images')
        .list(productId);

      if (existingFiles?.length) {
        const filesToDelete = existingFiles.map(file => `${productId}/${file.name}`);
        await supabase.storage.from('product-images').remove(filesToDelete);
      }

      // Upload novas imagens
      const imagesToUpload = images.filter(img => img.file && !img.uploaded);
      
      for (let i = 0; i < imagesToUpload.length; i++) {
        const image = imagesToUpload[i];
        const fileExt = image.file!.name.split('.').pop();
        const fileName = `${productId}/${Date.now()}-${i}.${fileExt}`;

        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('product-images')
          .upload(fileName, image.file!);

        if (uploadError) continue;

        const { data: urlData } = supabase.storage
          .from('product-images')
          .getPublicUrl(uploadData.path);

        const imageUrl = urlData.publicUrl;
        uploadedUrls.push(imageUrl);

        await supabase.from('product_images').insert({
          product_id: productId,
          image_url: imageUrl,
          image_order: i + 1,
          is_primary: i === 0,
          alt_text: `Imagem ${i + 1} do produto`
        });
      }

      // Atualizar imagem principal do produto
      if (uploadedUrls.length > 0) {
        await supabase
          .from('products')
          .update({ image_url: uploadedUrls[0] })
          .eq('id', productId);
      }

      toast({
        title: 'Sucesso!',
        description: `${uploadedUrls.length} imagem(ns) enviada(s) com sucesso`,
      });

      return uploadedUrls;
    } catch (error) {
      console.error('Erro no upload:', error);
      toast({
        title: 'Erro no upload',
        description: 'Falha no processo de upload das imagens',
        variant: 'destructive',
      });
      return [];
    } finally {
      setIsUploading(false);
    }
  }, [images, toast, isUploading]);

  const loadExistingImages = useCallback(async (productId: string) => {
    if (isLoading) return;

    setIsLoading(true);
    try {
      const { data: existingImages, error } = await supabase
        .from('product_images')
        .select('*')
        .eq('product_id', productId)
        .order('image_order');

      if (error) throw error;

      if (existingImages?.length) {
        const mappedImages: SimpleDraftImage[] = existingImages.map((img) => ({
          id: img.id,
          preview: img.image_url,
          uploaded: true,
          url: img.image_url,
          isExisting: true
        }));
        
        setImages(mappedImages);
      } else {
        setImages([]);
      }
    } catch (error) {
      console.error('Erro ao carregar imagens:', error);
    } finally {
      setIsLoading(false);
    }
  }, [isLoading]);

  const clearImages = useCallback(() => {
    // Limpar blob URLs
    blobUrlsRef.current.forEach(url => {
      try {
        URL.revokeObjectURL(url);
      } catch (error) {
        console.warn('Erro ao revogar blob URL:', error);
      }
    });
    blobUrlsRef.current.clear();
    setImages([]);
  }, []);

  return {
    images,
    isUploading,
    isLoading,
    addImages,
    removeImage,
    uploadImages,
    loadExistingImages,
    clearImages
  };
};
