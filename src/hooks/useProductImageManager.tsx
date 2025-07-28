
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useProductImages, ProductImage } from '@/hooks/useProductImages';
import { toast } from 'sonner';

export const useProductImageManager = (productId: string) => {
  const { images, loading, error, refetchImages } = useProductImages(productId);
  const [uploading, setUploading] = useState(false);

  const uploadImage = useCallback(async (file: File, altText: string = '', isPrimary: boolean = false) => {
    try {
      setUploading(true);
      
      // Validação de arquivo
      if (!file.type.startsWith('image/')) {
        throw new Error('Apenas arquivos de imagem são permitidos');
      }
      
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        throw new Error('Arquivo muito grande. Máximo 5MB permitido');
      }
      
      // Upload para Supabase Storage
      const fileExt = file.name.split('.').pop();
      const fileName = `products/${productId}/${Date.now()}.${fileExt}`;
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('product-images')
        .upload(fileName, file);
        
      if (uploadError) {
        console.error('Erro no upload para storage:', uploadError);
        throw new Error(`Erro no upload: ${uploadError.message}`);
      }
      
      // Obter URL pública
      const { data: urlData } = supabase.storage
        .from('product-images')
        .getPublicUrl(fileName);
        
      const imageUrl = urlData.publicUrl;
      
      // Inserir no banco
      const { error } = await supabase
        .from('product_images')
        .insert({
          product_id: productId,
          image_url: imageUrl,
          alt_text: altText,
          is_primary: isPrimary,
          image_order: images.length + 1
        });

      if (error) {
        console.error('Erro ao inserir no banco:', error);
        throw new Error(`Erro ao salvar imagem: ${error.message}`);
      }
      
      await refetchImages();
      toast.success('Imagem enviada com sucesso!');
      return imageUrl;
    } catch (err) {
      console.error('Erro ao fazer upload da imagem:', err);
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido no upload';
      toast.error(errorMessage);
      throw err;
    } finally {
      setUploading(false);
    }
  }, [productId, images.length, refetchImages]);

  const addImage = useCallback(async (imageUrl: string, altText: string = '', isPrimary: boolean = false) => {
    try {
      const { error } = await supabase
        .from('product_images')
        .insert({
          product_id: productId,
          image_url: imageUrl,
          alt_text: altText,
          is_primary: isPrimary,
          image_order: images.length + 1
        });

      if (error) throw error;
      await refetchImages();
    } catch (err) {
      console.error('Erro ao adicionar imagem:', err);
      throw err;
    }
  }, [productId, images.length, refetchImages]);

  const updateImageOrder = useCallback(async (updates: Array<{
    id: string;
    image_order: number;
    is_primary: boolean;
    image_url: string;
    product_id: string;
  }>) => {
    try {
      // Update each image individually to avoid the array issue
      for (const update of updates) {
        const { error } = await supabase
          .from('product_images')
          .update({
            image_order: update.image_order,
            is_primary: update.is_primary
          })
          .eq('id', update.id);

        if (error) throw error;
      }
      
      await refetchImages();
    } catch (err) {
      console.error('Erro ao atualizar ordem das imagens:', err);
      throw err;
    }
  }, [refetchImages]);

  const deleteImage = useCallback(async (imageId: string) => {
    try {
      const imageToDelete = images.find(img => img.id === imageId);
      if (!imageToDelete) return;

      // Delete from database
      const { error } = await supabase
        .from('product_images')
        .delete()
        .eq('id', imageId);

      if (error) throw error;

      // Delete from storage if it exists
      if (imageToDelete.image_url && imageToDelete.image_url.includes('supabase')) {
        const path = imageToDelete.image_url.split('/').pop();
        if (path) {
          await supabase.storage
            .from('product-images')
            .remove([path]);
        }
      }

      await refetchImages();
    } catch (err) {
      console.error('Erro ao deletar imagem:', err);
      throw err;
    }
  }, [images, refetchImages]);

  return {
    images,
    loading,
    error,
    uploading,
    addImage,
    uploadImage,
    updateImageOrder,
    deleteImage
  };
};
