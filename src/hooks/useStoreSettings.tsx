
import { useState, useEffect, useCallback } from 'react';
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

  const fetchSettings = useCallback(async () => {
    try {
      setLoading(true);
      const targetStoreId = storeId || profile?.store_id;
      
      if (!targetStoreId) {
        console.log('Nenhum store_id disponível para buscar configurações');
        setLoading(false);
        return;
      }

      console.log('Buscando configurações para store_id:', targetStoreId);

      const { data, error } = await supabase
        .from('store_settings')
        .select('*')
        .eq('store_id', targetStoreId)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Erro ao buscar configurações:', error);
        throw error;
      }
      
      // Se não existir configuração, criar uma padrão
      if (!data) {
        console.log('Criando configurações padrão para store_id:', targetStoreId);
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
          console.error('Erro ao criar configurações:', createError);
          throw createError;
        }
        console.log('Configurações criadas:', newSettings);
        setSettings(newSettings);
      } else {
        console.log('Configurações encontradas:', data);
        setSettings(data);
      }
    } catch (error) {
      console.error('Erro ao buscar configurações:', error);
    } finally {
      setLoading(false);
    }
  }, [storeId, profile?.store_id]); // Dependências mínimas necessárias

  const updateSettings = useCallback(async (updates: Partial<StoreSettings>) => {
    try {
      if (!settings) {
        console.error('Configurações não encontradas para atualizar');
        return { data: null, error: 'Configurações não encontradas' };
      }

      console.log('Atualizando configurações:', updates);

      const { data, error } = await supabase
        .from('store_settings')
        .update(updates)
        .eq('id', settings.id)
        .select()
        .single();

      if (error) {
        console.error('Erro ao atualizar configurações:', error);
        throw error;
      }
      
      console.log('Configurações atualizadas:', data);
      setSettings(data);
      return { data, error: null };
    } catch (error) {
      console.error('Erro ao atualizar configurações:', error);
      return { data: null, error };
    }
  }, [settings]); // Apenas settings como dependência

  useEffect(() => {
    if (profile?.store_id || storeId) {
      fetchSettings();
    }
  }, [profile?.store_id, storeId]); // Dependências mínimas para evitar loops

  return {
    settings,
    loading,
    fetchSettings,
    updateSettings
  };
};
