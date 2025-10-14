
import { useState, useEffect, useCallback, useRef } from 'react';
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
  url_slug: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
  cnpj: string | null;
  logo_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateStoreData {
  name: string;
  description?: string;
  owner_id: string;
  is_active?: boolean;
  plan_type?: string;
  monthly_fee?: number;
  url_slug?: string;
  phone?: string;
  email?: string;
  address?: string;
  cnpj?: string;
  logo_url?: string;
}

export interface UpdateStoreData {
  name?: string;
  description?: string;
  is_active?: boolean;
  plan_type?: string;
  monthly_fee?: number;
  url_slug?: string;
  phone?: string;
  email?: string;
  address?: string;
  cnpj?: string;
  logo_url?: string;
}

export const useStores = () => {
  const [stores, setStores] = useState<Store[]>([]);
  const [currentStore, setCurrentStore] = useState<Store | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { profile, user } = useAuth();
  
  // Ref para evitar múltiplas requests simultâneas
  const requestInProgress = useRef(false);

  const fetchStores = useCallback(async () => {
    if (requestInProgress.current) return;
    
    try {
      requestInProgress.current = true;
      setLoading(true);
      setError(null);
      
      console.log('useStores: Buscando todas as lojas');
      
      const { data, error: fetchError } = await supabase
        .from('stores')
        .select('*')
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;
      
      console.log('useStores: Lojas carregadas:', data?.length);
      setStores(data || []);
    } catch (error) {
      console.error('Erro ao buscar lojas:', error);
      setError(error instanceof Error ? error.message : 'Erro ao buscar lojas');
    } finally {
      setLoading(false);
      requestInProgress.current = false;
    }
  }, []);

  const fetchCurrentStore = useCallback(async () => {
    if (!profile?.store_id || requestInProgress.current) return;
    
    try {
      requestInProgress.current = true;
      setLoading(true);
      setError(null);
      
      console.log('useStores: Buscando loja atual:', profile.store_id);

      const { data, error: fetchError } = await supabase
        .from('stores')
        .select('*')
        .eq('id', profile.store_id)
        .maybeSingle();

      if (fetchError) throw fetchError;
      
      if (data) {
        console.log('useStores: Loja atual carregada:', data.name);
        setCurrentStore(data);
      } else {
        console.log('useStores: Nenhuma loja encontrada');
        setCurrentStore(null);
        setError('Loja não encontrada');
      }
    } catch (error) {
      console.error('Erro ao buscar loja atual:', error);
      setError(error instanceof Error ? error.message : 'Erro ao buscar loja atual');
      setCurrentStore(null);
    } finally {
      setLoading(false);
      requestInProgress.current = false;
    }
  }, [profile?.store_id]);

  const createStore = async (storeData: CreateStoreData) => {
    try {
      setError(null);
      
      const { data, error } = await supabase
        .from('stores')
        .insert([storeData])
        .select()
        .single();

      if (error) throw error;
      
      // Recarregar lojas se for superadmin
      if (profile?.role === 'superadmin') {
        await fetchStores();
      }
      
      return { data, error: null };
    } catch (error) {
      console.error('Erro ao criar loja:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erro ao criar loja';
      setError(errorMessage);
      return { data: null, error: errorMessage };
    }
  };

  const updateStore = async (id: string, updates: UpdateStoreData) => {
    try {
      setError(null);
      
      console.log('🔄 useStores: Atualizando loja', { id, updates });
      
      const updateData = {
        ...updates,
        updated_at: new Date().toISOString()
      };
      
      console.log('🔄 useStores: Dados para atualização:', updateData);
      
      const { data, error } = await supabase
        .from('stores')
        .update(updateData)
        .eq('id', id)
        .select()
        .maybeSingle();

      console.log('🔄 useStores: Resultado da atualização:', { data, error });

      if (error) {
        console.error('❌ useStores: Erro na atualização:', error);
        throw error;
      }
      
      if (data) {
        console.log('✅ useStores: Loja atualizada com sucesso:', data);
        
        // Atualizar estado local
        if (profile?.role === 'superadmin') {
          setStores(prev => prev.map(store => store.id === id ? data : store));
        }
        if (profile?.store_id === id) {
          console.log('🔄 useStores: Atualizando currentStore com novos dados');
          setCurrentStore(data);
        }
        
        return { data, error: null };
      } else {
        const errorMessage = 'Não foi possível atualizar a loja - nenhum dado retornado';
        console.error('❌ useStores:', errorMessage);
        setError(errorMessage);
        return { data: null, error: errorMessage };
      }
    } catch (error) {
      console.error('💥 useStores: Erro ao atualizar loja:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erro ao atualizar loja';
      setError(errorMessage);
      return { data: null, error: errorMessage };
    }
  };

  const updateCurrentStore = async (updates: UpdateStoreData) => {
    if (!profile?.store_id) {
      const errorMessage = 'Store ID não encontrado no perfil do usuário';
      console.error('❌ useStores: updateCurrentStore -', errorMessage);
      console.error('❌ useStores: Profile atual:', profile);
      setError(errorMessage);
      return { data: null, error: errorMessage };
    }
    
    console.log('🔄 useStores: updateCurrentStore chamado para store_id:', profile.store_id);
    return updateStore(profile.store_id, updates);
  };

  const updateStoreSlug = async (id: string, slug: string) => {
    try {
      setError(null);
      
      const { data, error } = await supabase
        .from('stores')
        .update({ url_slug: slug })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      
      await fetchStores();
      return { data, error: null };
    } catch (error) {
      console.error('Erro ao atualizar slug da loja:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erro ao atualizar slug da loja';
      setError(errorMessage);
      return { data: null, error: errorMessage };
    }
  };

  // Effect principal simplificado
  useEffect(() => {
    if (!user) {
      console.log('useStores: Usuário não logado');
      setLoading(false);
      setStores([]);
      setCurrentStore(null);
      return;
    }

    if (!profile) {
      console.log('useStores: Profile ainda não carregado');
      return;
    }

    console.log('useStores: Profile carregado, role:', profile.role);

    // Para superadmin: buscar todas as lojas
    if (profile.role === 'superadmin') {
      console.log('useStores: Carregando lojas para superadmin');
      fetchStores();
    } 
    // Para store_admin: buscar apenas a loja atual
    else if (profile.role === 'store_admin' && profile.store_id) {
      console.log('useStores: Carregando loja atual para store_admin');
      fetchCurrentStore();
    } else {
      console.log('useStores: Nenhuma ação necessária');
      setLoading(false);
    }
  }, [profile?.role, profile?.store_id, user, fetchStores, fetchCurrentStore]);

  return {
    stores,
    currentStore,
    loading,
    error,
    fetchStores,
    fetchCurrentStore: () => fetchCurrentStore(),
    createStore,
    updateStore,
    updateCurrentStore,
    updateStoreSlug
  };
};
