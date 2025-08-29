
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

interface IndustrialTemplateProps {
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
      primary: "#0057FF",
      secondary: "#FF6F00",
      surface: "#FFFFFF",
      text: "#1E293B",
      ...editorSettings.colors,
    },
    global: {
      borderRadius: 4,
      fontSize: {
        small: "12px",
        medium: "14px",
        large: "18px",
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
      className="bg-gray-900 border border-gray-700 hover:border-gray-600 transition-all duration-200 overflow-hidden"
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
            <Badge className="bg-yellow-500 text-white text-xs">
              DESTAQUE
            </Badge>
          )}
          {!isAvailable && (
            <Badge className="bg-red-600 text-white text-xs">
              ESGOTADO
            </Badge>
          )}
          {hasVariations && (
            <Badge className="bg-gray-600 text-white text-xs">
              VARIAÇÕES
            </Badge>
          )}
        </div>

        {/* Industrial overlay */}
        {settings.productCard.showQuickView && (
          <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-30 transition-all duration-200 flex items-center justify-center opacity-0 hover:opacity-100">
            <button
              onClick={() => onQuickView(product)}
              className="bg-orange-500 text-white px-3 py-1 text-xs font-bold uppercase tracking-wide hover:bg-orange-600 transition-colors"
              style={{
                borderRadius: `${settings.global.borderRadius}px`,
                fontSize: settings.global.fontSize.small,
              }}
            >
              VISUALIZAR
            </button>
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="p-3 bg-gray-900">
        {/* Product Name */}
        <h3
          className="font-bold text-white mb-2 line-clamp-2 uppercase tracking-wide"
          style={{
            fontSize: settings.global.fontSize.medium,
          }}
        >
          {product.name}
        </h3>

        {/* Price */}
        {showPrices && (
          <div className="mb-3">
            {loading ? (
              <div className="text-gray-400">Carregando preço...</div>
            ) : (
              <>
                <span
                  className="text-orange-400 font-bold"
                  style={{
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
                    MÍN. {product.min_wholesale_qty} UNIDADES
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* Stock */}
        {showStock && (
          <div
            className="text-xs text-gray-400 mb-3 uppercase tracking-wide"
            style={{ fontSize: settings.global.fontSize.small }}
          >
            {product.stock > 0
              ? `${product.stock} EM ESTOQUE`
              : "FORA DE ESTOQUE"}
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2">
          {settings.productCard.showAddToCart && (
            <button
              onClick={handleAddToCartClick}
              disabled={!isAvailable || loading}
              className="flex-1 px-3 py-2 text-white text-xs font-bold uppercase tracking-wide transition-colors disabled:opacity-50 disabled:cursor-not-allowed border"
              style={{
                backgroundColor: isAvailable && !loading ? settings.colors.secondary : "#4B5563",
                borderColor: settings.colors.secondary,
                borderRadius: `${settings.global.borderRadius}px`,
                fontSize: settings.global.fontSize.small,
              }}
            >
              {loading
                ? "CARREGANDO..."
                : hasVariations
                ? "VER OPÇÕES"
                : isAvailable
                ? "ADICIONAR"
                : "SEM ESTOQUE"}
            </button>
          )}

          <button
            onClick={() => onAddToWishlist(product)}
            className="p-2 border border-gray-600 hover:border-orange-500 transition-colors"
            style={{
              borderRadius: `${settings.global.borderRadius}px`,
            }}
          >
            <span
              className={`text-sm ${
                isInWishlist ? "text-orange-500" : "text-gray-400"
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
