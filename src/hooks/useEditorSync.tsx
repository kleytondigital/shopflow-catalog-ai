
import { useEffect } from 'react';
import { useCatalogSettings } from '@/hooks/useCatalogSettings';

export const useEditorSync = (storeIdentifier: string) => {
  const { settings, loading } = useCatalogSettings(storeIdentifier);

  const applyEditorStyles = () => {
    if (!settings || loading) return;

    // Aplicar cores CSS customizadas
    const root = document.documentElement;
    
    root.style.setProperty('--template-primary', settings.primary_color || '#0057FF');
    root.style.setProperty('--template-secondary', settings.secondary_color || '#FF6F00');
    root.style.setProperty('--template-accent', settings.accent_color || '#8E2DE2');
    root.style.setProperty('--template-background', settings.background_color || '#F8FAFC');
    root.style.setProperty('--template-text', settings.text_color || '#1E293B');
    root.style.setProperty('--template-border', settings.border_color || '#E2E8F0');
    root.style.setProperty('--template-surface', '#FFFFFF');
  };

  useEffect(() => {
    applyEditorStyles();
  }, [settings, loading]);

  return {
    settings,
    loading,
    templateName: settings?.template_name || 'modern'
  };
};
