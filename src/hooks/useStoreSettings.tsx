
import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export interface StoreSettings {
  id: string;
  store_id: string;
  business_hours: any;
  payment_methods: any;
  shipping_options: any;
  whatsapp_number: string | null;
  whatsapp_integration_active: boolean | null;
  retail_catalog_active: boolean | null;
  wholesale_catalog_active: boolean | null;
  created_at: string;
  updated_at: string;
}

export const useStoreSettings = (storeId?: string) => {
  const [settings, setSettings] = useState<StoreSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const { profile } = useAuth();
  
  // Usar refs para evitar loops
  const lastFetchedStoreId = useRef<string | null>(null);
  const isCurrentlyFetching = useRef(false);
  const fetchTimestamp = useRef<number>(0);

  // Determinar store_id de forma estável
  const targetStoreId = storeId || profile?.store_id;

  const fetchSettings = async (forceRefresh = false) => {
    // Evitar requests duplicados
    if (isCurrentlyFetching.current && !forceRefresh) {
      console.log('useStoreSettings: Request já em andamento, ignorando');
      return;
    }

    // Throttle requests - mínimo 1 segundo entre requests
    const now = Date.now();
    if (!forceRefresh && now - fetchTimestamp.current < 1000) {
      console.log('useStoreSettings: Request throttled');
      return;
    }

    // Evitar requests desnecessários
    if (!forceRefresh && lastFetchedStoreId.current === targetStoreId && settings) {
      console.log('useStoreSettings: Dados já carregados para este store_id');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      isCurrentlyFetching.current = true;
      fetchTimestamp.current = now;
      
      if (!targetStoreId) {
        console.log('useStoreSettings: Nenhum store_id disponível');
        setSettings(null);
        setLoading(false);
        lastFetchedStoreId.current = null;
        return;
      }

      console.log('useStoreSettings: Buscando configurações para store_id:', targetStoreId);
      lastFetchedStoreId.current = targetStoreId;

      const { data, error } = await supabase
        .from('store_settings')
        .select('*')
        .eq('store_id', targetStoreId)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('useStoreSettings: Erro ao buscar configurações:', error);
        throw error;
      }
      
      // Se não existir configuração, criar uma padrão
      if (!data) {
        console.log('useStoreSettings: Criando configurações padrão');
        const { data: newSettings, error: createError } = await supabase
          .from('store_settings')
          .insert([{
            store_id: targetStoreId,
            retail_catalog_active: true,
            wholesale_catalog_active: false,
            whatsapp_integration_active: false
          }])
          .select()
          .single();

        if (createError) {
          console.error('useStoreSettings: Erro ao criar configurações:', createError);
          throw createError;
        }
        
        console.log('useStoreSettings: Configurações criadas com sucesso');
        setSettings(newSettings);
      } else {
        console.log('useStoreSettings: Configurações encontradas');
        setSettings(data);
      }
      
    } catch (error) {
      console.error('useStoreSettings: Erro geral:', error);
      setSettings(null);
    } finally {
      setLoading(false);
      isCurrentlyFetching.current = false;
    }
  };

  const updateSettings = async (updates: Partial<StoreSettings>) => {
    try {
      if (!settings) {
        console.error('useStoreSettings: Configurações não encontradas para atualizar');
        return { data: null, error: 'Configurações não encontradas' };
      }

      console.log('useStoreSettings: Atualizando configurações:', updates);

      const { data, error } = await supabase
        .from('store_settings')
        .update(updates)
        .eq('id', settings.id)
        .select()
        .single();

      if (error) {
        console.error('useStoreSettings: Erro ao atualizar:', error);
        throw error;
      }
      
      console.log('useStoreSettings: Configurações atualizadas com sucesso');
      setSettings(data);
      return { data, error: null };
    } catch (error) {
      console.error('useStoreSettings: Erro na atualização:', error);
      return { data: null, error };
    }
  };

  // Effect para buscar dados quando store_id mudar - SEM fetchSettings nas dependências
  useEffect(() => {
    // Reset estado se store_id mudou
    if (targetStoreId !== lastFetchedStoreId.current) {
      console.log('useStoreSettings: Store ID mudou, reset e fetch');
      setSettings(null);
      setLoading(true);
      lastFetchedStoreId.current = null;
      fetchSettings();
    } else if (targetStoreId && !settings && !isCurrentlyFetching.current) {
      console.log('useStoreSettings: Sem dados, fazendo fetch inicial');
      fetchSettings();
    }
  }, [targetStoreId]); // APENAS targetStoreId como dependência

  return {
    settings,
    loading,
    fetchSettings: () => fetchSettings(true), // Force refresh sempre
    updateSettings
  };
};
