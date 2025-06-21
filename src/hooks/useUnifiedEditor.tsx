
import { useEffect, useCallback } from 'react';
import { useEditorStore } from '@/components/editor/stores/useEditorStore';
import { useTemplateSync } from '@/components/editor/hooks/useTemplateSync';

export const useUnifiedEditor = () => {
  const { configuration, updateConfiguration, isDirty } = useEditorStore();
  const { saveToDatabase, isConnected, loading } = useTemplateSync();

  // Aplicar estilos CSS imediatamente quando configurações mudarem
  const applyStylesImmediately = useCallback(() => {
    const root = document.documentElement;
    
    // Aplicar cores primárias
    root.style.setProperty('--template-primary', configuration.colors.primary);
    root.style.setProperty('--template-secondary', configuration.colors.secondary);
    root.style.setProperty('--template-accent', configuration.colors.accent);
    root.style.setProperty('--template-background', configuration.colors.background);
    root.style.setProperty('--template-text', configuration.colors.text);
    root.style.setProperty('--template-border', configuration.colors.border);
    root.style.setProperty('--template-surface', configuration.colors.surface);
    
    // Aplicar gradientes
    root.style.setProperty('--template-gradient-from', configuration.colors.primary);
    root.style.setProperty('--template-gradient-to', configuration.colors.secondary);
    root.style.setProperty('--template-gradient-primary', 
      `linear-gradient(135deg, ${configuration.colors.primary} 0%, ${configuration.colors.secondary} 100%)`);
    root.style.setProperty('--template-gradient-accent', 
      `linear-gradient(135deg, ${configuration.colors.accent} 0%, ${configuration.colors.primary} 100%)`);
    
    // Aplicar configurações de layout
    root.style.setProperty('--template-font-family', configuration.global.fontFamily);
    root.style.setProperty('--template-border-radius', `${configuration.global.borderRadius}px`);
    root.style.setProperty('--template-spacing', `${configuration.global.layoutSpacing}px`);
    
    // Aplicar tamanhos de fonte
    root.style.setProperty('--template-font-size-small', `${configuration.global.fontSize.small}px`);
    root.style.setProperty('--template-font-size-medium', `${configuration.global.fontSize.medium}px`);
    root.style.setProperty('--template-font-size-large', `${configuration.global.fontSize.large}px`);
    
    // Aplicar espaçamentos
    root.style.setProperty('--template-spacing-small', `${configuration.global.spacing.small}px`);
    root.style.setProperty('--template-spacing-medium', `${configuration.global.spacing.medium}px`);
    root.style.setProperty('--template-spacing-large', `${configuration.global.spacing.large}px`);
    
    console.log('🎨 Estilos aplicados em tempo real:', {
      primary: configuration.colors.primary,
      secondary: configuration.colors.secondary,
      accent: configuration.colors.accent
    });
  }, [configuration]);

  // Aplicar estilos sempre que a configuração mudar
  useEffect(() => {
    applyStylesImmediately();
  }, [applyStylesImmediately]);

  const updateConfigurationWithStyles = useCallback((updates: any, value?: any) => {
    updateConfiguration(updates, value);
    // Aplicar estilos imediatamente após atualização
    setTimeout(() => {
      applyStylesImmediately();
    }, 50);
  }, [updateConfiguration, applyStylesImmediately]);

  return {
    configuration,
    updateConfiguration: updateConfigurationWithStyles,
    saveToDatabase,
    isConnected,
    loading,
    isDirty,
    applyStylesImmediately
  };
};
