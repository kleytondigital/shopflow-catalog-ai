
import React, { useState, useEffect } from 'react';
import { useCatalog } from '@/hooks/useCatalog';
import { useCatalogSettings } from '@/hooks/useCatalogSettings';
import ProductGrid from './ProductGrid';
import CatalogHeader from './CatalogHeader';
import CatalogFooter from './CatalogFooter';
import FilterSidebar from './FilterSidebar';
import { Product, CatalogType } from '@/hooks/useCatalog';

interface PublicCatalogProps {
  storeIdentifier: string;
  catalogType?: CatalogType;
}

const PublicCatalog: React.FC<PublicCatalogProps> = ({
  storeIdentifier,
  catalogType = 'retail'
}) => {
  const { store, products, filteredProducts, loading: catalogLoading, searchProducts, filterProducts } = useCatalog(storeIdentifier, catalogType);
  const { settings, loading: settingsLoading } = useCatalogSettings(storeIdentifier);
  
  const [wishlist, setWishlist] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const handleAddToWishlist = (product: Product) => {
    setWishlist(prev => {
      const isAlreadyInWishlist = prev.some(item => item.id === product.id);
      if (isAlreadyInWishlist) {
        return prev.filter(item => item.id !== product.id);
      } else {
        return [...prev, product];
      }
    });
  };

  const handleQuickView = (product: Product) => {
    setSelectedProduct(product);
  };

  const loading = catalogLoading || settingsLoading;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!store) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Loja não encontrada</h1>
          <p className="text-gray-600">A loja que você está procurando não existe ou não está ativa.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <CatalogHeader 
        store={store}
        onSearch={searchProducts}
        catalogType={catalogType}
        showSearch={settings?.show_prices !== false} // Usar configurações
      />
      
      <main className="container mx-auto px-4 py-6">
        <div className="flex gap-6">
          {settings?.allow_categories_filter && (
            <aside className="w-64 hidden lg:block">
              <FilterSidebar
                products={products}
                onFilter={filterProducts}
                showPriceFilter={settings?.allow_price_filter !== false}
              />
            </aside>
          )}
          
          <div className="flex-1">
            <ProductGrid
              products={filteredProducts}
              catalogType={catalogType}
              loading={loading}
              onAddToWishlist={handleAddToWishlist}
              onQuickView={handleQuickView}
              wishlist={wishlist}
              storeIdentifier={storeIdentifier}
              templateName={settings?.template_name || 'modern'} // Passar o template das configurações
            />
          </div>
        </div>
      </main>

      <CatalogFooter store={store} />
    </div>
  );
};

export default PublicCatalog;
