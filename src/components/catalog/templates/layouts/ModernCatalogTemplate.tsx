
import React, { useEffect } from 'react';
import { useTemplateColors } from '@/hooks/useTemplateColors';
import CatalogHeader from '../../CatalogHeader';
import CatalogFooter from '../../CatalogFooter';
import FloatingCart from '../../FloatingCart';
import FloatingWhatsApp from '../../FloatingWhatsApp';
import { Store } from '@/hooks/useCatalog';
import { CatalogType } from '@/hooks/useCatalog';

interface ModernCatalogTemplateProps {
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

const ModernCatalogTemplate: React.FC<ModernCatalogTemplateProps> = ({
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
  const { applyColorsToDocument, colors } = useTemplateColors(store.url_slug || store.id);

  useEffect(() => {
    applyColorsToDocument();
  }, [applyColorsToDocument]);

  const backgroundStyle = colors ? 
    `linear-gradient(135deg, ${colors.background}dd 0%, ${colors.primary}11 50%, ${colors.secondary}11 100%)` :
    'linear-gradient(135deg, #f8fafc 0%, #0057ff11 50%, #ff6f0011 100%)';

  return (
    <div className="min-h-screen" style={{ background: backgroundStyle }}>
      <style>{`
        .btn-primary {
          background: linear-gradient(135deg, var(--template-primary, #0057FF), var(--template-secondary, #FF6F00));
          border: none;
          color: white;
          transition: all 0.3s ease;
          border-radius: 8px;
          font-weight: 500;
        }
        .btn-primary:hover {
          background: linear-gradient(135deg, var(--template-secondary, #FF6F00), var(--template-accent, #8E2DE2));
          transform: translateY(-2px);
          box-shadow: 0 10px 25px rgba(0, 87, 255, 0.3);
        }
        .template-card {
          background: var(--template-surface, #ffffff);
          border: 1px solid var(--template-border, #e2e8f0);
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
          transition: all 0.3s ease;
          border-radius: 12px;
        }
        .template-card:hover {
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
          transform: translateY(-5px);
          border-color: var(--template-primary, #0057FF);
        }
        .catalog-header {
          background: var(--template-surface, #ffffff);
          border-bottom: 1px solid var(--template-border, #e2e8f0);
        }
        .text-primary {
          color: var(--template-primary, #0057FF) !important;
        }
        .bg-primary {
          background-color: var(--template-primary, #0057FF) !important;
        }
        .border-primary {
          border-color: var(--template-primary, #0057FF) !important;
        }
      `}</style>
      
      <div className="catalog-header">
        <CatalogHeader 
          store={store}
          catalogType={catalogType}
          cartItemsCount={cartItemsCount}
          wishlistCount={wishlistCount}
          whatsappNumber={whatsappNumber}
          onSearch={onSearch}
          onToggleFilters={onToggleFilters}
          onCartClick={onCartClick}
        />
      </div>
      
      <main className="container mx-auto px-4 py-6">
        {children}
      </main>

      <CatalogFooter store={store} />
      
      <FloatingCart onCheckout={onCartClick} />
      {whatsappNumber && <FloatingWhatsApp phoneNumber={whatsappNumber} />}
    </div>
  );
};

export default ModernCatalogTemplate;
