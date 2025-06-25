
import React from 'react';
import { Store, CatalogType } from '@/hooks/useCatalog';
import CatalogHeader from '@/components/catalog/CatalogHeader';
import CatalogFooter from '@/components/catalog/CatalogFooter';
import HeroBanner from '@/components/catalog/banners/HeroBanner';
import PromotionalBanner from '@/components/catalog/banners/PromotionalBanner';

interface IndustrialCatalogTemplateProps {
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

const IndustrialCatalogTemplate: React.FC<IndustrialCatalogTemplateProps> = ({
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
    <div className="min-h-screen bg-gray-100">
      <CatalogHeader
        store={store}
        catalogType={catalogType}
        cartItemsCount={cartItemsCount}
        wishlistCount={wishlistCount}
        onSearch={onSearch}
        onToggleFilters={onToggleFilters}
        onCartClick={onCartClick}
      />

      {/* Hero Banner Section */}
      <HeroBanner storeId={storeId} className="container mx-auto px-4 py-4" />

      <div className="container mx-auto px-4 py-6">
        {/* Promotional Banners */}
        <PromotionalBanner storeId={storeId} className="mb-6" />

        {/* Main Content */}
        <main className="bg-white rounded-lg shadow-sm p-6">
          {children}
        </main>
      </div>

      <CatalogFooter store={store} />
    </div>
  );
};

export default IndustrialCatalogTemplate;
