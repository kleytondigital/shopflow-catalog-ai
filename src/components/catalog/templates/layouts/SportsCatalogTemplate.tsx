
import React from 'react';
import { Store, CatalogType } from '@/hooks/useCatalog';
import CatalogHeader from '@/components/catalog/CatalogHeader';
import CatalogFooter from '@/components/catalog/CatalogFooter';
import HeroBanner from '@/components/catalog/banners/HeroBanner';
import PromotionalBanner from '@/components/catalog/banners/PromotionalBanner';

interface SportsCatalogTemplateProps {
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

const SportsCatalogTemplate: React.FC<SportsCatalogTemplateProps> = ({
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
    <div className="min-h-screen bg-gradient-to-br from-red-900 via-orange-800 to-yellow-700">
      {/* Header energético */}
      <div className="relative border-b border-orange-500/30">
        <div className="absolute inset-0 bg-gradient-to-r from-red-600/20 to-orange-600/20 backdrop-blur-sm"></div>
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

      {/* Hero Banner sports */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-red-500/30 via-orange-500/30 to-yellow-500/30"></div>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,rgba(239,68,68,0.2),transparent_70%)]"></div>
        <HeroBanner storeId={storeId} className="relative z-10 container mx-auto px-6 py-16" />
      </div>

      <div className="container mx-auto px-6 py-10">
        {/* Promotional Banners sports */}
        <div className="relative mb-10">
          <div className="absolute inset-0 bg-gradient-to-r from-red-600/10 to-orange-600/10 rounded-xl border border-orange-500/20 shadow-lg"></div>
          <PromotionalBanner storeId={storeId} className="relative z-10 p-6" />
        </div>

        {/* Main Content sports */}
        <main className="relative">
          <div className="absolute inset-0 bg-gradient-to-br from-slate-800/50 to-red-900/20 rounded-2xl border border-orange-500/20 backdrop-blur-sm"></div>
          <div className="relative z-10 p-8">
            {children}
          </div>
        </main>
      </div>

      <CatalogFooter store={store} />
    </div>
  );
};

export default SportsCatalogTemplate;
