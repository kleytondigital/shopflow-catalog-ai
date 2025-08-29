
import React from "react";
import { Product } from "@/types/product";
import { ProductVariation } from "@/types/variation";
import { CatalogType } from "@/hooks/useCatalog";
import { useStorePriceModel } from "@/hooks/useStorePriceModel";
import { useCart } from "@/hooks/useCart";
import { PriceModelType } from "@/types/price-models";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Heart, ShoppingCart, Eye } from "lucide-react";
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

interface ModernTemplateProps {
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

const ModernTemplate: React.FC<ModernTemplateProps> = ({
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
      productCardStyle: "modern",
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
      // Se tem variações, abrir modal de detalhes
      onQuickView(product);
    } else {
      // Se não tem variações, adicionar direto ao carrinho
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
      className="group bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-300 border border-border/50 hover:border-primary/20 overflow-hidden"
      style={{
        borderRadius: `${settings.global.borderRadius}px`,
      }}
    >
      {/* Product Image with Carousel */}
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
          {modelKey === "wholesale_only" && (
            <Badge className="bg-blue-500 text-white text-xs">
              Atacado
            </Badge>
          )}
        </div>

        {/* Action Buttons */}
        <div className="absolute top-2 right-2 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button
            variant="secondary"
            size="sm"
            className="w-8 h-8 p-0 bg-white/90 backdrop-blur-sm"
            onClick={(e) => {
              e.stopPropagation();
              onAddToWishlist(product);
            }}
          >
            <Heart 
              className={`h-4 w-4 ${isInWishlist ? 'fill-red-500 text-red-500' : ''}`} 
            />
          </Button>
          {settings.productCard.showQuickView && (
            <Button
              variant="secondary"
              size="sm"
              className="w-8 h-8 p-0 bg-white/90 backdrop-blur-sm"
              onClick={(e) => {
                e.stopPropagation();
                onQuickView(product);
              }}
            >
              <Eye className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Card Content */}
      <div className="p-4">
        {/* Product Name */}
        <h3
          className="font-medium text-foreground mb-2 line-clamp-2"
          style={{
            fontSize: settings.global.fontSize.medium,
            color: settings.colors.text,
          }}
        >
          {product.name}
        </h3>

        {/* Category */}
        {product.category && (
          <p
            className="text-muted-foreground mb-2"
            style={{ fontSize: settings.global.fontSize.small }}
          >
            {product.category}
          </p>
        )}

        {/* Price */}
        {showPrices && (
          <div className="mb-3">
            {loading ? (
              <div className="text-muted-foreground">Carregando preço...</div>
            ) : (
              <>
                <div
                  className="font-semibold"
                  style={{
                    color: settings.colors.primary,
                    fontSize: settings.global.fontSize.large,
                  }}
                >
                  R$ {price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </div>
                {catalogType === 'wholesale' && product.min_wholesale_qty && (
                  <p
                    className="text-muted-foreground"
                    style={{ fontSize: settings.global.fontSize.small }}
                  >
                    Mín: {product.min_wholesale_qty} un.
                  </p>
                )}
              </>
            )}
          </div>
        )}

        {/* Stock */}
        {showStock && (
          <p
            className="text-muted-foreground mb-3"
            style={{ fontSize: settings.global.fontSize.small }}
          >
            Estoque: {product.stock} unidades
          </p>
        )}

        {/* Add to Cart Button */}
        {settings.productCard.showAddToCart && (
          <Button
            className="w-full"
            disabled={!isAvailable || loading}
            onClick={handleAddToCartClick}
            style={{
              backgroundColor: isAvailable && !loading ? settings.colors.primary : undefined,
              borderRadius: `${settings.global.borderRadius}px`,
            }}
          >
            <ShoppingCart className="h-4 w-4 mr-2" />
            {loading
              ? 'Carregando...'
              : hasVariations 
                ? 'Ver Opções' 
                : isAvailable 
                  ? 'Adicionar' 
                  : 'Esgotado'
            }
          </Button>
        )}
      </div>
    </div>
  );
};

export default ModernTemplate;
