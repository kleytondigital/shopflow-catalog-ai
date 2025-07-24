
import React from "react";
import { Product } from "@/types/product";
import { CatalogType } from "../CatalogExample";
import ProductCard from "../ProductCard";

export interface IndustrialTemplateProps {
  products: Product[];
  catalogType: CatalogType;
  onAddToCart: (product: Product) => void;
  onAddToWishlist: (product: Product) => void;
  onQuickView: (product: Product) => void;
  isInWishlist: (productId: string) => boolean;
  loading: boolean;
  showPrices: boolean;
  showStock: boolean;
  editorSettings: any;
  storeId?: string;
}

const IndustrialTemplate: React.FC<IndustrialTemplateProps> = ({
  products,
  catalogType,
  onAddToCart,
  onAddToWishlist,
  onQuickView,
  isInWishlist,
  loading,
  showPrices,
  showStock,
  editorSettings,
  storeId
}) => {
  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="bg-gray-300 aspect-square rounded mb-4"></div>
            <div className="space-y-2">
              <div className="h-4 bg-gray-300 rounded w-3/4"></div>
              <div className="h-4 bg-gray-300 rounded w-1/2"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {products.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          catalogType={catalogType}
          onAddToCart={() => onAddToCart(product)}
          onAddToWishlist={() => onAddToWishlist(product)}
          onQuickView={() => onQuickView(product)}
          isInWishlist={isInWishlist(product.id)}
          showPrices={showPrices}
          showStock={showStock}
          storeId={storeId}
          className="bg-gray-100 border-2 border-gray-400 hover:border-gray-600 transition-all duration-200"
          imageClassName="bg-gray-200"
          contentClassName="p-4 bg-gray-50"
        />
      ))}
    </div>
  );
};

export default IndustrialTemplate;
