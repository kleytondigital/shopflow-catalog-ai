
import React from 'react';
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

const ProductGrid: React.FC<ProductGridProps> = ({
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
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Carregando produtos...</p>
        </div>
      </div>
    );
  }

  if (products.length === 0) {
    return (
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
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {products.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          catalogType={catalogType}
          onAddToCart={onAddToCart}
          onAddToWishlist={onAddToWishlist}
          onQuickView={onQuickView}
          isInWishlist={wishlist.some(item => item.id === product.id)}
        />
      ))}
    </div>
  );
};

export default ProductGrid;
