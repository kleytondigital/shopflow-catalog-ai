
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useStoreResolver } from '@/hooks/useStoreResolver';

export interface PublicProduct {
  id: string;
  store_id: string;
  name: string;
  description: string | null;
  category: string | null;
  retail_price: number;
  wholesale_price: number | null;
  stock: number;
  reserved_stock: number;
  min_wholesale_qty: number | null;
  image_url: string | null;
  is_active: boolean;
  allow_negative_stock: boolean;
  stock_alert_threshold: number | null;
  meta_title: string | null;
  meta_description: string | null;
  keywords: string | null;
  seo_slug: string | null;
  created_at: string;
  updated_at: string;
}

export const useProductsPublic = (storeIdentifier?: string) => {
  const [products, setProducts] = useState<PublicProduct[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { resolveStoreId } = useStoreResolver();

  const fetchProducts = async (identifier: string) => {
    try {
      setLoading(true);
      setError(null);

      // Resetar produtos para loading visual imediato
      setProducts([]);

      console.log('useProductsPublic: Resolvendo store ID para:', identifier);

      // Timeout seguro e tratamento de erro detalhado
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Timeout: Resolução do store ID demorou mais de 5 segundos')), 5000)
      );
      const storeIdPromise = resolveStoreId(identifier);
      const storeId = await Promise.race([storeIdPromise, timeoutPromise]) as string | null;

      if (!storeId) {
        setError('Loja não encontrada');
        setProducts([]);
        return;
      }

      // Buscar produtos
      console.log('useProductsPublic: Buscando produtos ativos para store:', storeId);

      // Importante: select campos explicitamente para maximizar compatibilidade
      const { data, error: fetchError } = await supabase
        .from('products')
        .select(`
          id, store_id, name, description, category, retail_price, wholesale_price,
          stock, reserved_stock, min_wholesale_qty, image_url, is_active,
          allow_negative_stock, stock_alert_threshold,
          meta_title, meta_description, keywords, seo_slug, created_at, updated_at
        `)
        .eq('store_id', storeId)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (fetchError) {
        console.error('useProductsPublic: Erro ao buscar produtos:', fetchError);
        setError(fetchError.message || 'Erro ao buscar produtos');
        setProducts([]);
        return;
      }

      setProducts(data || []);
      console.log('useProductsPublic: Produtos carregados:', data?.length || 0);

      if (!data || data.length === 0) {
        setError('Nenhum produto encontrado para esta loja.');
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Erro ao carregar produtos';
      setError(msg);
      setProducts([]);
      console.error('useProductsPublic: Erro geral:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (storeIdentifier) {
      fetchProducts(storeIdentifier);
    } else {
      setProducts([]);
      setLoading(false);
      setError(null);
    }
    // eslint-disable-next-line
  }, [storeIdentifier]);

  return {
    products,
    loading,
    error,
    fetchProducts: () => storeIdentifier && fetchProducts(storeIdentifier)
  };
};
