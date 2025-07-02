import React, { useState, memo, useCallback, useMemo } from "react";
import {
  Heart,
  ShoppingCart,
  Eye,
  Star,
  Share2,
  TrendingUp,
  AlertCircle,
  Crown,
  Sparkles,
  TrendingDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Product } from "@/hooks/useProducts";
import { CatalogType } from "@/hooks/useCatalog";
import { useProductVariations } from "@/hooks/useProductVariations";
import { useCart } from "@/hooks/useCart";
import { useCatalogMode } from "@/hooks/useCatalogMode";
import { useToast } from "@/hooks/use-toast";
import { createCartItem } from "@/utils/cartHelpers";
import ProductDetailsModal from "../ProductDetailsModal";
import { useProductPriceTiers } from "@/hooks/useProductPriceTiers";

interface ElegantTemplateProps {
  product: Product;
  catalogType: CatalogType;
  onAddToCart: (product: Product) => void;
  onAddToWishlist: (product: Product) => void;
  onQuickView: (product: Product) => void;
  isInWishlist: boolean;
  showPrices: boolean;
  showStock: boolean;
}

const ElegantTemplate: React.FC<ElegantTemplateProps> = memo(
  ({
    product,
    catalogType,
    onAddToCart,
    onAddToWishlist,
    onQuickView,
    isInWishlist,
    showPrices,
    showStock,
  }) => {
    const [imageLoaded, setImageLoaded] = useState(false);
    const [imageError, setImageError] = useState(false);
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [isHovered, setIsHovered] = useState(false);
    const { variations } = useProductVariations(product.id);
    const { addItem, items } = useCart();
    const { toast } = useToast();

    const {
      catalogMode,
      currentCatalogType,
      calculatePrice,
      shouldShowSavingsIndicator,
      calculatePotentialSavings,
    } = useCatalogMode();

    // Buscar níveis de preço do produto
    const { tiers, loading: tiersLoading } = useProductPriceTiers(
      product.id,
      product.store_id
    );

    // Usar variações do produto se disponíveis, senão usar do hook
    const productVariations = product.variations || variations || [];

    // Calcular quantidade atual no carrinho para este produto
    const cartQuantity = useMemo(() => {
      return items
        .filter((item) => item.product.id === product.id)
        .reduce((total, item) => total + item.quantity, 0);
    }, [items, product.id]);

    // Calcular preço baseado no modo e quantidade do carrinho
    const effectivePrice = useMemo(() => {
      return calculatePrice(product, cartQuantity + 1);
    }, [calculatePrice, product, cartQuantity]);

    // Calcular desconto potencial baseado nos níveis de preço
    const potentialSavings = useMemo(() => {
      if (!product.retail_price || tiersLoading || tiers.length <= 1) {
        return null;
      }

      // Filtrar apenas níveis ativos (exceto varejo)
      const activeTiers = tiers.filter(
        (tier) => tier.tier_order > 1 && tier.is_active
      );

      if (activeTiers.length === 0) {
        return null;
      }

      // Encontrar o nível com maior desconto
      const maxDiscountTier = activeTiers.reduce(
        (max, tier) => {
          const savingsAmount = product.retail_price - tier.price;
          const savingsPercentage =
            (savingsAmount / product.retail_price) * 100;
          return savingsPercentage > max.percentage
            ? { tier, percentage: savingsPercentage, amount: savingsAmount }
            : max;
        },
        { tier: activeTiers[0], percentage: 0, amount: 0 }
      );

      return {
        savings: maxDiscountTier.amount,
        savingsPercentage: maxDiscountTier.percentage,
        maxDiscountPercent: Math.round(maxDiscountTier.percentage),
        tier: maxDiscountTier.tier,
      };
    }, [product.retail_price, tiers, tiersLoading]);

    // Verificar se deve mostrar indicador de economia
    const showSavings = useMemo(() => {
      return shouldShowSavingsIndicator(product, cartQuantity + 1);
    }, [shouldShowSavingsIndicator, product, cartQuantity]);

    const price =
      catalogType === "wholesale"
        ? product.wholesale_price
        : product.retail_price;

    const discountPercentage =
      catalogType === "wholesale" && product.wholesale_price
        ? Math.round(
            ((product.retail_price - product.wholesale_price) /
              product.retail_price) *
              100
          )
        : 0;

    const handleShare = useCallback(async () => {
      const shareData = {
        title: product.name,
        text: product.description || "Confira este produto incrível!",
        url: window.location.href + `/produto/${product.id}`,
      };

      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        navigator.clipboard.writeText(shareData.url);
        toast({
          title: "Link copiado!",
          description:
            "O link do produto foi copiado para a área de transferência.",
        });
      }
    }, [product.name, product.description, product.id, toast]);

    const handleAddToCart = useCallback(
      (e: React.MouseEvent) => {
        e.stopPropagation();
        onAddToCart(product);
      },
      [onAddToCart, product]
    );

    const handleAddToWishlist = useCallback(() => {
      onAddToWishlist(product);
    }, [onAddToWishlist, product]);

    const handleQuickView = useCallback(() => {
      onQuickView(product);
    }, [onQuickView, product]);

    const handleImageLoad = useCallback(() => {
      setImageLoaded(true);
    }, []);

    const handleImageError = useCallback(() => {
      setImageError(true);
    }, []);

    const getStockStatus = () => {
      if (product.stock === 0) return { text: "Esgotado", color: "bg-red-500" };
      if (product.stock <= 5)
        return { text: "Últimas unidades", color: "bg-orange-500" };
      if (product.stock > 50)
        return { text: "Em estoque", color: "bg-green-500" };
      return { text: `${product.stock} disponíveis`, color: "bg-blue-500" };
    };

    const stockStatus = getStockStatus();

    // Função para renderizar as estrelas
    const renderStars = (rating: number) => {
      const fullStars = Math.floor(rating);
      const hasHalfStar = rating % 1 >= 0.5;
      const stars = [];

      for (let i = 0; i < 5; i++) {
        if (i < fullStars) {
          stars.push(
            <Star key={i} className="h-3 w-3 fill-amber-400 text-amber-400" />
          );
        } else if (i === fullStars && hasHalfStar) {
          stars.push(
            <div key={i} className="relative h-3 w-3">
              <Star className="h-3 w-3 text-gray-300 absolute" />
              <div className="overflow-hidden w-1/2">
                <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
              </div>
            </div>
          );
        } else {
          stars.push(<Star key={i} className="h-3 w-3 text-gray-300" />);
        }
      }
      return stars;
    };

    return (
      <>
        <Card
          className="group hover:shadow-2xl transition-all duration-500 hover:scale-[1.02] overflow-hidden bg-gradient-to-br from-white via-amber-50/20 to-white border border-amber-200/50 cursor-pointer"
          onClick={handleQuickView}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <CardContent className="p-0">
            {/* Borda dourada elegante */}
            <div className="absolute inset-0 bg-gradient-to-r from-amber-200/20 via-amber-300/20 to-amber-200/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-lg"></div>

            {/* Image Container */}
            <div className="relative aspect-square overflow-hidden bg-gradient-to-br from-amber-50 to-white">
              {!imageError ? (
                <img
                  src={product.image_url || "/placeholder.svg"}
                  alt={product.name}
                  className={`w-full h-full object-cover transition-all duration-700 group-hover:scale-110 ${
                    imageLoaded ? "opacity-100" : "opacity-0"
                  } ${isHovered ? "scale-110" : "scale-100"}`}
                  onLoad={handleImageLoad}
                  onError={handleImageError}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-amber-400">
                  <AlertCircle className="h-12 w-12" />
                </div>
              )}

              {/* Overlay elegante */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

              {/* Ações rápidas */}
              <div
                className={`absolute top-2 right-2 flex flex-col gap-2 transition-opacity duration-300 ${
                  isHovered ? "opacity-100" : "opacity-0"
                }`}
              >
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowDetailsModal(true);
                  }}
                  className="w-9 h-9 p-0 bg-white/95 hover:bg-white shadow-lg backdrop-blur-sm rounded-full border-2 border-amber-200 transition-all duration-200"
                >
                  <Eye className="h-4 w-4 text-amber-700 hover:text-blue-600 transition-colors duration-200" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleAddToWishlist();
                  }}
                  className="w-9 h-9 p-0 bg-white/95 hover:bg-white shadow-lg backdrop-blur-sm rounded-full border-2 border-amber-200 transition-all duration-200"
                >
                  <Heart
                    className={`h-4 w-4 ${
                      isInWishlist
                        ? "fill-red-500 text-red-500"
                        : "text-amber-600 hover:text-red-500 transition-colors duration-200"
                    }`}
                  />
                </Button>
              </div>

              {/* Discount Badge - Top Left */}
              {product.wholesale_price && product.retail_price && (
                <Badge className="absolute top-2 left-2 bg-gradient-to-r from-amber-500 to-amber-600 text-white text-xs px-2 py-1 font-bold shadow-lg">
                  <Sparkles className="h-3 w-3 mr-1" />-
                  {Math.round(
                    ((product.retail_price - product.wholesale_price) /
                      product.retail_price) *
                      100
                  )}
                  %
                </Badge>
              )}

              {/* Desconto potencial (níveis progressivos) */}
              {potentialSavings && potentialSavings.savingsPercentage > 0 && (
                <Badge className="absolute top-2 left-20 bg-gradient-to-r from-orange-500 to-orange-600 text-white text-xs px-2 py-1 font-bold shadow-lg">
                  <TrendingDown className="h-3 w-3 mr-1" />
                  Até -{potentialSavings.maxDiscountPercent}%
                </Badge>
              )}

              {/* Stock Badge - Bottom Right */}
              {showStock && (
                <Badge
                  className={`absolute bottom-2 right-2 ${stockStatus.color} text-white text-xs px-2 py-1 shadow-lg`}
                >
                  {stockStatus.text}
                </Badge>
              )}
            </div>

            {/* Product Info */}
            <div className="p-4 space-y-3">
              {/* Category */}
              {product.category && (
                <p className="text-xs text-amber-600 uppercase tracking-wider font-semibold">
                  {product.category}
                </p>
              )}

              {/* Product Name */}
              <h3 className="font-semibold text-gray-900 line-clamp-2 text-sm leading-5 min-h-[40px]">
                {product.name}
              </h3>

              {/* Rating */}
              <div className="flex items-center gap-1">
                <div className="flex gap-0.5">
                  {renderStars(
                    3.5 +
                      Math.abs(
                        product.id
                          .split("")
                          .reduce((a, b) => (a << 5) - a + b.charCodeAt(0), 0) %
                          15
                      ) /
                        10
                  )}
                </div>
                <span className="text-xs text-gray-500">
                  (
                  {Math.floor(
                    5 +
                      (product.name.length + ((product.retail_price || 0) % 45))
                  )}
                  )
                </span>
              </div>

              {/* Prices */}
              {showPrices && (
                <div className="space-y-1">
                  {/* Retail Price */}
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-600">Varejo:</span>
                    <span className="font-bold text-gray-900">
                      R$ {product.retail_price?.toFixed(2)}
                    </span>
                  </div>

                  {/* Wholesale Price */}
                  {product.wholesale_price && (
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-amber-600">Atacado:</span>
                      <span className="font-bold text-amber-600">
                        R$ {product.wholesale_price.toFixed(2)}
                      </span>
                    </div>
                  )}
                </div>
              )}

              {/* Indicador de economia potencial */}
              {potentialSavings && potentialSavings.savingsPercentage > 0 && (
                <div className="p-2 bg-orange-50 border border-orange-200 rounded-lg">
                  <div className="flex items-center gap-2 text-orange-700">
                    <TrendingDown className="h-3 w-3" />
                    <span className="text-xs font-medium">
                      Economize até R$ {potentialSavings.savings.toFixed(2)}
                      {potentialSavings.tier && (
                        <span className="text-orange-600">
                          {" "}
                          ({potentialSavings.tier.tier_name})
                        </span>
                      )}
                    </span>
                  </div>
                </div>
              )}

              {/* Add to Cart Button */}
              <Button
                onClick={handleAddToCart}
                disabled={product.stock === 0}
                className="w-full mt-3 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white text-sm py-2 shadow-lg"
                size="sm"
              >
                <ShoppingCart className="h-4 w-4 mr-2" />
                {product.stock === 0
                  ? "Esgotado"
                  : productVariations.length > 0
                  ? "Ver Opções"
                  : "Comprar"}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Product Details Modal */}
        {showDetailsModal && (
          <ProductDetailsModal
            product={product}
            isOpen={showDetailsModal}
            onClose={() => setShowDetailsModal(false)}
            onAddToCart={(quantity, variation) => {
              const cartItem = createCartItem(
                product,
                catalogType,
                quantity,
                variation
              );
              addItem(cartItem);

              toast({
                title: "Produto adicionado!",
                description: `${product.name} foi adicionado ao carrinho.`,
              });
            }}
            catalogType={catalogType}
          />
        )}
      </>
    );
  }
);

ElegantTemplate.displayName = "ElegantTemplate";

export default ElegantTemplate;
