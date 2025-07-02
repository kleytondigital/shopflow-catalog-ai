import React from "react";
import { Store, CatalogType } from "@/hooks/useCatalog";
import CatalogHeader from "@/components/catalog/CatalogHeader";
import CatalogFooter from "@/components/catalog/CatalogFooter";
import HeroBanner from "@/components/catalog/banners/HeroBanner";
import PromotionalBanner from "@/components/catalog/banners/PromotionalBanner";
import SidebarBanner from "@/components/catalog/banners/SidebarBanner";

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
  editorSettings?: any;
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
  children,
  editorSettings,
}) => {
  const storeId = store.url_slug || store.id;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
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
      <HeroBanner storeId={storeId} className="container mx-auto px-4 py-6" />

      <div className="container mx-auto px-4 py-8">
        {/* Promotional Banners */}
        <PromotionalBanner storeId={storeId} className="mb-8" />

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar with Banners */}
          {/* <aside className="lg:w-64 flex-shrink-0">
            <SidebarBanner storeId={storeId} />
          </aside> */}

          {/* Main Content */}
          <main className="flex-1">{children}</main>
        </div>
      </div>

      <CatalogFooter store={store} />
    </div>
  );
};

export default ModernCatalogTemplate;
