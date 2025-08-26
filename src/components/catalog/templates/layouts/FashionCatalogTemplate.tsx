
import React from 'react';
import { Store, CatalogType } from '@/hooks/useCatalog';
import CatalogHeader from '@/components/catalog/CatalogHeader';
import CatalogFooter from '@/components/catalog/CatalogFooter';
import HeroBanner from '@/components/catalog/banners/HeroBanner';
import PromotionalBanner from '@/components/catalog/banners/PromotionalBanner';

interface FashionCatalogTemplateProps {
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

const FashionCatalogTemplate: React.FC<FashionCatalogTemplateProps> = ({
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
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-rose-50 to-orange-50">
      {/* Header fashion */}
      <div className="relative border-b border-pink-200/50">
        <div className="absolute inset-0 bg-gradient-to-r from-pink-500/5 to-orange-500/5"></div>
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

      {/* Hero Banner fashion */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-pink-200/30 via-rose-200/30 to-orange-200/30"></div>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(236,72,153,0.1),transparent_70%)]"></div>
        <HeroBanner storeId={storeId} className="relative z-10 container mx-auto px-6 py-16" />
      </div>

      <div className="container mx-auto px-6 py-10">
        {/* Promotional Banners estilo magazine */}
        <div className="relative mb-10">
          <div className="absolute inset-0 bg-gradient-to-r from-pink-100/50 to-orange-100/50 rounded-2xl shadow-lg"></div>
          <PromotionalBanner storeId={storeId} className="relative z-10 p-8" />
        </div>

        {/* Main Content fashion */}
        <main className="relative">
          <div className="absolute inset-0 bg-white/70 backdrop-blur rounded-3xl shadow-xl border border-pink-200/30"></div>
          <div className="relative z-10 p-10">
            {children}
          </div>
        </main>
      </div>

      <CatalogFooter store={store} />
    </div>
  );
};

export default FashionCatalogTemplate;
