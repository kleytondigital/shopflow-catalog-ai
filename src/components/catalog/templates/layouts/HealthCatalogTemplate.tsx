
import React from 'react';
import { Store, CatalogType } from '@/hooks/useCatalog';
import CatalogHeader from '@/components/catalog/CatalogHeader';
import CatalogFooter from '@/components/catalog/CatalogFooter';
import HeroBanner from '@/components/catalog/banners/HeroBanner';
import PromotionalBanner from '@/components/catalog/banners/PromotionalBanner';

interface HealthCatalogTemplateProps {
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

const HealthCatalogTemplate: React.FC<HealthCatalogTemplateProps> = ({
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
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-blue-50">
      {/* Header clean e confiável */}
      <div className="relative border-b border-emerald-200/30">
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/5 to-teal-500/5"></div>
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

      {/* Hero Banner health */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-emerald-100/40 via-teal-100/40 to-blue-100/40"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(16,185,129,0.1),transparent_70%)]"></div>
        <HeroBanner storeId={storeId} className="relative z-10 container mx-auto px-6 py-16" />
      </div>

      <div className="container mx-auto px-6 py-10">
        {/* Promotional Banners health */}
        <div className="relative mb-10">
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl border border-emerald-200/50 shadow-sm"></div>
          <PromotionalBanner storeId={storeId} className="relative z-10 p-6" />
        </div>

        {/* Main Content health */}
        <main className="relative">
          <div className="absolute inset-0 bg-white/80 backdrop-blur rounded-2xl shadow-lg border border-emerald-200/20"></div>
          <div className="relative z-10 p-8">
            {children}
          </div>
        </main>
      </div>

      <CatalogFooter store={store} />
    </div>
  );
};

export default HealthCatalogTemplate;
