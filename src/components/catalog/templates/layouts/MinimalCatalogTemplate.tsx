import React from "react";
import { Store, CatalogType } from "@/hooks/useCatalog";
import { CatalogSettingsData } from "@/hooks/useCatalogSettings";
import CatalogHeader from "@/components/catalog/CatalogHeader";
import CatalogFooter from "@/components/catalog/CatalogFooter";
import HeroBanner from "@/components/catalog/banners/HeroBanner";
import PromotionalBanner from "@/components/catalog/banners/PromotionalBanner";

interface MinimalCatalogTemplateProps {
  store: Store;
  catalogType: CatalogType;
  cartItemsCount: number;
  wishlistCount: number;
  whatsappNumber?: string;
  storeSettings?: CatalogSettingsData | null;
  onSearch: (query: string) => void;
  onToggleFilters: () => void;
  onCartClick: () => void;
  children: React.ReactNode;
  editorSettings?: any;
}

const MinimalCatalogTemplate: React.FC<MinimalCatalogTemplateProps> = ({
  store,
  catalogType,
  cartItemsCount,
  wishlistCount,
  whatsappNumber,
  storeSettings,
  onSearch,
  onToggleFilters,
  onCartClick,
  children,
  editorSettings,
}) => {
  const storeId = store.url_slug || store.id;

  return (
    <div className="min-h-screen bg-white">
      <CatalogHeader
        store={store}
        catalogType={catalogType}
        cartItemsCount={cartItemsCount}
        wishlistCount={wishlistCount}
        onSearch={onSearch}
        onToggleFilters={onToggleFilters}
        onCartClick={onCartClick}
      />

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Hero Banner Section */}
        <HeroBanner storeId={storeId} className="mb-12" />

        {/* Promotional Banners */}
        <PromotionalBanner storeId={storeId} className="mb-12" />

        {/* Main Content */}
        <main>{children}</main>
      </div>

      <CatalogFooter
        store={store}
        whatsappNumber={whatsappNumber}
        storeSettings={storeSettings}
      />
    </div>
  );
};

export default MinimalCatalogTemplate;
