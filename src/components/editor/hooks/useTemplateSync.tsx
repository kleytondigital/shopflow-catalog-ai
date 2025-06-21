
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
  }, [settings, loading]);

  // Função para salvar no banco
  const saveToDatabase = async () => {
    if (!settings || !updateSettings) {
      throw new Error('Configurações não disponíveis para salvar');
    }

    console.log('useTemplateSync: Salvando configurações:', configuration);

    const updates = {
      template_name: configuration.global.template,
      primary_color: configuration.colors.primary,
      secondary_color: configuration.colors.secondary,
      accent_color: configuration.colors.accent,
      background_color: configuration.colors.background,
      text_color: configuration.colors.text,
      border_color: configuration.colors.border,
      font_family: configuration.global.fontFamily,
      layout_spacing: configuration.global.layoutSpacing,
      border_radius: configuration.global.borderRadius,
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
