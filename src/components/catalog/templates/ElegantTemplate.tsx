
import React from "react";
import { Product } from "@/types/product";
import { ProductVariation } from "@/types/variation";
import { CatalogType } from "@/hooks/useCatalog";
import { useStorePriceModel } from "@/hooks/useStorePriceModel";
import { PriceModelType } from "@/types/price-models";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Heart, Eye } from "lucide-react";
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

interface ElegantTemplateProps {
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

const ElegantTemplate: React.FC<ElegantTemplateProps> = ({
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
      borderRadius: 8,
      fontSize: {
        small: "14px",
        medium: "16px",
        large: "20px",
      },
      ...editorSettings.global,
    },
    productCard: {
      showQuickView: true,
      showAddToCart: true,
      productCardStyle: "default",
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
      className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden border group"
      style={{
        borderRadius: `${settings.global.borderRadius}px`,
        borderColor: settings.colors.surface,
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
              Destaque
            </Badge>
          )}
          {!isAvailable && (
            <Badge variant="destructive" className="text-xs">
              Esgotado
            </Badge>
          )}
          {hasVariations && (
            <Badge variant="secondary" className="text-xs">
              Variações
            </Badge>
          )}
        </div>

        {/* Quick actions overlay */}
        {settings.productCard.showQuickView && (
          <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-10 transition-all duration-200 flex items-center justify-center opacity-0 group-hover:opacity-100">
            <div className="flex gap-2">
              <button
                onClick={() => onQuickView(product)}
                className="bg-white text-gray-900 px-4 py-2 rounded-full text-sm font-medium shadow-lg hover:bg-gray-50 transition-colors"
                style={{
                  borderRadius: `${settings.global.borderRadius * 2}px`,
                  fontSize: settings.global.fontSize.small,
                }}
              >
                Visualizar
              </button>
              <button
                onClick={() => onAddToWishlist(product)}
                className="bg-white p-2 rounded-full shadow-lg hover:bg-gray-50 transition-colors"
                style={{
                  borderRadius: `${settings.global.borderRadius * 2}px`,
                }}
              >
                <Heart 
                  className={`h-4 w-4 ${isInWishlist ? 'fill-red-500 text-red-500' : 'text-gray-400'}`} 
                />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="p-4">
        {/* Product Name */}
        <h3
          className="font-medium text-gray-900 mb-2 line-clamp-2"
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
                  className="text-lg font-bold"
                  style={{
                    color: settings.colors.primary,
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
              ? `${product.stock} em estoque`
              : "Fora de estoque"}
          </div>
        )}

        {/* Actions */}
        {settings.productCard.showAddToCart && (
          <Button
            onClick={handleAddToCartClick}
            disabled={!isAvailable || loading}
            className="w-full text-white text-sm font-medium rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              backgroundColor: isAvailable && !loading ? settings.colors.primary : "#9CA3AF",
              borderRadius: `${settings.global.borderRadius}px`,
              fontSize: settings.global.fontSize.small,
            }}
          >
            {loading
              ? "Carregando..."
              : hasVariations
              ? "Ver Opções"
              : isAvailable
              ? "Adicionar"
              : "Sem estoque"}
          </Button>
        )}
      </div>
    </div>
  );
};

export default ElegantTemplate;
