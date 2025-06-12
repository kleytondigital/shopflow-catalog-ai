
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export interface Store {
  id: string;
  name: string;
  description: string | null;
  owner_id: string;
  is_active: boolean;
  plan_type: string;
  monthly_fee: number | null;
  created_at: string;
  updated_at: string;
}

export const useStores = () => {
  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(true);
  const { profile } = useAuth();

  const fetchStores = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('stores')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setStores(data || []);
    } catch (error) {
      console.error('Erro ao buscar lojas:', error);
    } finally {
      setLoading(false);
    }
  };

  const createStore = async (storeData: Partial<Store>) => {
    try {
      const { data, error } = await supabase
        .from('stores')
        .insert([storeData])
        .select()
        .single();

      if (error) throw error;
      await fetchStores();
      return { data, error: null };
    } catch (error) {
      console.error('Erro ao criar loja:', error);
      return { data: null, error };
    }
  };

  const updateStore = async (id: string, updates: Partial<Store>) => {
    try {
      const { data, error } = await supabase
        .from('stores')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      await fetchStores();
      return { data, error: null };
    } catch (error) {
      console.error('Erro ao atualizar loja:', error);
      return { data: null, error };
    }
  };

  useEffect(() => {
    if (profile) {
      fetchStores();
    }
  }, [profile]);

  return {
    stores,
    loading,
    fetchStores,
    createStore,
    updateStore
  };
};
