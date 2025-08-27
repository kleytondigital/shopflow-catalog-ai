
import React from 'react';
import { Store, CatalogType } from '@/hooks/useCatalog';
import CatalogHeader from '@/components/catalog/CatalogHeader';
import CatalogFooter from '@/components/catalog/CatalogFooter';

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
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header profissional e limpo */}
      <CatalogHeader
        store={store}
        catalogType={catalogType}
        cartItemsCount={cartItemsCount}
        wishlistCount={wishlistCount}
        onSearch={onSearch}
        onToggleFilters={onToggleFilters}
        onCartClick={onCartClick}
      />

      {/* Main Content */}
      <main className="flex-1">
        {children}
      </main>

      <CatalogFooter store={store} />
    </div>
  );
};

export default ProfessionalCatalogTemplate;
