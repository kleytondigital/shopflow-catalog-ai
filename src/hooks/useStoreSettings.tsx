
import { useState, useEffect, useRef, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useStoreResolver } from '@/hooks/useStoreResolver';

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

export const useStoreSettings = (storeIdentifier?: string) => {
  const [settings, setSettings] = useState<StoreSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { profile } = useAuth();
  const { resolveStoreId } = useStoreResolver();
  
  // Cache e controle de requests
  const cacheRef = useRef<Map<string, { data: StoreSettings; timestamp: number }>>(new Map());
  const requestRef = useRef<Promise<void> | null>(null);
  const [resolvedStoreId, setResolvedStoreId] = useState<string | null>(null);

  // Resolver store ID uma vez
  useEffect(() => {
    const resolveStore = async () => {
      try {
        setError(null);
        const targetIdentifier = storeIdentifier || profile?.store_id;
        
        if (!targetIdentifier) {
          console.log('useStoreSettings: Nenhum identificador de loja disponível');
          setSettings(null);
          setError('Store ID não disponível');
          setResolvedStoreId(null);
          return;
        }

        console.log('useStoreSettings: Resolvendo store ID para:', targetIdentifier);
        const storeId = await resolveStoreId(targetIdentifier);
        
        if (!storeId) {
          console.error('useStoreSettings: Loja não encontrada para:', targetIdentifier);
          setError('Loja não encontrada');
          setSettings(null);
          setResolvedStoreId(null);
          return;
        }

        console.log('useStoreSettings: Store ID resolvido:', storeId);
        setResolvedStoreId(storeId);
      } catch (err) {
        console.error('useStoreSettings: Erro ao resolver store ID:', err);
        setError('Erro ao carregar configurações da loja');
        setSettings(null);
        setResolvedStoreId(null);
      }
    };

    resolveStore();
  }, [storeIdentifier, profile?.store_id, resolveStoreId]);

  // Função de fetch isolada sem dependências circulares
  const fetchSettings = useCallback(async (forceRefresh = false): Promise<void> => {
    if (!resolvedStoreId) {
      console.log('useStoreSettings: Store ID não resolvido ainda');
      return;
    }

    // Verificar cache (válido por 5 minutos)
    const cached = cacheRef.current.get(resolvedStoreId);
    const now = Date.now();
    if (!forceRefresh && cached && now - cached.timestamp < 300000) {
      console.log('useStoreSettings: Usando dados do cache para store_id:', resolvedStoreId);
      setSettings(cached.data);
      setLoading(false);
      setError(null);
      return;
    }

    // Evitar requests simultâneos
    if (requestRef.current && !forceRefresh) {
      console.log('useStoreSettings: Aguardando request em andamento');
      return requestRef.current;
    }

    console.log('useStoreSettings: Iniciando busca para store_id:', resolvedStoreId);
    setLoading(true);
    setError(null);

    const fetchPromise = (async () => {
      try {
        const { data, error: fetchError } = await supabase
          .from('store_settings')
          .select('*')
          .eq('store_id', resolvedStoreId)
          .maybeSingle();

        if (fetchError) {
          console.error('useStoreSettings: Erro ao buscar configurações:', fetchError);
          throw new Error(`Erro ao buscar configurações: ${fetchError.message}`);
        }
        
        let finalData = data;
        
        // Se não existir configuração, criar uma padrão
        if (!data) {
          console.log('useStoreSettings: Criando configurações padrão para store_id:', resolvedStoreId);
          
          const defaultSettings = {
            store_id: resolvedStoreId,
            retail_catalog_active: true,
            wholesale_catalog_active: false,
            whatsapp_integration_active: false,
            business_hours: {},
            payment_methods: {
              pix: false,
              bank_slip: false,
              credit_card: false
            },
            shipping_options: {
              pickup: true,
              delivery: false,
              shipping: false
            }
          };

          const { data: newSettings, error: createError } = await supabase
            .from('store_settings')
            .insert([defaultSettings])
            .select()
            .single();

          if (createError) {
            console.error('useStoreSettings: Erro ao criar configurações:', createError);
            throw new Error(`Erro ao criar configurações: ${createError.message}`);
          }
          
          finalData = newSettings;
        }

        // Atualizar cache
        cacheRef.current.set(resolvedStoreId, {
          data: finalData,
          timestamp: now
        });
        
        console.log('useStoreSettings: Configurações carregadas com sucesso');
        setSettings(finalData);
        setError(null);
        
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
        console.error('useStoreSettings: Erro geral:', err);
        setError(errorMessage);
        setSettings(null);
      } finally {
        setLoading(false);
        requestRef.current = null;
      }
    })();

    requestRef.current = fetchPromise;
    return fetchPromise;
  }, [resolvedStoreId]);

  const updateSettings = useCallback(async (updates: Partial<StoreSettings>) => {
    if (!settings) {
      console.error('useStoreSettings: Configurações não encontradas para atualizar');
      return { data: null, error: 'Configurações não encontradas' };
    }

    try {
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
      
      // Atualizar cache
      if (resolvedStoreId) {
        cacheRef.current.set(resolvedStoreId, {
          data,
          timestamp: Date.now()
        });
      }
      
      setSettings(data);
      console.log('useStoreSettings: Configurações atualizadas com sucesso');
      return { data, error: null };
    } catch (error) {
      console.error('useStoreSettings: Erro na atualização:', error);
      return { data: null, error };
    }
  }, [settings, resolvedStoreId]);

  // Effect para buscar quando store ID estiver disponível
  useEffect(() => {
    if (resolvedStoreId) {
      console.log('useStoreSettings: Store ID resolvido, buscando configurações');
      fetchSettings();
    } else if (resolvedStoreId === null && !loading) {
      setLoading(false);
    }
  }, [resolvedStoreId, fetchSettings]);

  return {
    settings,
    loading,
    error,
    updateSettings,
    refetch: () => fetchSettings(true)
  };
};
