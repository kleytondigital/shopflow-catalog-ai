import React from "react";
import { Product } from "@/types/product";
import { CatalogType } from "@/hooks/useCatalog";
import { useStorePriceModel } from "@/hooks/useStorePriceModel";
import { useShoppingCart } from "@/hooks/useShoppingCart";
import { PriceModelType } from "@/types/price-models";

export interface CatalogSettingsData {
  colors?: {
    primary: string;
    secondary: string;
    surface: string;
    text: string;
  };
  global?: {
    borderRadius: number;
    fontSize: {
      small: string;
      medium: string;
      large: string;
    };
  };
  productCard?: {
    showQuickView: boolean;
    showAddToCart: boolean;
    productCardStyle: string;
  };
}

interface IndustrialTemplateProps {
  product: Product;
  catalogType: CatalogType;
  onAddToCart: (product: Product) => void;
  onAddToWishlist: (product: Product) => void;
  onQuickView: (product: Product) => void;
  isInWishlist: boolean;
  showPrices: boolean;
  showStock: boolean;
  editorSettings?: CatalogSettingsData;
}

const IndustrialTemplate: React.FC<IndustrialTemplateProps> = ({
  product,
  catalogType,
  onAddToCart,
  onAddToWishlist,
  onQuickView,
  isInWishlist,
  showPrices,
  showStock,
  editorSettings = {},
}) => {
  const settings = {
    colors: {
      primary: "#374151",
      secondary: "#6B7280",
      surface: "#FFFFFF",
      text: "#111827",
      ...editorSettings.colors,
    },
    global: {
      borderRadius: 6,
      fontSize: {
        small: "12px",
        medium: "14px",
        large: "16px",
      },
      ...editorSettings.global,
    },
    productCard: {
      showQuickView: true,
      showAddToCart: true,
      productCardStyle: "industrial",
      ...editorSettings.productCard,
    },
  };

  const { addItem } = useShoppingCart();
  const { priceModel, loading } = useStorePriceModel(product.store_id);
  const modelKey = priceModel?.price_model || ("retail_only" as PriceModelType);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (loading) return;
    
    let qty = 1;
    let price = product.retail_price;

    if (modelKey === "wholesale_only") {
      qty = product.min_wholesale_qty || 1;
      price = product.wholesale_price || product.retail_price;
    }

    addItem(
      {
        ...product,
        price_model: modelKey,
        allow_negative_stock: product.allow_negative_stock ?? false
      },
      qty
    );
  };

  return (
    <div
      className="bg-white shadow-md rounded-md overflow-hidden transition-shadow hover:shadow-lg"
      style={{
        borderRadius: `${settings.global.borderRadius}px`,
      }}
    >
      {/* Product Image */}
      <div className="relative aspect-square bg-gray-100">
        {product.image_url ? (
          <img
            src={product.image_url}
            alt={product.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            <span>Sem imagem</span>
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="p-4">
        {/* Product Name */}
        <h3
          className="font-semibold text-gray-800 mb-2 line-clamp-2"
          style={{
            color: settings.colors.text,
            fontSize: settings.global.fontSize.medium,
          }}
        >
          {product.name}
        </h3>

        {/* Price */}
        {showPrices && (
          <div className="mb-3">
            {loading ? (
              <div className="text-gray-500">Carregando preço...</div>
            ) : modelKey === "wholesale_only" ? (
              <>
                <span
                  className="font-bold"
                  style={{
                    color: settings.colors.primary,
                    fontSize: settings.global.fontSize.large,
                  }}
                >
                  R$ {product.wholesale_price?.toFixed(2)}
                </span>
                {product.min_wholesale_qty && (
                  <div
                    className="text-xs text-gray-500 mt-1"
                    style={{ fontSize: settings.global.fontSize.small }}
                  >
                    Mín. {product.min_wholesale_qty} unidades
                  </div>
                )}
              </>
            ) : (
              <span
                className="font-bold"
                style={{
                  color: settings.colors.primary,
                  fontSize: settings.global.fontSize.large,
                }}
              >
                R$ {product.retail_price?.toFixed(2)}
              </span>
            )}
          </div>
        )}

        {/* Stock */}
        {showStock && (
          <div
            className="text-xs text-gray-500 mb-3"
            style={{ fontSize: settings.global.fontSize.small }}
          >
            {product.stock > 0
              ? `${product.stock} disponíveis`
              : "Indisponível"}
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2">
          {settings.productCard.showAddToCart && (
            <button
              onClick={handleAddToCart}
              disabled={product.stock <= 0 || loading}
              className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold py-2 px-4 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                fontSize: settings.global.fontSize.small,
              }}
            >
              {loading
                ? "Carregando..."
                : product.stock > 0
                ? "Adicionar"
                : "Indisponível"}
            </button>
          )}

          {settings.productCard.showQuickView && (
            <button
              onClick={() => onQuickView(product)}
              className="bg-gray-200 hover:bg-gray-300 text-gray-700 text-xs font-semibold py-2 px-4 rounded-md transition-colors"
              style={{
                fontSize: settings.global.fontSize.small,
              }}
            >
              Detalhes
            </button>
          )}

          <button
            onClick={() => onAddToWishlist(product)}
            className="text-gray-500 hover:text-gray-600 transition-colors"
            style={{
              fontSize: settings.global.fontSize.small,
            }}
          >
            <span
              className={`${
                isInWishlist ? "text-red-500" : "text-gray-400"
              }`}
            >
              ♥
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default IndustrialTemplate;
