import React, { useEffect } from 'react';
import { useEditorSync } from '@/hooks/useEditorSync';
import ProfessionalCatalogTemplate from './templates/layouts/ProfessionalCatalogTemplate';
import ModernCatalogTemplate from './templates/layouts/ModernCatalogTemplate';
import IndustrialCatalogTemplate from './templates/layouts/IndustrialCatalogTemplate';
import MinimalCatalogTemplate from './templates/layouts/MinimalCatalogTemplate';
import ElegantCatalogTemplate from './templates/layouts/ElegantCatalogTemplate';
import LuxuryCatalogTemplate from './templates/layouts/LuxuryCatalogTemplate';
import TechCatalogTemplate from './templates/layouts/TechCatalogTemplate';
import FashionCatalogTemplate from './templates/layouts/FashionCatalogTemplate';
import HealthCatalogTemplate from './templates/layouts/HealthCatalogTemplate';
import SportsCatalogTemplate from './templates/layouts/SportsCatalogTemplate';
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
    children,
    editorSettings: settings
  };

  switch (templateName) {
    case 'professional':
      return <ProfessionalCatalogTemplate {...templateProps} />;
    case 'luxury':
      return <LuxuryCatalogTemplate {...templateProps} />;
    case 'tech':
      return <TechCatalogTemplate {...templateProps} />;
    case 'fashion':
      return <FashionCatalogTemplate {...templateProps} />;
    case 'health':
      return <HealthCatalogTemplate {...templateProps} />;
    case 'sports':
      return <SportsCatalogTemplate {...templateProps} />;
    case 'industrial':
      return <IndustrialCatalogTemplate {...templateProps} />;
    case 'minimal':
      return <MinimalCatalogTemplate {...templateProps} />;
    case 'elegant':
      return <ElegantCatalogTemplate {...templateProps} />;
    case 'modern':
    default:
      return <ProfessionalCatalogTemplate {...templateProps} />;
  }
};

export default TemplateWrapper;
