
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface ProductImage {
  id: string;
  product_id: string;
  variation_id: string | null;
  image_url: string;
  image_order: number;
  alt_text: string | null;
  is_primary: boolean;
  created_at: string;
}

export interface CreateImageData {
  product_id: string;
  variation_id?: string;
  image_url: string;
  image_order: number;
  alt_text?: string;
  is_primary?: boolean;
}

export const useProductImages = (productId?: string) => {
  const [images, setImages] = useState<ProductImage[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchImages = async () => {
    if (!productId) return;
    
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('product_images')
        .select('*')
        .eq('product_id', productId)
        .order('image_order', { ascending: true });

      if (error) throw error;
      setImages(data || []);
    } catch (error) {
      console.error('Erro ao buscar imagens:', error);
    } finally {
      setLoading(false);
    }
  };

  const uploadImage = async (file: File, productId: string, imageOrder: number = 1) => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${productId}/${Date.now()}.${fileExt}`;
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('product-images')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('product-images')
        .getPublicUrl(fileName);

      const imageData: CreateImageData = {
        product_id: productId,
        image_url: publicUrl,
        image_order: imageOrder,
        is_primary: imageOrder === 1
      };

      const { data, error } = await supabase
        .from('product_images')
        .insert([imageData])
        .select()
        .single();

      if (error) throw error;
      await fetchImages();
      return { data, error: null };
    } catch (error) {
      console.error('Erro ao fazer upload da imagem:', error);
      return { data: null, error };
    }
  };

  const deleteImage = async (id: string) => {
    try {
      const { error } = await supabase
        .from('product_images')
        .delete()
        .eq('id', id);

      if (error) throw error;
      await fetchImages();
      return { error: null };
    } catch (error) {
      console.error('Erro ao deletar imagem:', error);
      return { error };
    }
  };

  useEffect(() => {
    if (productId) {
      fetchImages();
    }
  }, [productId]);

  return {
    images,
    loading,
    fetchImages,
    uploadImage,
    deleteImage
  };
};
