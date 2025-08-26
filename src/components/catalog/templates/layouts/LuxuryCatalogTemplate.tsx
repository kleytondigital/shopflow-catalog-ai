
import React from 'react';
import { Store, CatalogType } from '@/hooks/useCatalog';
import CatalogHeader from '@/components/catalog/CatalogHeader';
import CatalogFooter from '@/components/catalog/CatalogFooter';
import HeroBanner from '@/components/catalog/banners/HeroBanner';
import PromotionalBanner from '@/components/catalog/banners/PromotionalBanner';

interface LuxuryCatalogTemplateProps {
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

const LuxuryCatalogTemplate: React.FC<LuxuryCatalogTemplateProps> = ({
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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-amber-900">
      {/* Header com overlay dourado */}
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-amber-600/20 to-yellow-500/20"></div>
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

      {/* Hero Banner com overlay elegante */}
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-slate-900/50 to-slate-900/80"></div>
        <HeroBanner storeId={storeId} className="relative z-10 container mx-auto px-6 py-12" />
      </div>

      <div className="container mx-auto px-6 py-12">
        {/* Promotional Banners com efeito premium */}
        <div className="relative mb-12">
          <div className="absolute inset-0 bg-gradient-to-r from-amber-500/10 to-yellow-500/10 rounded-2xl blur-xl"></div>
          <PromotionalBanner storeId={storeId} className="relative z-10" />
        </div>

        {/* Main Content com background premium */}
        <main className="relative">
          <div className="absolute inset-0 bg-gradient-to-b from-slate-800/30 to-slate-700/20 rounded-3xl backdrop-blur-sm"></div>
          <div className="relative z-10 p-8">
            {children}
          </div>
        </main>
      </div>

      <CatalogFooter store={store} />
    </div>
  );
};

export default LuxuryCatalogTemplate;
