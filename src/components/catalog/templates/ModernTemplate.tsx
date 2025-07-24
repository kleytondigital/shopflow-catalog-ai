
import React from "react";
import { Product } from "@/types/product";
import { CatalogType } from "../CatalogExample";
import ProductCard from "../ProductCard";

export interface ModernTemplateProps {
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

const ModernTemplate: React.FC<ModernTemplateProps> = ({
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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="bg-gray-200 aspect-square rounded-xl mb-6"></div>
            <div className="space-y-3">
              <div className="h-5 bg-gray-200 rounded w-3/4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
      {products.map((product) => (
        <div key={product.id} className="group">
          <ProductCard
            product={product}
            catalogType={catalogType}
            onAddToCart={() => onAddToCart(product)}
            onAddToWishlist={() => onAddToWishlist(product)}
            onQuickView={() => onQuickView(product)}
            isInWishlist={isInWishlist(product.id)}
            showPrices={showPrices}
            showStock={showStock}
            storeId={storeId}
            className="bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 group-hover:scale-105"
            imageClassName="rounded-t-xl"
            contentClassName="p-6"
          />
        </div>
      ))}
    </div>
  );
};

export default ModernTemplate;
