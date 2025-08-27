
import React from 'react';
import { Store, CatalogType } from '@/hooks/useCatalog';
import { useTemplateColors } from '@/hooks/useTemplateColors';
import { useCatalogSettings } from '@/hooks/useCatalogSettings';

// Importar templates de estilo
import MinimalTemplate from './styles/MinimalTemplate';
import DarkTemplate from './styles/DarkTemplate';
import VibrantTemplate from './styles/VibrantTemplate';
import NeutralTemplate from './styles/NeutralTemplate';

// Importar templates de layout (compatibilidade)
import ProfessionalCatalogTemplate from './layouts/ProfessionalCatalogTemplate';
import ModernCatalogTemplate from './layouts/ModernCatalogTemplate';
import IndustrialCatalogTemplate from './layouts/IndustrialCatalogTemplate';
import ElegantCatalogTemplate from './layouts/ElegantCatalogTemplate';
import LuxuryCatalogTemplate from './layouts/LuxuryCatalogTemplate';
import TechCatalogTemplate from './layouts/TechCatalogTemplate';
import FashionCatalogTemplate from './layouts/FashionCatalogTemplate';
import HealthCatalogTemplate from './layouts/HealthCatalogTemplate';
import SportsCatalogTemplate from './layouts/SportsCatalogTemplate';

interface TemplateManagerProps {
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

// Mapeamento de templates legados para novos estilos
const TEMPLATE_MAPPING = {
  // Novos templates baseados em estilo
  'minimal-fashion': { style: 'minimal', niche: 'fashion' },
  'minimal-electronics': { style: 'minimal', niche: 'electronics' },
  'minimal-food': { style: 'minimal', niche: 'food' },
  'minimal-cosmetics': { style: 'minimal', niche: 'cosmetics' },
  
  'dark-fashion': { style: 'dark', niche: 'fashion' },
  'dark-electronics': { style: 'dark', niche: 'electronics' },
  'dark-food': { style: 'dark', niche: 'food' },
  'dark-cosmetics': { style: 'dark', niche: 'cosmetics' },
  
  'vibrant-fashion': { style: 'vibrant', niche: 'fashion' },
  'vibrant-electronics': { style: 'vibrant', niche: 'electronics' },
  'vibrant-food': { style: 'vibrant', niche: 'food' },
  'vibrant-cosmetics': { style: 'vibrant', niche: 'cosmetics' },
  
  'neutral-fashion': { style: 'neutral', niche: 'fashion' },
  'neutral-electronics': { style: 'neutral', niche: 'electronics' },
  'neutral-food': { style: 'neutral', niche: 'food' },
  'neutral-cosmetics': { style: 'neutral', niche: 'cosmetics' },

  // Compatibilidade com templates legados
  'professional': { style: 'neutral', niche: 'electronics' },
  'modern': { style: 'vibrant', niche: 'fashion' },
  'luxury': { style: 'dark', niche: 'fashion' },
  'tech': { style: 'dark', niche: 'electronics' },
  'fashion': { style: 'vibrant', niche: 'fashion' },
  'health': { style: 'neutral', niche: 'cosmetics' },
  'sports': { style: 'vibrant', niche: 'electronics' },
  'minimal': { style: 'minimal', niche: 'fashion' },
  'elegant': { style: 'minimal', niche: 'cosmetics' },
  'industrial': { style: 'neutral', niche: 'electronics' }
};

const TemplateManager: React.FC<TemplateManagerProps> = (props) => {
  const { store } = props;
  const storeIdentifier = store.url_slug || store.id;
  const { settings } = useCatalogSettings(storeIdentifier);
  
  // Aplicar cores do template automaticamente
  const { applyColorsToDocument } = useTemplateColors(storeIdentifier);
  
  React.useEffect(() => {
    applyColorsToDocument();
  }, [applyColorsToDocument, settings]);

  // Determinar template e configurações
  const templateName = settings?.template_name || 'professional';
  const templateConfig = TEMPLATE_MAPPING[templateName as keyof typeof TEMPLATE_MAPPING];
  
  if (!templateConfig) {
    console.warn(`Template '${templateName}' não encontrado, usando padrão`);
    return <ProfessionalCatalogTemplate {...props} editorSettings={settings} />;
  }

  const { style, niche } = templateConfig;

  // Renderizar template baseado no estilo
  const templateProps = {
    ...props,
    editorSettings: settings,
    niche: niche as 'fashion' | 'electronics' | 'food' | 'cosmetics'
  };

  switch (style) {
    case 'minimal':
      return <MinimalTemplate {...templateProps} />;
    case 'dark':
      return <DarkTemplate {...templateProps} />;
    case 'vibrant':
      return <VibrantTemplate {...templateProps} />;
    case 'neutral':
      return <NeutralTemplate {...templateProps} />;
    default:
      // Fallback para templates legados
      return <ProfessionalCatalogTemplate {...props} editorSettings={settings} />;
  }
};

export default TemplateManager;
