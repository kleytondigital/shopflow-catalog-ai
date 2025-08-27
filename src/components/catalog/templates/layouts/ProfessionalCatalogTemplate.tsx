
import React from 'react';
import { Store, CatalogType } from '@/hooks/useCatalog';
import CatalogHeader from '@/components/catalog/CatalogHeader';
import CatalogFooter from '@/components/catalog/CatalogFooter';
import HeroBanner from '@/components/catalog/banners/HeroBanner';
import PromotionalBanner from '@/components/catalog/banners/PromotionalBanner';

interface ProfessionalCatalogTemplateProps {
  store: Store;
  catalogType: CatalogType;
  cartItemsCount: number;
  wishlistCount: number;
  whatsappNumber?: string;
  onSearch: (query: string) => void;
  onToggleFilters: () => void;
  onCartClick: () => void;
  children: React.ReactNode;
  editorSettings?: any;
}

const ProfessionalCatalogTemplate: React.FC<ProfessionalCatalogTemplateProps> = ({
  store,
  catalogType,
  cartItemsCount,
  wishlistCount,
  whatsappNumber,
  onSearch,
  onToggleFilters,
  onCartClick,
  children,
  editorSettings
}) => {
  const storeId = store.url_slug || store.id;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header profissional e limpo */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <CatalogHeader
          store={store}
          catalogType={catalogType}
          cartItemsCount={cartItemsCount}
          wishlistCount={wishlistCount}
          onSearch={onSearch}
          onToggleFilters={onToggleFilters}
          onCartClick={onCartClick}
        />
      </div>

      {/* Hero Banner profissional */}
      <div className="bg-white border-b border-gray-200">
        <HeroBanner storeId={storeId} className="container mx-auto px-6 py-12" />
      </div>

      {/* Promotional Banners */}
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-6 py-6">
          <PromotionalBanner storeId={storeId} />
        </div>
      </div>

      {/* Main Content com layout profissional */}
      <div className="container mx-auto px-6 py-8">
        <main className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
          {children}
        </main>
      </div>

      <CatalogFooter store={store} />
    </div>
  );
};

export default ProfessionalCatalogTemplate;
