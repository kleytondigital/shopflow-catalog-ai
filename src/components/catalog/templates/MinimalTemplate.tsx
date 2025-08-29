
import React from "react";
import { Product } from "@/types/product";
import { ProductVariation } from "@/types/variation";
import { CatalogType } from "@/hooks/useCatalog";
import { useStorePriceModel } from "@/hooks/useStorePriceModel";
import { PriceModelType } from "@/types/price-models";
import { Badge } from "@/components/ui/badge";
import ProductCardCarousel from "../ProductCardCarousel";

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

interface MinimalTemplateProps {
  product: Product;
  catalogType: CatalogType;
  onAddToCart: (product: Product, quantity?: number, variation?: ProductVariation) => void;
  onAddToWishlist: (product: Product) => void;
  onQuickView: (product: Product) => void;
  isInWishlist: boolean;
  showPrices: boolean;
  showStock: boolean;
  editorSettings?: CatalogSettingsData;
}

const MinimalTemplate: React.FC<MinimalTemplateProps> = ({
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
      primary: "#000000",
      secondary: "#FFFFFF",
      surface: "#F9FAFB",
      text: "#111827",
      ...editorSettings.colors,
    },
    global: {
      borderRadius: 0,
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
      productCardStyle: "minimal",
      ...editorSettings.productCard,
    },
  };

  const { priceModel, loading } = useStorePriceModel(product.store_id);
  const modelKey = priceModel?.price_model || ("retail_only" as PriceModelType);

  // Verificar se produto tem variações
  const hasVariations = product.variations && product.variations.length > 0;
  const isAvailable = product.stock > 0;

  // Função para lidar com clique no botão de adicionar
  const handleAddToCartClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (loading) return;
    
    if (hasVariations) {
      onQuickView(product);
    } else {
      let qty = 1;
      if (modelKey === "wholesale_only" && product.min_wholesale_qty) {
        qty = product.min_wholesale_qty;
      }
      onAddToCart(product, qty);
    }
  };

  // Obter preço baseado no catalogType
  const getPrice = () => {
    if (catalogType === 'wholesale' && product.wholesale_price) {
      return product.wholesale_price;
    }
    return product.retail_price;
  };

  const price = getPrice();

  return (
    <div
      className="bg-white hover:bg-gray-50 transition-colors duration-200 overflow-hidden border-b border-gray-200"
      style={{
        borderRadius: `${settings.global.borderRadius}px`,
      }}
    >
      {/* Product Image */}
      <div className="relative">
        <ProductCardCarousel
          productId={product.id || ''}
          productName={product.name}
          onImageClick={() => onQuickView(product)}
          autoPlay={true}
          autoPlayInterval={4000}
        />

        {/* Badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {product.is_featured && (
            <Badge className="bg-black text-white text-xs">
              Destaque
            </Badge>
          )}
          {!isAvailable && (
            <Badge className="bg-gray-500 text-white text-xs">
              Esgotado
            </Badge>
          )}
          {hasVariations && (
            <Badge className="bg-gray-700 text-white text-xs">
              Variações
            </Badge>
          )}
        </div>

        {/* Minimal overlay */}
        {settings.productCard.showQuickView && (
          <div className="absolute inset-0 bg-white bg-opacity-0 hover:bg-opacity-80 transition-all duration-200 flex items-center justify-center opacity-0 hover:opacity-100">
            <button
              onClick={() => onQuickView(product)}
              className="text-black text-xs uppercase tracking-wider underline hover:no-underline transition-all"
              style={{
                fontSize: settings.global.fontSize.small,
              }}
            >
              Ver detalhes
            </button>
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="p-4">
        {/* Product Name */}
        <h3
          className="font-light text-gray-900 mb-2 line-clamp-2"
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
            ) : (
              <>
                <span
                  className="font-light"
                  style={{
                    color: settings.colors.text,
                    fontSize: settings.global.fontSize.large,
                  }}
                >
                  R$ {price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </span>
                {catalogType === 'wholesale' && product.min_wholesale_qty && (
                  <div
                    className="text-xs text-gray-500 mt-1"
                    style={{ fontSize: settings.global.fontSize.small }}
                  >
                    Mín. {product.min_wholesale_qty} unidades
                  </div>
                )}
              </>
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
        <div className="flex gap-3 items-center">
          {settings.productCard.showAddToCart && (
            <button
              onClick={handleAddToCartClick}
              disabled={!isAvailable || loading}
              className="text-xs uppercase tracking-wider underline hover:no-underline transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                color: isAvailable && !loading ? settings.colors.text : "#9CA3AF",
                fontSize: settings.global.fontSize.small,
              }}
            >
              {loading
                ? "Carregando..."
                : hasVariations
                ? "Ver Opções"
                : isAvailable
                ? "Adicionar"
                : "Indisponível"}
            </button>
          )}

          <button
            onClick={() => onAddToWishlist(product)}
            className="text-xs uppercase tracking-wider underline hover:no-underline transition-all"
            style={{
              fontSize: settings.global.fontSize.small,
            }}
          >
            <span
              className={`${isInWishlist ? "text-black" : "text-gray-400"}`}
            >
              ♥
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default MinimalTemplate;
