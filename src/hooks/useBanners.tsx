
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useStoreResolver } from '@/hooks/useStoreResolver';
import { useToast } from '@/hooks/use-toast';

export interface Banner {
  id: string;
  store_id: string;
  title: string;
  description?: string;
  image_url: string;
  link_url?: string;
  banner_type: 'hero' | 'category' | 'sidebar' | 'promotional';
  position: number;
  is_active: boolean;
  display_order: number;
  start_date?: string;
  end_date?: string;
  product_id?: string;
  source_type?: 'manual' | 'product';
  created_at: string;
  updated_at: string;
}

export interface BannerCreateData {
  title: string;
  description?: string;
  image_url: string;
  link_url?: string;
  banner_type: Banner['banner_type'];
  position: number;
  display_order: number;
  is_active: boolean;
  start_date?: string;
  end_date?: string;
  product_id?: string;
  source_type?: 'manual' | 'product';
  store_id: string;
}

export const useBanners = (storeIdentifier?: string, bannerType?: Banner['banner_type']) => {
  const { profile } = useAuth();
  const { toast } = useToast();
  const { resolveStoreId } = useStoreResolver();
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resolvedStoreId, setResolvedStoreId] = useState<string | null>(null);

  // Resolver store ID uma vez
  useEffect(() => {
    const resolveStore = async () => {
      try {
        setError(null);
        const targetIdentifier = storeIdentifier || profile?.store_id;
        
        if (!targetIdentifier) {
          console.log('useBanners: Nenhum identificador de loja disponível');
          setResolvedStoreId(null);
          return;
        }

        console.log('useBanners: Resolvendo store ID para:', targetIdentifier);
        const storeId = await resolveStoreId(targetIdentifier);
        
        if (!storeId) {
          console.error('useBanners: Loja não encontrada para:', targetIdentifier);
          setError('Loja não encontrada');
          setResolvedStoreId(null);
          return;
        }

        console.log('useBanners: Store ID resolvido:', storeId);
        setResolvedStoreId(storeId);
      } catch (err) {
        console.error('useBanners: Erro ao resolver store ID:', err);
        setError('Erro ao carregar configurações da loja');
        setResolvedStoreId(null);
      }
    };

    resolveStore();
  }, [storeIdentifier, profile?.store_id, resolveStoreId]);

  const fetchBanners = async () => {
    if (!resolvedStoreId) {
      console.log('useBanners: Store ID não resolvido ainda');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      console.log('useBanners: Buscando banners para store_id:', resolvedStoreId);

      let query = supabase
        .from('catalog_banners')
        .select(`
          *,
          products!left(id, name, image_url, description)
        `)
        .eq('store_id', resolvedStoreId)
        .eq('is_active', true);

      if (bannerType) {
        query = query.eq('banner_type', bannerType);
      }

      // Filtrar por datas se aplicável
      const now = new Date().toISOString();
      query = query.or(`start_date.is.null,start_date.lte.${now}`)
                   .or(`end_date.is.null,end_date.gte.${now}`);

      query = query.order('display_order').order('created_at');

      const { data, error: fetchError } = await query;

      if (fetchError) {
        console.error('useBanners: Erro ao buscar banners:', fetchError);
        setError('Erro ao carregar banners');
        return;
      }

      // Processar banners baseados em produtos
      const processedBanners = (data || []).map((banner: any) => {
        if (banner.source_type === 'product' && banner.products) {
          return {
            ...banner,
            title: banner.title || banner.products.name,
            image_url: banner.image_url || banner.products.image_url,
            description: banner.description || banner.products.description,
          };
        }
        return banner;
      });

      console.log('useBanners: Banners carregados:', processedBanners.length);
      setBanners(processedBanners);
    } catch (error) {
      console.error('useBanners: Erro geral:', error);
      setError('Erro ao carregar banners');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (resolvedStoreId) {
      fetchBanners();
    }
  }, [resolvedStoreId, bannerType]);

  const createBanner = async (bannerData: BannerCreateData) => {
    if (!resolvedStoreId) {
      throw new Error('Store ID não encontrado');
    }

    try {
      const { data, error } = await supabase
        .from('catalog_banners')
        .insert({
          ...bannerData,
          store_id: resolvedStoreId,
        })
        .select()
        .single();

      if (error) throw error;

      await fetchBanners();
      return { data, error: null };
    } catch (error) {
      console.error('useBanners: Erro ao criar banner:', error);
      return { data: null, error };
    }
  };

  const updateBanner = async (id: string, updates: Partial<BannerCreateData>) => {
    try {
      const { data, error } = await supabase
        .from('catalog_banners')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      await fetchBanners();
      return { data, error: null };
    } catch (error) {
      console.error('useBanners: Erro ao atualizar banner:', error);
      return { data: null, error };
    }
  };

  const deleteBanner = async (id: string) => {
    try {
      const { error } = await supabase
        .from('catalog_banners')
        .delete()
        .eq('id', id);

      if (error) throw error;

      await fetchBanners();
      return { error: null };
    } catch (error) {
      console.error('useBanners: Erro ao deletar banner:', error);
      return { error };
    }
  };

  return {
    banners,
    loading,
    error,
    createBanner,
    updateBanner,
    deleteBanner,
    refetch: fetchBanners,
  };
};
