
import React, { useEffect } from 'react';
import { useEditorSync } from '@/hooks/useEditorSync';
import TemplateManager from './templates/TemplateManager';
import { Store } from '@/hooks/useCatalog';
import { CatalogType } from '@/hooks/useCatalog';

interface TemplateWrapperProps {
  templateName: string;
  store: Store;
  catalogType: CatalogType;
  cartItemsCount: number;
  wishlistCount: number;
  whatsappNumber?: string;
  onSearch: (query: string) => void;
  onToggleFilters: () => void;
  onCartClick: () => void;
  children: React.ReactNode;
}

const TemplateWrapper: React.FC<TemplateWrapperProps> = ({
  templateName,
  store,
  catalogType,
  cartItemsCount,
  wishlistCount,
  whatsappNumber,
  onSearch,
  onToggleFilters,
  onCartClick,
  children
}) => {
  const { settings } = useEditorSync(store.url_slug || store.id);

  // Aplicar configurações globais do editor ao documento
  useEffect(() => {
    if (settings) {
      const root = document.documentElement;
      
      // Aplicar configurações de fonte
      if (settings.font_family) {
        root.style.setProperty('--template-font-family', settings.font_family);
      }
      
      // Aplicar configurações de espaçamento
      if (settings.layout_spacing) {
        root.style.setProperty('--template-spacing', `${settings.layout_spacing}px`);
      }
      
      // Aplicar configurações de border radius
      if (settings.border_radius) {
        root.style.setProperty('--template-border-radius', `${settings.border_radius}px`);
      }
    }
  }, [settings]);

  const templateProps = {
    store,
    catalogType,
    cartItemsCount,
    wishlistCount,
    whatsappNumber,
    onSearch,
    onToggleFilters,
    onCartClick,
    children
  };

  // Usar o novo TemplateManager que gerencia todos os templates
  return <TemplateManager {...templateProps} />;
};

export default TemplateWrapper;
