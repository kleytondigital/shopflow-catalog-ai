import React from "react";
import { Store, CatalogType } from "@/hooks/useCatalog";
import { CatalogSettingsData } from "@/hooks/useCatalogSettings";
import CatalogHeader from "@/components/catalog/CatalogHeader";
import CatalogFooter from "@/components/catalog/CatalogFooter";
import HeroBanner from "@/components/catalog/banners/HeroBanner";
import PromotionalBanner from "@/components/catalog/banners/PromotionalBanner";
import SidebarBanner from "@/components/catalog/banners/SidebarBanner";

interface ElegantCatalogTemplateProps {
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

const ElegantCatalogTemplate: React.FC<ElegantCatalogTemplateProps> = ({
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
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
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
      <HeroBanner storeId={storeId} className="container mx-auto px-6 py-8" />

      <div className="container mx-auto px-6 py-10">
        {/* Promotional Banners */}
        <PromotionalBanner storeId={storeId} className="mb-10" />

        <div className="flex flex-col xl:flex-row gap-10">
          {/* Sidebar with Banners */}
          {/* <aside className="xl:w-80 flex-shrink-0">
            <div className="sticky top-6">
              <SidebarBanner storeId={storeId} />
            </div>
          </aside> */}

          {/* Main Content */}
          <main className="flex-1">{children}</main>
        </div>
      </div>

      <CatalogFooter
        store={store}
        whatsappNumber={whatsappNumber}
        storeSettings={storeSettings}
      />
    </div>
  );
};

export default ElegantCatalogTemplate;
