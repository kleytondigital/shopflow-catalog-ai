
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface Settings {
  id: string;
  store_id: string;
  setting_key: string;
  setting_value: any;
  created_at: string;
  updated_at: string;
}

export interface CatalogSettings {
  catalog_mode: 'separated' | 'hybrid' | 'toggle';
  retail_catalog_active: boolean;
  wholesale_catalog_active: boolean;
}

export const useSettings = (storeId?: string) => {
  const [settings, setSettings] = useState<CatalogSettings | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSettings = async (id: string) => {
    setLoading(true);
    setError(null);

    try {
      // Buscar configurações da tabela store_settings ao invés de uma tabela genérica
      const { data, error: fetchError } = await supabase
        .from('store_settings')
        .select('*')
        .eq('store_id', id)
        .single();

      if (fetchError && fetchError.code !== 'PGRST116') {
        setError(fetchError.message);
        return;
      }

      // Converter dados da store_settings para o formato esperado
      const catalogData: CatalogSettings = {
        catalog_mode: (data?.catalog_mode as 'separated' | 'hybrid' | 'toggle') || 'separated',
        retail_catalog_active: data?.retail_catalog_active ?? true,
        wholesale_catalog_active: data?.wholesale_catalog_active ?? false
      };

      setSettings(catalogData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao buscar configurações');
    } finally {
      setLoading(false);
    }
  };

  const updateSettings = async (newSettings: Partial<CatalogSettings>) => {
    if (!storeId) return;

    try {
      setLoading(true);
      
      // Atualizar store_settings diretamente
      const { error } = await supabase
        .from('store_settings')
        .upsert({
          store_id: storeId,
          ...newSettings,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;
      
      // Refetch para atualizar o estado local
      await fetchSettings(storeId);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao atualizar configurações');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (storeId) {
      fetchSettings(storeId);
    }
  }, [storeId]);

  return {
    settings,
    loading,
    isLoading: loading,
    error,
    updateSettings,
    refetch: () => storeId ? fetchSettings(storeId) : Promise.resolve()
  };
};
