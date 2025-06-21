
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

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
  created_at: string;
  updated_at: string;
}

export const useBanners = (storeId?: string, bannerType?: string) => {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { profile } = useAuth();

  const targetStoreId = storeId || profile?.store_id;

  const fetchBanners = async () => {
    if (!targetStoreId) return;

    try {
      setLoading(true);
      let query = supabase
        .from('catalog_banners')
        .select('*')
        .eq('store_id', targetStoreId)
        .eq('is_active', true)
        .order('display_order', { ascending: true });

      if (bannerType) {
        query = query.eq('banner_type', bannerType);
      }

      const { data, error: fetchError } = await query;

      if (fetchError) throw fetchError;

      // Filtrar banners que estão dentro do período de exibição
      const activeBanners = data?.filter(banner => {
        const now = new Date();
        const startDate = banner.start_date ? new Date(banner.start_date) : null;
        const endDate = banner.end_date ? new Date(banner.end_date) : null;

        return (!startDate || startDate <= now) && (!endDate || endDate >= now);
      }) || [];

      setBanners(activeBanners);
    } catch (err) {
      console.error('Erro ao buscar banners:', err);
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    } finally {
      setLoading(false);
    }
  };

  const createBanner = async (bannerData: Omit<Banner, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data, error } = await supabase
        .from('catalog_banners')
        .insert([bannerData])
        .select()
        .single();

      if (error) throw error;

      setBanners(prev => [...prev, data]);
      return { data, error: null };
    } catch (error) {
      console.error('Erro ao criar banner:', error);
      return { data: null, error };
    }
  };

  const updateBanner = async (id: string, updates: Partial<Banner>) => {
    try {
      const { data, error } = await supabase
        .from('catalog_banners')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      setBanners(prev => prev.map(banner => 
        banner.id === id ? { ...banner, ...data } : banner
      ));
      return { data, error: null };
    } catch (error) {
      console.error('Erro ao atualizar banner:', error);
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

      setBanners(prev => prev.filter(banner => banner.id !== id));
      return { error: null };
    } catch (error) {
      console.error('Erro ao deletar banner:', error);
      return { error };
    }
  };

  useEffect(() => {
    fetchBanners();
  }, [targetStoreId, bannerType]);

  return {
    banners,
    loading,
    error,
    fetchBanners,
    createBanner,
    updateBanner,
    deleteBanner
  };
};
