
import { useEffect } from 'react';
import { useCatalogSettings } from '@/hooks/useCatalogSettings';
import { useEditorStore } from '../stores/useEditorStore';
import { useAuth } from '@/hooks/useAuth';

export const useTemplateSync = () => {
  const { profile } = useAuth();
  const { settings, updateSettings, loading } = useCatalogSettings();
  const { configuration, updateConfiguration, loadFromDatabase, isDirty } = useEditorStore();

  // Carregar configurações do banco na inicialização
  useEffect(() => {
    if (settings && !loading) {
      console.log('useTemplateSync: Carregando configurações do banco:', settings);
      loadFromDatabase(settings);
    }
  }, [settings, loading, loadFromDatabase]);

  // Função para salvar no banco
  const saveToDatabase = async () => {
    if (!settings || !updateSettings) {
      throw new Error('Configurações não disponíveis para salvar');
    }

    console.log('useTemplateSync: Salvando configurações:', configuration);

    const updates = {
      template_name: configuration.global.templateName,
      primary_color: configuration.global.primaryColor,
      secondary_color: configuration.global.secondaryColor,
      accent_color: configuration.global.accentColor,
      background_color: configuration.global.backgroundColor,
      text_color: configuration.global.textColor,
      border_color: configuration.global.borderColor,
      show_prices: configuration.checkout.showPrices,
      allow_categories_filter: configuration.checkout.allowFilters,
    };

    const result = await updateSettings(updates);
    
    if (result.error) {
      throw new Error('Erro ao salvar no banco de dados');
    }

    // Marcar como salvo
    useEditorStore.setState({ isDirty: false });
    
    return result;
  };

  return {
    settings,
    saveToDatabase,
    isConnected: !!settings && !loading,
    loading
  };
};
