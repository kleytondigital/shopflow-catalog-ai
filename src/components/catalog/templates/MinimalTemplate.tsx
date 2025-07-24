
import React from "react";
import { Product } from "@/types/product";
import { CatalogType } from "../CatalogExample";
import ProductCard from "@/components/catalog/ProductCard";
import { useCart } from "@/hooks/useCart";

export interface MinimalTemplateProps {
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
}

const MinimalTemplate: React.FC<MinimalTemplateProps> = ({
  products,
  catalogType,
  onAddToCart,
  onAddToWishlist,
  onQuickView,
  isInWishlist,
  loading,
  showPrices,
  showStock,
  editorSettings
}) => {
  const { addItem } = useCart();

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="bg-gray-200 aspect-square rounded-lg mb-4"></div>
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {products.map((product) => (
        <ProductCard
          key={product.id}
          id={product.id}
          name={product.name}
          retail_price={product.retail_price}
          wholesale_price={product.wholesale_price}
          min_wholesale_qty={product.min_wholesale_qty}
          image_url={product.image_url}
          store_id={product.store_id}
          stock={product.stock}
          allow_negative_stock={product.allow_negative_stock}
          catalogType={catalogType}
          showPrices={showPrices}
          showStock={showStock}
          onAddToCart={() => addItem(product)}
          onAddToWishlist={() => onAddToWishlist(product)}
          onQuickView={() => onQuickView(product)}
          isInWishlist={isInWishlist(product.id)}
        />
      ))}
    </div>
  );
};

export default MinimalTemplate;
