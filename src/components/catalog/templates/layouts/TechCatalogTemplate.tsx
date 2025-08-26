
import React from 'react';
import { Store, CatalogType } from '@/hooks/useCatalog';
import CatalogHeader from '@/components/catalog/CatalogHeader';
import CatalogFooter from '@/components/catalog/CatalogFooter';
import HeroBanner from '@/components/catalog/banners/HeroBanner';
import PromotionalBanner from '@/components/catalog/banners/PromotionalBanner';

interface TechCatalogTemplateProps {
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

const TechCatalogTemplate: React.FC<TechCatalogTemplateProps> = ({
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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900">
      {/* Header futurista */}
      <div className="relative border-b border-blue-500/20">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-purple-600/10 backdrop-blur-sm"></div>
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

      {/* Hero Banner tech */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-blue-500/20 via-purple-500/20 to-cyan-500/20"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.15),transparent_70%)]"></div>
        <HeroBanner storeId={storeId} className="relative z-10 container mx-auto px-6 py-16" />
      </div>

      <div className="container mx-auto px-6 py-10">
        {/* Promotional Banners com efeito tech */}
        <div className="relative mb-10">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5 rounded-xl border border-blue-500/20"></div>
          <PromotionalBanner storeId={storeId} className="relative z-10 p-6" />
        </div>

        {/* Main Content tech */}
        <main className="relative">
          <div className="absolute inset-0 bg-gradient-to-br from-slate-800/40 to-blue-900/20 rounded-2xl border border-blue-500/10 backdrop-blur-sm"></div>
          <div className="relative z-10 p-8">
            {children}
          </div>
        </main>
      </div>

      <CatalogFooter store={store} />
    </div>
  );
};

export default TechCatalogTemplate;
