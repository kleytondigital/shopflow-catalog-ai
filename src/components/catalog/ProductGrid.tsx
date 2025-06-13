
import React, { memo } from 'react';
import { Loader2 } from 'lucide-react';
import ProductCard from './ProductCard';
import { Product } from '@/hooks/useProducts';
import { CatalogType } from '@/hooks/useCatalog';

interface ProductGridProps {
  products: Product[];
  catalogType: CatalogType;
  loading: boolean;
  onAddToCart: (product: Product) => void;
  onAddToWishlist: (product: Product) => void;
  onQuickView: (product: Product) => void;
  wishlist: Product[];
}

// Skeleton component para loading state
const ProductSkeleton = memo(() => (
  <div className="bg-white rounded-lg shadow-sm border overflow-hidden animate-pulse">
    <div className="aspect-square bg-gray-200" />
    <div className="p-4 space-y-3">
      <div className="h-4 bg-gray-200 rounded w-3/4" />
      <div className="h-3 bg-gray-200 rounded w-1/2" />
      <div className="flex justify-between items-center">
        <div className="h-5 bg-gray-200 rounded w-1/3" />
        <div className="h-8 bg-gray-200 rounded w-1/4" />
      </div>
    </div>
  </div>
));

ProductSkeleton.displayName = 'ProductSkeleton';

// Componente de estado vazio
const EmptyState = memo(() => (
  <div className="text-center py-20">
    <div className="w-24 h-24 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
      <span className="text-4xl">📦</span>
    </div>
    <h3 className="text-xl font-semibold text-gray-900 mb-2">
      Nenhum produto encontrado
    </h3>
    <p className="text-gray-600 max-w-md mx-auto">
      Não encontramos produtos que correspondam aos seus critérios de busca. 
      Tente ajustar os filtros ou buscar por outros termos.
    </p>
  </div>
));

EmptyState.displayName = 'EmptyState';

const ProductGrid: React.FC<ProductGridProps> = memo(({
  products,
  catalogType,
  loading,
  onAddToCart,
  onAddToWishlist,
  onQuickView,
  wishlist
}) => {
  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {Array.from({ length: 8 }).map((_, index) => (
          <ProductSkeleton key={`skeleton-${index}`} />
        ))}
      </div>
    );
  }

  if (products.length === 0) {
    return <EmptyState />;
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {products.map((product) => (
        <div key={product.id} className="transition-opacity duration-200">
          <ProductCard
            product={product}
            catalogType={catalogType}
            onAddToCart={onAddToCart}
            onAddToWishlist={onAddToWishlist}
            onQuickView={onQuickView}
            isInWishlist={wishlist.some(item => item.id === product.id)}
          />
        </div>
      ))}
    </div>
  );
});

ProductGrid.displayName = 'ProductGrid';

export default ProductGrid;
