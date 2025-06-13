
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
    if (!productId) {
      setLoading(false);
      return;
    }
    
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

  const ensureBucketExists = async () => {
    try {
      const { data: buckets } = await supabase.storage.listBuckets();
      const productImagesBucket = buckets?.find(bucket => bucket.name === 'product-images');
      
      if (!productImagesBucket) {
        const { error } = await supabase.storage.createBucket('product-images', { 
          public: true,
          allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
          fileSizeLimit: 5242880 // 5MB
        });
        if (error) {
          console.error('Erro ao criar bucket:', error);
        }
      }
      return true;
    } catch (error) {
      console.error('Erro ao verificar bucket:', error);
      return false;
    }
  };

  const uploadImage = async (file: File, productId: string, imageOrder: number = 1) => {
    try {
      console.log('Iniciando upload da imagem:', file.name);
      
      // Garantir que o bucket existe
      await ensureBucketExists();

      const fileExt = file.name.split('.').pop()?.toLowerCase();
      const fileName = `${productId}/${Date.now()}-${Math.random().toString(36).substr(2, 9)}.${fileExt}`;
      
      console.log('Nome do arquivo:', fileName);

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('product-images')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        console.error('Erro no upload:', uploadError);
        throw uploadError;
      }

      console.log('Upload realizado:', uploadData);

      const { data: { publicUrl } } = supabase.storage
        .from('product-images')
        .getPublicUrl(fileName);

      console.log('URL pública:', publicUrl);

      // Verificar se é a primeira imagem para definir como principal
      const existingImages = await supabase
        .from('product_images')
        .select('id')
        .eq('product_id', productId);

      const isPrimary = !existingImages.data || existingImages.data.length === 0;

      const imageData: CreateImageData = {
        product_id: productId,
        image_url: publicUrl,
        image_order: imageOrder,
        is_primary: isPrimary,
        alt_text: file.name
      };

      const { data, error } = await supabase
        .from('product_images')
        .insert([imageData])
        .select()
        .single();

      if (error) {
        console.error('Erro ao salvar imagem no banco:', error);
        throw error;
      }

      console.log('Imagem salva no banco:', data);
      await fetchImages();
      return { data, error: null };
    } catch (error) {
      console.error('Erro completo no upload:', error);
      return { data: null, error };
    }
  };

  const deleteImage = async (id: string) => {
    try {
      // Buscar a imagem para obter a URL
      const { data: imageData } = await supabase
        .from('product_images')
        .select('image_url')
        .eq('id', id)
        .single();

      if (imageData?.image_url) {
        // Extrair o path da URL para deletar do storage
        const urlParts = imageData.image_url.split('/');
        const fileName = urlParts.slice(-2).join('/'); // produto_id/arquivo.ext
        
        await supabase.storage
          .from('product-images')
          .remove([fileName]);
      }

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
